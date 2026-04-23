FROM oven/bun:1 AS base
WORKDIR /app

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder

RUN apt-get update && \
    apt-get install -y build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies (layer-cached separately from source)
COPY package.json ./
RUN bun install

# Copy source and build
COPY . .
RUN bunx prisma generate && bun run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 5003

CMD ["node", "dist/main.js"]
