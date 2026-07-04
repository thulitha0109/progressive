#!/bin/bash
set -euo pipefail

# ===== CONFIG =====
PROD_HOST="${PROD_HOST:-38.242.236.12}"
TARGET_HOST="${TARGET_HOST:-85.208.51.242}"
SSH_PORT="${SSH_PORT:-2233}"
TARGET_USER="${TARGET_USER:-root}"   # change if needed
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
docker exec -t progressive-postgres-1 pg_dump -U "$DB_USER" -d "$DB_NAME" \
  --format=custom --no-owner --no-privileges > "$DUMP_FILE"

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "==> PostgreSQL dump created: $DUMP_FILE ($DUMP_SIZE)"

echo "==> Copying DB dump to target server..."
scp -P "$SSH_PORT" "$DUMP_FILE" "$TARGET_USER@$TARGET_HOST:$REMOTE_DUMP"
echo "==> DB dump copied to target server: $REMOTE_DUMP"

echo "==> Stopping target app before DB restore..."
ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
set -euo pipefail
cd ~/docker/progressive || true
docker compose down || true
"

echo "==> Restoring DB on target server..."
ssh -p "$SSH_PORT" "$TARGET_USER@$TARGET_HOST" "
set -euo pipefail
echo '[target] copying dump into postgres container'
docker cp '$REMOTE_DUMP' progressive-postgres-1:/tmp/${DB_NAME}.dump
echo '[target] terminating active sessions for $DB_NAME'
docker exec progressive-postgres-1 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();\"
echo '[target] dropping existing database'
docker exec progressive-postgres-1 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"DROP DATABASE IF EXISTS $DB_NAME;\"
echo '[target] recreating database'
docker exec progressive-postgres-1 psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \"CREATE DATABASE $DB_NAME OWNER postgres;\"
echo '[target] restoring database from dump'
docker exec progressive-postgres-1 pg_restore -U postgres -d $DB_NAME --clean --if-exists --no-owner --no-privileges /tmp/${DB_NAME}.dump
"
echo "==> Database restore completed on target server"

echo "==> Mirroring MinIO objects..."
mc alias set prod "$PROD_MINIO_URL" "$PROD_MINIO_ACCESS_KEY" "$PROD_MINIO_SECRET_KEY"
mc alias set "$TARGET_NAME" "$TARGET_MINIO_URL" "$TARGET_MINIO_ACCESS_KEY" "$TARGET_MINIO_SECRET_KEY"
mc mirror --overwrite --remove --quiet "prod/$BUCKET_NAME" "$TARGET_NAME/$BUCKET_NAME"
echo "==> MinIO mirror completed for bucket: $BUCKET_NAME"

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