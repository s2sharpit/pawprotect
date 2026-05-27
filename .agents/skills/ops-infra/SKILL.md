---
name: pawprotect-ops-infra
description: Playbook for managing operations, local orchestration with Docker Compose, Nginx gateways, TLS cert renewals, and the GitHub Actions deployment pipelines for PawProtect. Activate this when debugging deployment issues, editing configuration files, or updating Dockerfiles.
---
# PawProtect Operations & Infrastructure Skill

This skill outlines environment orchestration, proxy setups, rate-limiting, and deployment procedures for the PawProtect stack.

## 🐳 Docker Compose Stack Orchestration
The entire application is containerized and orchestrated via the root [docker-compose.yml](file:///D:/Coding/projects/pawprotect/docker-compose.yml):
- **`mysqldb`**: MySQL 8.0 database using a persistent volume (`mysql-data`).
- **`app`**: Java Spring Boot backend service, built from `./backend`. Depends on database and AI microservices being healthy.
- **`ai`**: FastAPI AI service, built from `./petguard-ai`. Exposes an internal `/health` check.
- **`frontend`**: Angular 19 SSR frontend, built from `./petguard`.
- **`proxy`**: Nginx web server handling routing, rate limiting, and SSL termination.
- **`certbot`**: Automatically checks and renews Let's Encrypt certificates every 12 hours.

---

## 🚦 Nginx Gateway Configuration & Rate Limiting
Nginx acts as the single entry point (listening on ports 80 and 443).
- **HTTP (Port 80):** Serves ACME validation challenges for Let’s Encrypt (`/.well-known/acme-challenge/`) and redirects all other traffic to HTTPS.
- **HTTPS (Port 443):**
  - Mapped to domain `pawprotect.s2sharpit.dev`.
  - Proxies `/api/` traffic to the Spring Boot backend (`http://app:8080`).
  - Proxies `/` traffic to the Angular frontend (`http://frontend:4000`).
- **Rate Limiting:**
  - Configured zone `api_limit` stores up to 10MB of IP states, permitting 5 requests/sec per IP.
  - Applied to `/api/` with a burst allowance of 10 requests (`burst=10 nodelay`).
  - Returns HTTP 429 Too Many Requests status if thresholds are breached.

---

## 🚀 Deployment Pipeline (CI/CD)
PawProtect deploys automatically to a DigitalOcean Droplet using GitHub Actions:
- On push to `main` branch, the workflow:
  1. SSHs into the DigitalOcean server.
  2. Updates the local git repository on the Droplet.
  3. Pulls/rebuilds Docker containers via:
     ```bash
     docker compose up -d --build
     ```
- Make sure secrets like API keys (`GEMINI_API_KEY`, `JWT_SECRET`) and database passwords are set in GitHub Repository Secrets.
