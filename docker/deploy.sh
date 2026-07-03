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
INIT_JOB_EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' progressive-init-job-1 2>/dev/null || echo "1")
if [ "$INIT_JOB_EXIT_CODE" != "0" ]; then
  echo "❌ Database initialization job failed! Please run 'docker compose logs init-job' for details."
  exit 1
fi

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
