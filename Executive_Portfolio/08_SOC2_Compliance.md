# HAVEN Platform — SOC 2 Type II Compliance
**Prepared by**: Johnathan R. Rodriquez  
**Audience**: Auditors | Enterprise Procurement | Security Officers  
**Audit Status**: Window Open — Architecture Complete | **Year**: 2025

---

## Overview

HAVEN's architecture is designed to satisfy all five SOC 2 Trust Service Criteria. This document maps every engineering control to its corresponding TSC, with evidence pointers and implementation status.

---

## Trust Service Criteria Coverage

### CC1 — Control Environment

| Control | Implementation | Status |
|---------|---------------|--------|
| Organizational structure | Single founder (Johnathan R. Rodriquez), Architect role in platform | ✅ |
| Security policies | This portfolio + DATA_RETENTION_POLICY.md | ✅ |
| Risk assessment | Threat model documented in 07_Apex_Vault_Specs.md | ✅ |
| Vendor management | All sub-processors documented in DPA_TEMPLATE.md Annex A | ✅ |

---

### CC6 — Logical and Physical Access Controls

#### CC6.1 — Access Control Implementation

| Control | Implementation | Evidence |
|---------|---------------|---------|
| Authentication | JWT HS256, 72hr TTL, bcrypt password hashing | `backend/auth.py` |
| Role-based access | 4 roles: resident/caseworker/admin/architect; enforced per endpoint via `require_role()` | All routers |
| Residents see only own data | `resident_id` filter on all resident queries | `cases_router.py`, `documents`, `messages` |
| Field-level encryption | AES-256-GCM (Apex Vault) on all PII fields | `backend/vault.py` |
| Encrypted OAuth tokens | `access_token`/`refresh_token` vault-encrypted before MongoDB insert | `integrations_router.py` |
| No plaintext PII on disk | All 12 routers vault-patched; zero plaintext surfaces confirmed | Verified by AST scan |

#### CC6.7 — Transmission and Disposal

| Control | Implementation | Evidence |
|---------|---------------|---------|
| Encryption in transit | TLS 1.3 (nginx); HTTP → HTTPS forced redirect | `nginx.conf` |
| Document access control | HMAC-SHA256 signed URLs, 15-min TTL; raw bytes never in list responses | `case_ops_router.py` |
| Signed URL audit trail | Every issuance and download emits audit record | `audit_log` collection |
| Data disposal (GDPR purge) | `DELETE /api/admin/users/{id}/purge` — cascading delete across 9 collections | `admin_router.py` |
| Cryptographic erasure | User deletion orphans ciphertext — irreversible | `vault.py` |

#### CC6.3 — Access Removal

| Control | Implementation |
|---------|---------------|
| Account deactivation | `PATCH /api/admin/users/{id}` sets `active: false` |
| Session invalidation | JWT secret rotation invalidates all active sessions immediately |
| OAuth revocation | `POST /api/integrations/{code}/oauth/disconnect` deletes vault-encrypted tokens |

---

### CC7 — System Operations

#### CC7.1 — Vulnerability Detection

| Control | Implementation |
|---------|---------------|
| Dependency scanning | npm audit + pip audit in CI pipeline |
| Docker image hardening | Multi-stage builds; non-root user; minimal base images |
| Rate limiting | nginx: 30 req/min per IP on `/api/` endpoints |
| Input validation | Pydantic v2 strict validation on all request models |

#### CC7.2 — Monitoring and Alerting

| Control | Implementation | Endpoint |
|---------|---------------|---------|
| Liveness probe | Returns 200 while process runs; never checks deps | `GET /api/health/live` |
| Readiness probe | DB ping; 503 if MongoDB unreachable | `GET /api/health/ready` |
| Full health check | Vault config, DB, LLM engine, token job, signed URL key | `GET /api/health` |
| Error tracking | Sentry DSN configurable via `SENTRY_DSN` env var | `server.py` |
| Uptime target | 99.2% SLA (30-day measured) | Monitoring dashboard |

---

### CC8 — Change Management

