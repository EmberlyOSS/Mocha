FROM oven/bun:1 AS base
WORKDIR /app

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder

RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies (layer-cached separately from source)
COPY package.json bun.lock* turbo.json ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
COPY apps/landing/package.json ./apps/landing/
RUN bun install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY apps/client ./apps/client
COPY ecosystem.config.js ./ecosystem.config.js

# Build API
RUN cd apps/api && bunx prisma generate && bun run build

# Build client (output: standalone is hardcoded in next.config.ts, safe for dev too)
RUN cd apps/client && bun run build

# ── API production deps ───────────────────────────────────────────────────────
# Install outside the workspace root so bun doesn't hoist to /app/node_modules
WORKDIR /api-prod
COPY apps/api/package.json ./
RUN bun install --production
# Overlay the Prisma-generated client from the workspace build
RUN cp -r /app/node_modules/.prisma ./node_modules/ && \
    cp -r /app/node_modules/@prisma/client/. ./node_modules/@prisma/client/

WORKDIR /app

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

RUN npm install -g pm2

# API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /api-prod/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Client (Next.js standalone)
COPY --from=builder /app/apps/client/.next/standalone ./apps/client/
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public

COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

EXPOSE 3000 5003

CMD ["pm2-runtime", "ecosystem.config.js"]
