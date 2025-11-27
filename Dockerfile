FROM node:20-alpine

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

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/app.js"]
