# Base Image
FROM node:20-slim

# Install dependencies for canvas/ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies (All)
RUN npm install

# Copy Source Code
COPY . .

# Build Frontend
RUN npm run build

# Expose API Port
EXPOSE 3000

# Start Command
CMD ["node", "server/index.js"]
