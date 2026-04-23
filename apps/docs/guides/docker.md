---
title: Docker Install
description: Deploy Mocha using Docker Compose.
icon: docker
---

## Requirements

- Docker 24+
- Docker Compose v2

## Quick start

Create a `docker-compose.yml` file on your server:

```yaml
services:
  mocha_postgres:
    container_name: mocha_postgres
    image: postgres:16
    restart: always
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: mocha
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: mocha

  mocha:
    container_name: mocha
    image: emberlyoss/mocha:latest
    ports:
      - 3000:3000
      - 5003:5003
    restart: always
    depends_on:
      - mocha_postgres
    environment:
      DB_USERNAME: "mocha"
      DB_PASSWORD: ${DB_PASSWORD}
      DB_HOST: "mocha_postgres"
      SECRET: ${SECRET}

volumes:
  pgdata:
```

Create a `.env` file alongside it with your secrets:

```env
DB_PASSWORD=a-strong-random-password
SECRET=a-very-long-random-string
```

<Warning>
  Never commit real credentials to source control. Use a password manager or `openssl rand -hex 32` to generate secrets.
</Warning>

Start the stack:

```bash
docker compose up -d
```

Mocha is now running at **http://your-server-ip:3000**

## Default credentials

```
Email:    admin@admin.com
Password: 1234
```

<Warning>
  Change the default password immediately from **Settings → Profile** after first login.
</Warning>

## Environment variables

| Variable | Description |
|---|---|
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host (service name when using Compose) |
| `SECRET` | JWT signing secret — use a long random string |
| `PORT` | Client port (default `3000`) |
| `API_PORT` | API port (default `5003`) |

## Nightly builds

To run the latest nightly image instead of the stable release, change the image tag:

```yaml
image: emberlyoss/mocha:nightly
```

## Updating

```bash
docker compose pull
docker compose up -d
```

## Exposing via a reverse proxy

If you want Mocha accessible on a domain rather than a raw IP, see the [Reverse Proxy](/guides/proxy) guide.
