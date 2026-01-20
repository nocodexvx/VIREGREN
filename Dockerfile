# Base Image with Node.js 20
FROM node:20-slim

# Install system dependencies (ffmpeg is still needed for runtime)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Setup Backend (Runtime only)
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# 2. Setup Application
WORKDIR /app

# Copy Pre-built Frontend (dist) and Backend Source
COPY dist ./dist
COPY server ./server

# Expose API Port
EXPOSE 3000

# Start Command
CMD ["node", "server/index.js"]
