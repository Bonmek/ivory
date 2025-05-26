# Build stage
FROM node:22-alpine AS build

# Install Python and build tools for native dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    py3-pip

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code (node_modules will be ignored by .dockerignore)
COPY . .

# Build the project
RUN pnpm run build

# Serve with static server
FROM node:22-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]