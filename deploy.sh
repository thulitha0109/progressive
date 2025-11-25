#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes (uncomment if using git on server)
# git pull origin main

# 2. Build and start containers
echo "📦 Building and starting containers..."
docker build --network=host -t progressive-app .
docker-compose up -d

# 3. Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# 4. Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo "✅ Deployment complete! App is running on http://localhost:3000"
