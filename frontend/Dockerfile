# Stage 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy files
COPY . .

# Enable and setup pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build app
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy build files to nginx's default public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
