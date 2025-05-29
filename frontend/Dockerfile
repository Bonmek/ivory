# ================================
# Stage 1: Build React App
# ================================
FROM node:22-alpine AS build

# Install build dependencies
RUN apk add --no-cache python3 make g++ py3-pip

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source and build
COPY . .
RUN pnpm run build


# ================================
# Stage 2: Runtime (Static Server + Env Replace)
# ================================
FROM node:22-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built app and env replacer script
COPY --from=build /app/dist /app/dist
COPY env.sh /app/env.sh

# Make script executable
RUN chmod +x /app/env.sh

# Expose desired port
EXPOSE 3000

# Run placeholder replacement, then serve
CMD ["sh", "-c", "/app/env.sh && serve -s dist -l 3000"]
