# ── builder: install deps and compile ───────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl
RUN corepack enable

# Copy manifests first (layer-cache friendly)
COPY package.json yarn.lock .yarnrc.yml turbo.json ./
COPY .yarn/patches ./.yarn/patches
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/
COPY apps/docs/package.json ./apps/docs/
COPY apps/landing/package.json ./apps/landing/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Copy Prisma schema before install so postinstall `prisma generate` works
COPY apps/api/src/prisma ./apps/api/src/prisma

# Install — postinstall runs prisma generate naturally
# Save resolved lockfile before COPY . . overwrites it
RUN yarn install --no-immutable && cp yarn.lock /tmp/yarn.lock.resolved

# Copy full source, then restore the resolved lockfile (preserves patch entries)
COPY . .
RUN cp /tmp/yarn.lock.resolved ./yarn.lock

# Build API (TypeScript → dist/) and client (Next.js standalone)
RUN yarn workspace api build
RUN yarn workspace client build

# ── runner: minimal production image ────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
RUN npm install -g pm2

COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

# API: compiled output + dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma

# Client: Next.js standalone (copies to root so apps/client/server.js resolves)
COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public

EXPOSE 3000 5003
CMD ["pm2-runtime", "ecosystem.config.js"]