| Control | Implementation |
|---------|---------------|
| Version control | Git (private GitHub repository) |
| Deployment pipeline | Docker build → test → compose up |
| Database migrations | Idempotent index creation on every startup (`scripts/ensure_indexes.py`) |
| Seed data isolation | Demo data separated from production via env-gated seeding |

---

### CC9 — Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Database breach | AES-256-GCM field encryption; attacker sees only ciphertext |
| Token theft | OAuth tokens vault-encrypted at rest; auto-rotated before expiry |
| State token replay | Single-use tokens; MongoDB TTL index auto-expires after 15 min |
| Insider threat | Immutable audit_log; all mutations logged with actor + timestamp |
| Data accumulation | MongoDB TTL indexes auto-delete sessions (90d), notifications (30d), states (15min) |
| Key compromise | Vault rotation procedure re-encrypts all fields under new master |

---

### A1 — Availability

| Control | Implementation |
|---------|---------------|
| Uptime target | 99.2% (30-day SLA) |
| Health probes | /health/live + /health/ready (Docker + Kubernetes compatible) |
| Restart policy | All 5 Docker services: `restart: unless-stopped` |
| Horizontal scaling | Stateless frontend + backend; MongoDB replicaset-ready |
| Backup | MongoDB volume persistent; cloud provider backup on production host |

---

## Immutable Audit Log

The `audit_log` collection is the backbone of SOC 2 evidence:

- **Insert-only**: Never updated or deleted by application code
- **Retention**: 7 years (2,555 days) via MongoDB TTL index (`audit_ttl`)
- **Coverage**: Every state-mutating operation across all 12 routers
- **Fields**: `id, actor_id, actor_name, actor_role, action, target, meta, created_at`
- **Indexes**: Compound indexes on `(actor_id + created_at)`, `(action + created_at)`, `(target + created_at)` for fast compliance queries
- **System events**: Token refresh job emits `integration.oauth_refresh` / `integration.oauth_refresh_failed`

**Audited actions include**:
`auth.register`, `auth.login`, `case.create`, `case.update`, `case.claim`, `task.create`, `task.update`, `task.delete`, `document.upload`, `document.download`, `document.signed_url_issued`, `document.verify`, `user.create`, `user.update`, `user.deactivate`, `user.purge`, `agency.submit`, `agency.sync`, `integration.toggle`, `integration.oauth_start`, `integration.oauth_refresh`, `integration.oauth_disconnect`, `bb.application_track`, `template.submit`, `form.create`, `form.submit`, `case.packet_download`

---

## MongoDB Indexes for Compliance

Created idempotently on startup via `backend/scripts/ensure_indexes.py`:

| Collection | Index | Purpose |
|-----------|-------|---------|
| `oauth_states` | TTL on `expires_at` (expireAfterSeconds=0) | Auto-delete expired state tokens |
| `audit_log` | TTL on `created_at` (2555 days) | 7-year retention then auto-purge |
| `audit_log` | Compound `(actor_id, created_at)` | Compliance queries by actor |
| `audit_log` | Compound `(action, created_at)` | Compliance queries by action type |
| `bb_sessions` | TTL on `last_message_at` (90 days) | Session data auto-expiry |
| `notifications` | TTL on `created_at` (30 days) | Notification auto-purge |
| `users` | Unique on `email` | Prevents duplicate accounts |
| `integrations` | Unique on `code` | Prevents duplicate agency records |

---

## SOC 2 Audit Evidence Package

Available on request for auditors:

| Evidence Item | Location |
|--------------|---------|
| Encryption specification | `07_Apex_Vault_Specs.md` |
| Data retention policy | `DATA_RETENTION_POLICY.md` |
| Data processing agreement template | `DPA_TEMPLATE.md` |
| Accessibility report | `ACCESSIBILITY_REPORT.md` |
| Unified technical documentation | `HAVEN_UNIFIED_DOCUMENTATION_V3.md` |
| Source code (private repo) | github.com/jawknee5/Haven (access on request) |
| Health endpoint live output | `GET https://homeishaven.cloud/api/health` |
| Audit log export | Available via admin portal |

---

*HAVEN Platform — homeishaven.cloud | "Help has a home." | Confidential*
