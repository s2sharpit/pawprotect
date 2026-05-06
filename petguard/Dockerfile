# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy built app
# Note: Angular SSR structure usually puts server.mjs in dist/petguard/server/
COPY --from=builder /app/dist/petguard ./dist/petguard

# Expose the default SSR port
EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

# Start the SSR server
CMD ["node", "dist/petguard/server/server.mjs"]
