# Multi-stage build for NestJS application
FROM node:22-alpine AS base

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY services/user/package.json ./services/user/
# Copy packages with package.json files
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

# Copy source code
COPY . .

# Expose port
EXPOSE 3008

# Start development server
CMD ["pnpm", "--filter", "user", "dev"]

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter user build

# Verify build output
RUN ls -la /app/services/user/

# Production stage
FROM node:22-alpine AS production

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY services/user/package.json ./services/user/
# Copy packages with package.json files
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/services/user/dist ./services/user/dist
COPY --from=builder /app/packages ./packages

# Verify copied files
RUN ls -la /app/services/user/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/health || exit 1

# Expose port
EXPOSE 3008

# Start the application
CMD ["node", "services/user/dist/main.js"]