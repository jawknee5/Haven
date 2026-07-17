# HAVEN Deployment Guide

This project supports two deployment modes:

1. **Emergents / production VPS deployment**
2. **Docker backup boot stack** — isolated, non-conflicting fallback

---

## 1. Emergents / Production VPS Deployment

For Emergents-hosted servers or a custom production VPS, deploy the application as a containerized stack using the main compose file.

```bash
# Copy and fill in real secrets
cp backend/.env.example backend/.env.production

# Start the production stack on standard ports (80/443)
docker compose -f docker-compose.yml up -d --build
```

The production stack exposes:
- Frontend: `http://localhost` / `https://homeishaven.cloud`
- Backend API: `/api`
- MongoDB: internal only on `27017`
- Ollama LLM: internal only on `11434`

---

## 2. Docker Backup Boot Stack

Use this when you need a fallback deployment that does not conflict with the main production stack or Emergents-managed services.

### What makes it non-conflicting

- **Different ports**: `8080` / `8443` instead of `80` / `443`
- **Different container names**: `haven-backup-*` instead of `haven-*`
- **Different network**: `haven-backup-net` instead of `haven-net`
- **Different volume**: `haven-backup-mongo-data` instead of `mongo-data`
- **Dedicated nginx config**: `nginx.backup.conf` instead of `nginx.conf`

### Start the backup stack

```bash
# Use the backup compose file explicitly
docker compose -f docker-compose.backup.yml up -d --build
```

Access the backup instance at:
- HTTP: http://localhost:8080
- HTTPS: https://localhost:8443

### Stop the backup stack

```bash
docker compose -f docker-compose.backup.yml down
```

To also remove the backup volume:

```bash
docker compose -f docker-compose.backup.yml down -v
```

---

## Environment Variables

Create a `backend/.env.production` file with at minimum:

```bash
PORT=8000
NODE_ENV=production
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="change_me"
VAULT_KEY="change_me"
OPENAI_API_KEY="sk-..."
EMERGENT_LLM_KEY=""
CORS_ORIGINS="https://homeishaven.cloud,https://www.homeishaven.cloud"
```

Never commit real secrets to GitHub.

---

## Notes

- The `docker-compose.backup.yml` file intentionally does not start Ollama to keep the backup stack lightweight. If BB/local AI is required in backup mode, add an `ollama` service following the pattern in `docker-compose.yml`.
- Both stacks can exist on the same host as long as the backup stack is not mapped to ports already in use.
