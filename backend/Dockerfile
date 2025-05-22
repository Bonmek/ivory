FROM ubuntu:22.04

# Set the working directory
WORKDIR /app

# Install Node.js, npm, and curl
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN pnpm build

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["pnpm", "start"]