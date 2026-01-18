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

# Ensure uploads directory exists and is writable
echo "📂 Setting up upload directory..."
mkdir -p public/uploads
chmod -R 777 public/uploads

# Build and start containers with dev project name and override file
echo "📦 Building and starting DEV containers..."
docker compose -p progressive-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 20

# Run migrations only
echo "🔄 Running database migrations..."
docker compose -p progressive-dev exec -T app npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Seed development data
echo "🌱 Seeding DEV data..."
docker compose -p progressive-dev exec -T app node scripts/dist/seed-dev.js

echo "✅ DEV Deployment complete! App is running on ${AUTH_URL:-http://localhost:3004}"
