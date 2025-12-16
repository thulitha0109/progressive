#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes (uncomment if using git on server)
# git pull origin main

# Load .env file if it exists
if [ -f .env ]; then
  echo "📄 Loading environment variables from .env..."
  export $(cat .env | xargs)
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
chmod 777 public/uploads

# 2. Build and start containers
echo "📦 Building and starting containers..."
docker compose up -d --build

# 3. Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 20

# 4. Run migrations only (no full seeding for existing data)
echo "🔄 Running database migrations..."
docker compose exec -T app npx prisma migrate deploy --schema=src/prisma/schema.prisma

# 5. Seed essential production data (Admin, Genres)
echo "🌱 Seeding production data..."
docker compose exec -T app node scripts/dist/seed-prod.js

echo "✅ Deployment complete! App is running on ${AUTH_URL:-http://localhost:3003}"
