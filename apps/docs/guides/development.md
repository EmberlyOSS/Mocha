---
title: Development Setup
description: Set up Mocha on your local machine for development.
icon: code
---

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- [Git](https://git-scm.com)
- [PostgreSQL](https://www.postgresql.org) 15+ (local or remote)

## 1. Clone the repository

```bash
git clone https://github.com/EmberlyOSS/Mocha.git
cd Mocha
```

## 2. Install dependencies

Mocha is a Bun monorepo. Install all workspace dependencies from the root:

```bash
bun install
```

## 3. Configure environment variables

### API (`apps/api/.env`)

```env
DB_USERNAME="postgres"
DB_PASSWORD="yourpassword"
DB_HOST="localhost:5432"
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/mocha_dev"
SECRET="a-long-random-secret-string"
```

### Client (`apps/client/.env`)

```env
NEXT_PUBLIC_CLIENT_VERSION="0.1.0"
NEXT_PUBLIC_API_URL="http://localhost:5003"
```

<Note>
  If you access the dev server from a VM or a different host (e.g. WSL2 or a remote machine), add `ALLOWED_DEV_ORIGINS="your-ip"` to `apps/client/.env` to allow the HMR websocket through.
</Note>

## 4. Set up the database

Push the Prisma schema to your database and generate the client:

```bash
cd apps/api
bun run db:push
```

Optionally seed with starter data:

```bash
bun run db:seed
```

## 5. Start the development servers

From the repo root, run all apps in parallel:

```bash
bun run dev
```

| App | URL |
|---|---|
| Client (Next.js) | http://localhost:3000 |
| API (Fastify) | http://localhost:5003 |

To run a single app in isolation:

```bash
# API only
cd apps/api && bun run dev

# Client only
cd apps/client && bun run dev
```

## 6. Docs (optional)

Preview the documentation site locally:

```bash
bun run dev:docs
```

## Useful commands

| Command | Description |
|---|---|
| `bun run build` | Build all apps for production |
| `bun run lint` | Lint all packages |
| `bun run format` | Format all files with Prettier |
| `cd apps/api && bun run db:migrate` | Run a Prisma migration |
| `cd apps/api && bun run generate` | Regenerate the Prisma client |

