# Changelog

All notable changes to Mocha are documented here.  
This project follows [Semantic Versioning](https://semver.org) and the [Keep a Changelog](https://keepachangelog.com) format.

---

## [0.2.0] — 2026-04-23

### Added
- Mintlify documentation site (`apps/docs`) replacing the previous Nextra setup — includes full navigation, logo, and social links configured in `docs.json`
- New documentation guides: Development Setup, Docker Install, Bare Metal (no Docker), Deploy with Dokploy, Reverse Proxy, OIDC, Easy Installer, and Translations — all with proper Mintlify frontmatter
- `nixpacks.toml` for Nixpacks-based deployments of the API
- `bun run dev:docs` script to preview the documentation site locally
- Next.js rewrite proxy — all `/api/v1/**` requests are transparently proxied to the API server in development, removing the need to configure `NEXT_PUBLIC_API_URL` for local use
- `ALLOWED_DEV_ORIGINS` env var support in `next.config.ts` so developer machine IPs are never hardcoded in source
- `NEXT_OUTPUT` env var support for opt-in Next.js standalone output (used during Docker builds)

### Changed
- **Package manager migrated from Yarn to Bun** — `yarn.lock` removed, `bun.lock` in use; all install and build commands updated throughout
- Root `Dockerfile` rewritten to use `oven/bun:1` as base image with a clean multi-stage build (builder → runner) using Bun for installs and builds
- `apps/api/Dockerfile` fully rewritten — replaced broken Yarn 4 monorepo approach with a straightforward Bun multi-stage build
- All `docker-compose*.yml` files updated: removed deprecated `version:` field (Compose v2), replaced hardcoded credentials with `${DB_PASSWORD}` / `${SECRET}` env var substitution
- Fixed `docker-compose.local.yml` port mapping `3300:3300` → `3300:3000` (container always listens on port 3000)
- GitHub Actions release workflow now triggers on `push: tags: 'v*.*.*'` in addition to `workflow_dispatch`, so semver image tags (`0.2.0`, `0.2`, `latest`) are correctly populated
- GitHub Actions GHA layer cache scoped per workflow (`scope=release/nightly/dev`) to prevent cross-contamination between build pipelines
- `packageManager` field in root `package.json` updated to `bun@1.3.13`
- Removed `--parallel` flag from `turbo run dev` — replaced by `persistent: true` in `turbo.json` as recommended by Turbo v2

### Fixed
- `console.error` calls on handled auth errors in the login page were surfacing as Next.js dev overlay errors — removed in favour of the existing `setError` UI state
- `mocha-client` workspace not found error when running `bun run dev` due to `packageManager` being set to `yarn@4.2.2`
- `ajv/dist/core` module not found when running `mintlify dev` — resolved by adding `ajv@^8` as an explicit root devDependency

---

## [0.1.0] — Initial release

### Added
- Complete migration to Next.js App Router with modular UI structure
- New UI component library and full interface redesign
- Fastify-based REST API with Prisma ORM and PostgreSQL
- Role-based access control (admin, engineer, client)
- Ticket management: open, assign, close, queue
- OIDC / SSO authentication support
- Email integration via IMAP
- Webhook support
- Client portal for external users
- Document management
- Notification system
- Admin panel
- Docker Compose stack for single-command self-hosting
- GitHub Actions CI pipelines for nightly, dev, and release Docker image builds
- AGPL-3.0 license

[0.2.0]: https://github.com/EmberlyOSS/Mocha/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/EmberlyOSS/Mocha/releases/tag/v0.1.0
