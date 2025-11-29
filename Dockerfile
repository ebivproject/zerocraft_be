FROM node:20-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat bash

WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source files
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

RUN chmod +x ./scripts/entrypoint.sh

# Build TypeScript
RUN npm run build

# Keep Prisma CLI for migrations
RUN npm prune --production && npm install prisma --save-dev

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start the application with migration retry
CMD ["./scripts/entrypoint.sh"]
