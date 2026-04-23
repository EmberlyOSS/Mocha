---
title: Bare Metal (No Docker)
description: Deploy Mocha directly on a Linux server without Docker using Bun, PM2, PostgreSQL and Nginx.
icon: server
---

This guide covers deploying Mocha on an Ubuntu 22.04+ (or Debian 12+) VPS without Docker.

## Prerequisites

- A server running Ubuntu 22.04+ or Debian 12+
- A domain or subdomain pointed at your server's IP
- SSH access as a non-root user with `sudo`

## 1. Install dependencies

### Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

Verify:

```bash
bun --version
```

### Node.js & PM2

PM2 is used to keep Mocha running as a background service and restart it on crash or reboot.

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Create a database and user:

```bash
sudo -u postgres psql <<SQL
CREATE USER mocha WITH PASSWORD 'a-strong-password';
CREATE DATABASE mocha OWNER mocha;
SQL
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

## 2. Clone and install

```bash
git clone https://github.com/EmberlyOSS/Mocha.git /opt/mocha
cd /opt/mocha
bun install --frozen-lockfile
```

## 3. Configure environment variables

### API (`apps/api/.env`)

```bash
nano /opt/mocha/apps/api/.env
```

```env
DB_USERNAME="mocha"
DB_PASSWORD="a-strong-password"
DB_HOST="localhost:5432"
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/mocha"
SECRET="a-very-long-random-secret"
```

Use `openssl rand -hex 32` to generate a strong secret.

### Client (`apps/client/.env`)

```bash
nano /opt/mocha/apps/client/.env
```

```env
NEXT_PUBLIC_CLIENT_VERSION="0.1.0"
NEXT_PUBLIC_API_URL="https://mocha-api.example.com"
```

## 4. Database setup

```bash
cd /opt/mocha/apps/api
bunx prisma migrate deploy
bunx prisma generate
```

## 5. Build

```bash
cd /opt/mocha
NEXT_OUTPUT=standalone bun run build
```

## 6. Start with PM2

From the repo root:

```bash
cd /opt/mocha
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup` to configure PM2 to start on boot.

Verify everything is running:

```bash
pm2 status
```

You should see both `client` and `api` listed as `online`.

## 7. Configure Nginx

### Client proxy

```bash
sudo nano /etc/nginx/conf.d/mocha-client.conf
```

```nginx
server {
    listen 80;
    server_name support.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 5m;
    }

    client_max_body_size 10M;
}
```

### API proxy

```bash
sudo nano /etc/nginx/conf.d/mocha-api.conf
```

```nginx
server {
    listen 80;
    server_name mocha-api.example.com;

    location / {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 5m;
    }

    client_max_body_size 10M;
}
```

Test and reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 8. Enable SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d support.example.com -d mocha-api.example.com
```

Certbot will automatically configure HTTPS and schedule auto-renewal.

<Note>
  After enabling SSL, make sure `NEXT_PUBLIC_API_URL` in `apps/client/.env` uses `https://`.
  Rebuild (`NEXT_OUTPUT=standalone bun run build`) and restart PM2 (`pm2 restart all`) for the change to take effect.
</Note>

## Default credentials

```
Email:    admin@admin.com
Password: 1234
```

<Warning>
  Change the default password immediately from **Settings → Profile** after first login.
</Warning>

## Updating Mocha

```bash
cd /opt/mocha
git pull
bun install --frozen-lockfile
cd apps/api && bunx prisma migrate deploy && bunx prisma generate && cd ../..
NEXT_OUTPUT=standalone bun run build
pm2 restart all
```
