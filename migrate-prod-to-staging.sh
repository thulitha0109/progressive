#!/bin/bash
set -euo pipefail

# ===== CONFIG =====
PROD_HOST="${PROD_HOST:-38.242.236.12}"
TARGET_HOST="${TARGET_HOST:-85.208.51.242}"
SSH_PORT="${SSH_PORT:-2233}"
TARGET_USER="${TARGET_USER:-thulitha}"   # change if needed
TARGET_DIR="${TARGET_DIR:-/tmp}"
TARGET_NAME="${TARGET_NAME:-staging}"
DB_NAME="${DB_NAME:-progressive_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-Progressive123}"

# MinIO config
PROD_MINIO_URL="${PROD_MINIO_URL:-http://38.242.236.12:9000}"
TARGET_MINIO_URL="${TARGET_MINIO_URL:-http://85.208.51.242:9000}"
PROD_MINIO_ACCESS_KEY="${PROD_MINIO_ACCESS_KEY:-}"
PROD_MINIO_SECRET_KEY="${PROD_MINIO_SECRET_KEY:-}"
TARGET_MINIO_ACCESS_KEY="${TARGET_MINIO_ACCESS_KEY:-}"
TARGET_MINIO_SECRET_KEY="${TARGET_MINIO_SECRET_KEY:-}"
BUCKET_NAME="${BUCKET_NAME:-progressive-uploads}"

# Optional: if you want to redeploy after migration
RUN_DEPLOY="${RUN_DEPLOY:-0}"

DUMP_FILE="/tmp/${DB_NAME}.dump"
REMOTE_DUMP="/tmp/${DB_NAME}.dump"

echo "==> Creating PostgreSQL dump from prod..."
if command -v pv >/dev/null 2>&1; then
  docker exec -t progressive-postgres-1 pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --format=custom --no-owner --no-privileges | pv > "$DUMP_FILE"
else
  docker exec -t progressive-postgres-1 pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --format=custom --no-owner --no-privileges > "$DUMP_FILE"
fi

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "==> PostgreSQL dump created: $DUMP_FILE ($DUMP_SIZE)"

echo "==> Copying DB dump to target server..."
if command -v pv >/dev/null 2>&1; then
  pv "$DUMP_FILE" | ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "cat > '$REMOTE_DUMP'"
else
  scp -P "$SSH_PORT" "$DUMP_FILE" "$TARGET_USER@$TARGET_HOST:$REMOTE_DUMP"
fi
echo "==> DB dump copied to target server: $REMOTE_DUMP"

echo "==> Stopping target app before DB restore..."
ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
set -euo pipefail
cd ~/docker/progressive || true
# Stop only app-related services so postgres/minio remain available for restore
(docker compose stop app init-job || true)
"

echo "==> Restoring DB on target server..."
ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
set -euo pipefail
POSTGRES_CONTAINER=\$(docker ps --filter 'name=postgres' --format '{{.Names}}' | head -n 1)
if [ -z \"\$POSTGRES_CONTAINER\" ]; then
  echo '[target] postgres container not found' >&2
  exit 1
fi
echo \"[target] using postgres container: \$POSTGRES_CONTAINER\"
docker cp '$REMOTE_DUMP' \"\$POSTGRES_CONTAINER:/tmp/${DB_NAME}.dump\"
echo '[target] terminating active sessions for $DB_NAME'
docker exec \"\$POSTGRES_CONTAINER\" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();\"
echo '[target] dropping existing database'
docker exec \"\$POSTGRES_CONTAINER\" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"DROP DATABASE IF EXISTS $DB_NAME;\"
echo '[target] recreating database'
docker exec \"\$POSTGRES_CONTAINER\" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"CREATE DATABASE $DB_NAME OWNER postgres;\"
echo '[target] restoring database from dump (this may take a few minutes)...'
docker exec \"\$POSTGRES_CONTAINER\" pg_restore -U postgres -d $DB_NAME --verbose --clean --if-exists --no-owner --no-privileges /tmp/${DB_NAME}.dump
"
echo "==> Database restore completed on target server"

echo "==> Showing DB table count on target after restore..."
ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
docker exec \$(docker ps --filter 'name=postgres' --format '{{.Names}}' | head -n 1) psql -U postgres -d $DB_NAME -c \"SELECT schemaname, relname FROM pg_stat_user_tables ORDER BY schemaname, relname LIMIT 20;\""

echo "==> Mirroring MinIO objects..."
mc alias set prod "$PROD_MINIO_URL" "$PROD_MINIO_ACCESS_KEY" "$PROD_MINIO_SECRET_KEY"
mc alias set "$TARGET_NAME" "$TARGET_MINIO_URL" "$TARGET_MINIO_ACCESS_KEY" "$TARGET_MINIO_SECRET_KEY"
mc stat --json "prod/$BUCKET_NAME" 2>/dev/null | head -n 5 || true
SOURCE_OBJECT_COUNT=$(mc ls "prod/$BUCKET_NAME" --recursive 2>/dev/null | wc -l | tr -d ' ')
echo "==> Source bucket object count: $SOURCE_OBJECT_COUNT"
echo "==> Starting MinIO mirror from prod bucket to target bucket (copying $SOURCE_OBJECT_COUNT objects)..."
mc mirror --overwrite --remove "prod/$BUCKET_NAME" "$TARGET_NAME/$BUCKET_NAME" --progress
TARGET_OBJECT_COUNT=$(mc ls "$TARGET_NAME/$BUCKET_NAME" --recursive 2>/dev/null | wc -l | tr -d ' ')
echo "==> MinIO mirror completed for bucket: $BUCKET_NAME"
echo "==> Target bucket object count: $TARGET_OBJECT_COUNT"
if [ "$SOURCE_OBJECT_COUNT" != "$TARGET_OBJECT_COUNT" ]; then
  echo "[error] MinIO object count mismatch: source=$SOURCE_OBJECT_COUNT target=$TARGET_OBJECT_COUNT" >&2
  exit 1
fi
echo "==> MinIO object count verified: source and target match"

if [ "$RUN_DEPLOY" = "1" ]; then
  echo "==> Redeploying target app..."
  ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
    cd ~/docker/progressive && ./docker/deploy.sh
  "
else
  echo "==> Starting target app after migration..."
  ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
    cd ~/docker/progressive && docker compose up -d --build
  "
fi

echo "==> Migration completed successfully."
echo "==> Summary:"
echo "   - Database dump: $DUMP_FILE"
echo "   - Target DB: $DB_NAME"
echo "   - Target bucket: $BUCKET_NAME"
echo "   - Target host: $TARGET_HOST"