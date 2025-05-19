#!/bin/sh

# Set environment variables for Next.js
export NODE_ENV=production
export PORT=3000
export POSTGRES_URL="postgres://dummy:dummy@localhost:5432/dummy"
export NEXTAUTH_SECRET="dummy-secret"
export NEXTAUTH_URL="http://localhost:3000"

# Start Next.js server in the background
echo "Starting Next.js server..."
cd /app && node server.js &
NEXT_PID=$!

# Wait for Next.js to start
echo "Waiting for Next.js server to start..."
sleep 5

# Check if Next.js server is running
if kill -0 $NEXT_PID 2>/dev/null; then
    echo "Next.js server started successfully on port 3000"
else
    echo "Failed to start Next.js server"
    exit 1
fi

# Start Nginx
echo "Starting Nginx..."
nginx -g "daemon off;"
