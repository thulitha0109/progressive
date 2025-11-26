#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes (uncomment if using git on server)
# git pull origin main

# 2. Build and start containers
# 2. Build and start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

# 3. Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# 4. Run migrations and seed
echo "🔄 Running database migrations and seeding..."
docker-compose exec -T app npx prisma migrate deploy
docker-compose exec -T app node scripts/seed-dummy.js

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
