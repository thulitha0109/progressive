#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Load .env file if it exists
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env..."
  set -a  # automatically export all variables
  source .env
  set +a
fi

# 2. Build and start containers
# Generate AUTH_SECRET if not set
if [ -z "$AUTH_SECRET" ]; then
  echo "⚠️ AUTH_SECRET not set. Generating a temporary one..."
  export AUTH_SECRET=$(openssl rand -base64 32)
fi

# Prefer an internal container DB URL for compose services, while still supporting
# externally provided DATABASE_URL values when no explicit DB_* overrides are present.
export DB_HOST="${DB_HOST:-postgres}"
export DB_PORT="${DB_PORT:-5432}"
export DB_USER="${DB_USER:-${POSTGRES_USER:-postgres}}"
export DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-password}}"
export DB_NAME="${DB_NAME:-${POSTGRES_DB:-progressive}}"
export POSTGRES_USER="${POSTGRES_USER:-$DB_USER}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$DB_PASSWORD}"
export POSTGRES_DB="${POSTGRES_DB:-$DB_NAME}"

if [ -z "$DATABASE_URL_INTERNAL" ]; then
  if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ] && [ -z "$DB_PORT" ] && [ -z "$DB_NAME" ] && [ -z "$DB_USER" ] && [ -z "$DB_PASSWORD" ]; then
    export DATABASE_URL_INTERNAL="${DATABASE_URL/localhost/postgres}"
    export DATABASE_URL_INTERNAL="${DATABASE_URL_INTERNAL/127.0.0.1/postgres}"
    export DATABASE_URL_INTERNAL="${DATABASE_URL_INTERNAL/::1/postgres}"
  else
    export DATABASE_URL_INTERNAL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  fi
fi

# Ensure uploads directory exists and is writable
echo "📂 Setting up upload directory..."
mkdir -p public/uploads
chmod -R 777 public/uploads 2>/dev/null || true

echo "📦 Building and starting containers..."
docker compose up -d --build --renew-anon-volumes

# Follow init-job logs to show setup progress
echo "🔄 Running migrations, seeding, and storage initialization..."
docker compose logs -f init-job

# Check if init-job succeeded
INIT_JOB_CONTAINER=$(docker compose ps -q init-job 2>/dev/null | head -n 1)
if [ -z "$INIT_JOB_CONTAINER" ]; then
  INIT_JOB_CONTAINER=$(docker ps --filter "name=init-job" --format "{{.ID}}" | head -n 1)
fi
INIT_JOB_EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' "$INIT_JOB_CONTAINER" 2>/dev/null || echo "1")
if [ "$INIT_JOB_EXIT_CODE" != "0" ]; then
  echo "❌ Database initialization job failed! Please run 'docker compose logs init-job' for details."
  exit 1
fi

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
