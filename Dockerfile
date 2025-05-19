# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install Python and other build dependencies
RUN apk add --no-cache python3 make g++ gcc

# Copy package files
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./

# Install dependencies
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else npm i; \
  fi

# Copy all files
COPY . .

# Set environment variables for production
ENV NODE_ENV production

# Build the Next.js app with standalone output
RUN npm run build

# Stage 2: Setup Nginx to serve the application
FROM nginx:alpine

# Install Node.js
RUN apk add --update nodejs npm

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the builder stage
COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Set Next.js server port
ENV PORT 3000

# Expose port 80
EXPOSE 80

# Start Next.js and Nginx
CMD ["/start.sh"]
