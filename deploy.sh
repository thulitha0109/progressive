#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes (uncomment if using git on server)
# git pull origin main

# 2. Build and start containers
# Generate AUTH_SECRET if not set
if [ -z "$AUTH_SECRET" ]; then
  echo "⚠️ AUTH_SECRET not set. Generating a temporary one..."
  export AUTH_SECRET=$(openssl rand -base64 32)
fi

# 2. Build and start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

# 3. Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# 4. Run migrations and seed
echo "🔄 Running database migrations and seeding..."
# Force use of prisma@5.22.0 to match project version and avoid v7 breaking changes
docker-compose exec -T app npx prisma@5.22.0 migrate deploy
docker-compose exec -T app node scripts/seed-genres.js
docker-compose exec -T app node scripts/seed-admin.js
docker-compose exec -T app node scripts/seed-dummy.js

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
