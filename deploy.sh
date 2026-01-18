#!/bin/bash
set -e

echo "🚀 Starting Production Deployment..."

# Ensure we are in the project root
cd "$(dirname "$0")"

# 1. Build and Start Containers (Force recreate to ensure fresh config)
echo "📦 Building and starting containers..."
docker compose -f docker-compose.yml up -d --build --force-recreate --remove-orphans

# 2. Wait for Database to be ready
echo "⏳ Waiting for database to initialize..."
sleep 10

# 3. Run Database Migrations
echo "🔄 Running database migrations..."
docker compose -f docker-compose.yml exec app npx prisma migrate deploy --schema=./src/prisma/schema.prisma

echo "✅ Deployment complete!"
echo "👉 Application is running at: http://localhost:3003"
echo "👉 MinIO Console: http://localhost:9001"
