#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting DEV deployment..."

# Load .env file if it exists
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env..."
  set -a  # automatically export all variables
  source .env
  set +a
fi

# Generate AUTH_SECRET if not set
if [ -z "$AUTH_SECRET" ]; then
  echo "⚠️ AUTH_SECRET not set. Generating a temporary one..."
  export AUTH_SECRET=$(openssl rand -base64 32)
fi

# Prefer an internal container DB URL for compose services, while still supporting
# externally provided DATABASE_URL values for non-container deployments.
if [ -z "$DATABASE_URL_INTERNAL" ]; then
  if [ -n "$DATABASE_URL" ]; then
    export DATABASE_URL_INTERNAL="${DATABASE_URL/localhost/postgres}"
    export DATABASE_URL_INTERNAL="${DATABASE_URL_INTERNAL/127.0.0.1/postgres}"
    export DATABASE_URL_INTERNAL="${DATABASE_URL_INTERNAL/::1/postgres}"
  else
    export DATABASE_URL_INTERNAL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-progressive}"
  fi
fi

# Ensure uploads directory exists and is writable
echo "📂 Setting up upload directory..."
mkdir -p public/uploads
chmod -R 777 public/uploads 2>/dev/null || true

# Build and start containers with dev project name and override file
echo "📦 Building and starting DEV containers..."
docker compose -p progressive-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build --renew-anon-volumes

# Follow init-job logs to show setup progress
echo "🔄 Running migrations and database seeding..."
docker compose -p progressive-dev logs -f init-job

# Check if init-job succeeded
INIT_JOB_EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' progressive-dev-init-job-1 2>/dev/null || echo "1")
if [ "$INIT_JOB_EXIT_CODE" != "0" ]; then
  echo "❌ Database initialization job failed! Please run 'docker compose -p progressive-dev logs init-job' for details."
  exit 1
fi

echo "✅ DEV Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
