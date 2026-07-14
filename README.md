# HAVEN

**Helping Agencies, Volunteers, and Everyone Navigate.**

HAVEN is a universal civic navigation platform that simplifies, guides, and automates any interaction between people and government — across every domain government touches.

---

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- A `.env` file (copy from `.env.example` and fill in your values)

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/[architect]/Haven.git
cd Haven

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET, VAULT_MASTER_KEY, SIGNED_URL_SECRET

# 3. Start all services
docker compose up -d --pull always

# 4. Seed the database
docker compose exec backend python seed.py
```

The platform will be available at `http://localhost:80`.

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 / 443 | Reverse proxy, TLS termination |
| frontend | 3000 | React application |
| backend | 8000 | FastAPI application |
| mongo | 27017 | MongoDB database |
| ollama | 11434 | Local AI (BB) |

---

## Environment Variables

See `.env.example` for all required and optional variables.

Critical variables that **must** be set before running in any environment:

```bash
JWT_SECRET=           # generate: openssl rand -hex 32
VAULT_MASTER_KEY=     # generate: openssl rand -hex 32  (keep separate from JWT_SECRET)
SIGNED_URL_SECRET=    # generate: openssl rand -hex 32
```

---

## Commands

```bash
# Start
docker compose up -d --pull always

# View logs
docker compose logs -f backend

# Rebuild
docker compose build --no-cache

# Stop
docker compose down

# Health check
curl http://localhost/api/health
```

---

## BB — AI Assistant

BB runs on a local Ollama instance (llama3.2:3b) with no external API costs.
The model (~2GB) is pulled automatically on first start.

To enable the Claude Sonnet fallback, set `EMERGENT_LLM_KEY` in `.env`.
Leave it blank to keep everything local and free.

---

## Security

- All sensitive fields (SSN, DOB, income, phone, etc.) are encrypted at rest via the Apex Vault (AES-256-GCM)
- TLS 1.3 enforced on all external traffic
- OAuth integrations use PKCE — no secrets stored in code

---

*"Help has a home."*
