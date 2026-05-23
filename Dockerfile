# 1. Use an official lightweight Node.js runtime as the base image
FROM node:22-slim

# Install system dependencies for headless Chrome/Chromium completely
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    xvfb \
    chromium \
    tar \
    bzip2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 2. Set the working directory inside the virtual container
WORKDIR /app

# 3. Copy package.json and package-lock.json first to cache dependencies efficiently
COPY package*.json ./

# 🚀 Keeps Puppeteer from trying to download its own copy during npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 4. Install only production dependencies cleanly to keep the image compact
RUN npm ci

# 5. Copy the rest of your application source code into the container
COPY . .

# 6. Expose the port your server listens on
EXPOSE 3000

# 7. 🔥 FIXED: Points directly to your actual server entrypoint in the app root
CMD ["node", "server.js"]