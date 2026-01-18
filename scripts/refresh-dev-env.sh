#!/bin/bash

echo "🔍 Checking Docker permissions..."

# Check if we can run docker without sudo
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Permission denied. Attempting to run with 'sudo'..."
    DOCKER="sudo docker"
    
    # Try to fix group permanently (requires password)
    echo "🔧 Attempting to add user '$USER' to 'docker' group..."
    if sudo usermod -aG docker $USER; then
        echo "✅ User added to docker group. You will need to log out and back in for this to take full effect without 'sudo'."
    fi
else
    echo "✅ Docker permissions look good."
    DOCKER="docker"
fi

echo "🧹 Cleaning up existing 'progressive' items..."
# Stop all containers
$DOCKER compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans

# Force kill any lingering containers related to the project
CONTAINERS=$($DOCKER ps -aq --filter "name=progressive")
if [ ! -z "$CONTAINERS" ]; then
    echo "💥 Force removing conflicting containers..."
    $DOCKER rm -f $CONTAINERS
fi

# Also check for specific ports just in case
PORTS="5433 9000 3003 5434 9002 3004"
for PORT in $PORTS; do
    PID=$($DOCKER ps -q --filter "publish=$PORT")
    if [ ! -z "$PID" ]; then
        echo "🚫 Removing container hogging port $PORT..."
        $DOCKER rm -f $PID
    fi
done

echo "🚀 Building and Starting Dev Environment..."
# Run the build and up command
$DOCKER compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo "✅ Done! Use '$DOCKER compose logs -f' to follow logs."
