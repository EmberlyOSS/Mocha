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
RUN bun install --frozen-lockfile

# Copy source and build
COPY apps/api ./apps/api
RUN cd apps/api && bunx prisma generate && bun run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 5003

CMD ["node", "dist/main.js"]
