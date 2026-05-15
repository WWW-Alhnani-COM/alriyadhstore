# Build stage: build all workspace packages
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json .npmrc ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

# Install and build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# ---

# Runtime stage: only API server + static frontend
FROM node:24-alpine AS runner

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/store/dist/public ./dist/public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
