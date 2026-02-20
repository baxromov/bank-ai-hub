FROM node:20-alpine

WORKDIR /app

# Allow corporate proxy / self-signed certs
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy workspace root files for pnpm workspace resolution
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy contracts package (workspace dependency)
COPY packages/contracts/ ./packages/contracts/

# Copy web app package.json
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN corepack enable && npm config set strict-ssl false && pnpm config set strict-ssl false && pnpm install --no-frozen-lockfile

# Copy web app source
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000
CMD ["pnpm", "dev"]
