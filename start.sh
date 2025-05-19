#!/bin/sh

# Start Next.js server in the background
cd /app && node server.js &

# Start Nginx
nginx -g "daemon off;"
