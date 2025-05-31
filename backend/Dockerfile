FROM ubuntu:22.04

# Set the working directory
WORKDIR /app

# Install Node.js, npm, curl, and other dependencies
RUN apt-get update && \
    apt-get install -y curl bash sed && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy rest of the source code
COPY . .

# Copy environment replacement script
COPY env.sh /app/env.sh
RUN chmod +x /app/env.sh

# Build the app (make sure .env.production uses placeholders like __API_URL__)
RUN pnpm run build

# Expose port
EXPOSE 5000

# Start app with environment variable replacement
CMD ["sh", "-c", "/app/env.sh && pnpm start"]
