---
title: Deploy with Dokploy
description: Deploy Mocha on any VPS using Dokploy.
icon: cloud
---

# Deploy with Dokploy

[Dokploy](https://dokploy.com) is a self-hosted PaaS that makes deploying Docker Compose apps on any VPS simple. This guide covers deploying Mocha on a fresh server using Dokploy.

## Prerequisites

- A VPS running Ubuntu 22.04+ (or Debian 12+) with at least 1 GB RAM
- A domain or subdomain pointed at your server's IP address
- SSH access to the server

## 1. Install Dokploy

SSH into your server and run the official installer:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Once complete, open `http://your-server-ip:3000` in your browser to finish the Dokploy setup wizard.

## 2. Create a Compose Application

1. In the Dokploy dashboard, click **Projects → New Project** and give it a name (e.g. `mocha`).
2. Inside the project, click **Create Service → Docker Compose**.
3. Under **Source**, choose **Custom** and paste the following compose definition:

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
      DATABASE_URL: "postgresql://mocha:${DB_PASSWORD}@mocha_postgres/mocha"
      SECRET: ${SECRET}

volumes:
  pgdata:
```

## 3. Set Environment Variables

In the **Environment** tab, add:

| Variable | Value |
|---|---|
| `DB_PASSWORD` | A strong random password |
| `SECRET` | A long random string (used to sign JWTs) |

That's all you need to set. `DATABASE_URL` is constructed automatically from `DB_PASSWORD` by the compose file — Dokploy passes your env vars to `docker compose` which substitutes them at deploy time. PostgreSQL is also created automatically as part of the same stack; no external database is needed.

Use a password generator — never commit real credentials to source control.

## 4. Configure a Domain

1. Go to the **Domains** tab for your compose service.
2. Click **Add Domain**, enter your domain (e.g. `support.example.com`), and set the port to `3000`.
3. Enable **HTTPS** — Dokploy will provision a Let's Encrypt certificate automatically.

For the API (needed for webhooks/email callbacks), add a second domain (e.g. `support-api.example.com`) pointing to port `5003`.

## 5. Deploy

Click **Deploy** in the top right. Dokploy will pull the images, start the stack, and apply your domain config. Deployment usually takes 1–2 minutes.

Access Mocha at `https://support.example.com`.

## Default Credentials

```
Email:    admin@admin.com
Password: 1234
```

> **Change this immediately** from Settings → Profile after first login.

## Updating Mocha

To update to the latest release:

1. Go to your compose service in Dokploy.
2. Click **Redeploy** (or enable **Auto Deploy** in settings to pull updates automatically on new image pushes).

## Deploying from Source (CI/CD)

If you want to build from your own fork:

1. Set the compose **Source** to **GitHub** and connect your repository.
2. The included GitHub Actions workflows (`.github/workflows/`) will build and push `emberlyoss/mocha:latest` to Docker Hub on every merge to `main`.
3. Use Dokploy's webhook trigger or enable auto-deploy to pick up new images automatically.

## Troubleshooting

| Problem | Fix |
|---|---|
| Container fails to start | Check **Logs** tab — usually a missing env var or DB connection issue |
| Can't reach the app | Verify the domain DNS has propagated and the correct port is mapped |
| Database connection error | Ensure `DB_HOST` matches the postgres service name (`mocha_postgres`) |
| HTTPS not working | Make sure port 80 and 443 are open on your firewall |
