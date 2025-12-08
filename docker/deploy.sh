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

# Ensure uploads directory exists and is writable
echo "📂 Setting up upload directory..."
mkdir -p public/uploads
chmod 777 public/uploads

# 2. Build and start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

# 3. Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# 4. Run migrations and seed
echo "🔄 Running database migrations and seeding..."
# Use db push to sync schema (accepting data loss for dev/prototype speed)
docker-compose exec -T app npx prisma migrate deploy --schema=src/prisma/schema.prisma
docker-compose exec -T app node scripts/dist/seed-genres.js
docker-compose exec -T app node scripts/dist/seed-admin.js
docker-compose exec -T app node scripts/dist/seed-dummy.js

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
