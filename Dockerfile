# Base Image with Node.js 20
FROM node:20-slim

# Install FFmpeg and other build dependencies (python/make for some node modules)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Work Directory
WORKDIR /app

# Copy dependency files first (Caching)
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
# Root (Frontend)
RUN npm install
# Server (Backend)
WORKDIR /app/server
RUN npm install

# Return to root
WORKDIR /app

# Copy Source Code
COPY . .

# Build Frontend
RUN npm run build

# Expose API Port
EXPOSE 3000

# Start Command (Use standard node execution, let Docker restart if needed)
# Using 'server/index.js' as entry point
CMD ["node", "server/index.js"]
