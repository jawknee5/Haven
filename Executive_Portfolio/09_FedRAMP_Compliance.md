# HAVEN Platform — FedRAMP Compliance
**Prepared by**: Johnathan R. Rodriquez  
**Audience**: Federal Procurement | Government Security Officers | Agency Partners  
**FedRAMP Status**: Architecture Validated — Registration Pending  
**Target**: FedRAMP Moderate Baseline | **Year**: 2025

---

## Overview

HAVEN's architecture is aligned to FedRAMP Moderate baseline requirements. The cryptographic, access control, audit, and token management controls are implemented and verified. Formal authorization is pending Login.gov sandbox registration and ATO (Authority to Operate) issuance.

---

## NIST SP 800-53 Control Mapping

### AC — Access Control

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| AC-2 | Account Management | JWT-based authentication; role lifecycle (create/deactivate/purge); audit-logged | ✅ |
| AC-3 | Access Enforcement | `require_role()` decorator on every protected endpoint; residents see only own data | ✅ |
| AC-6 | Least Privilege | 4-role RBAC (resident/caseworker/admin/architect); no over-provisioning | ✅ |
| AC-17 | Remote Access | TLS 1.3 enforced; no plaintext HTTP to authenticated endpoints | ✅ |

---

### IA — Identification and Authentication

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| IA-2 | User Identification | Unique email per account; JWT `sub` claim bound to `user.id` | ✅ |
| IA-5 | Authenticator Management | bcrypt password hashing; OAuth token auto-rotation; vault-encrypted token storage | ✅ |
| IA-5(1) | Password-based auth | bcrypt (cost factor 12); no plaintext passwords stored | ✅ |
| IA-8 | Non-org user identification | Login.gov OIDC + PKCE for federal agency authentication | ✅ |

#### Token Rotation (IA-5 Detail)

HAVEN implements single-use proactive refresh token rotation:

1. `token_refresh_job.py` polls every **120 seconds**
2. Tokens expiring within **300 seconds** (configurable via `TOKEN_REFRESH_BUFFER_SECONDS`) are rotated
3. Old `refresh_token` consumed; server-side PKCE verifier cleared
4. New token set vault-encrypted (AES-256-GCM) before MongoDB persistence
5. Rotation event emits immutable `audit_log` record (no token values logged)
6. On refresh failure: `token_status: refresh_failed` flagged; admin notified via health endpoint
7. Manual rotation: `POST /api/integrations/{code}/oauth/refresh`

**Adapter support**: `LoginGovAdapter`, `VaAdapter`, `SsaAdapter`, `OAuth2Adapter` (all via `RefreshCapableMixin`)

---

### AU — Audit and Accountability

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| AU-2 | Audit Events | 25+ distinct audit actions across all 12 routers | ✅ |
| AU-3 | Content of Audit Records | `id, actor_id, actor_name, actor_role, action, target, meta, created_at` | ✅ |
| AU-9 | Audit Record Protection | Insert-only collection; no application-level delete/update | ✅ |
| AU-11 | Audit Record Retention | 7 years (2,555 days) via MongoDB TTL index | ✅ |
| AU-12 | Audit Record Generation | Every state mutation generates an audit record | ✅ |

---

### SC — System and Communications Protection

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| SC-8 | Transmission Confidentiality | TLS 1.3 (nginx); HSTS header; HTTP→HTTPS forced | ✅ |
| SC-12 | Key Management | scrypt KEK derivation; separate VAULT_MASTER_KEY from JWT_SECRET | ✅ |
| SC-13 | Cryptographic Protection | AES-256-GCM (FIPS 140-3 approved cipher); HMAC-SHA256 | ✅ |
| SC-28 | Protection at Rest | AES-256-GCM field-level encryption via Apex Vault | ✅ |
| SC-28(1) | Cryptographic protection | DEK/KEK envelope; per-field random salt and nonce | ✅ |

---

### SI — System and Information Integrity

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| SI-2 | Flaw Remediation | Dependency scanning (npm audit, pip audit); Docker image updates | ✅ |
| SI-3 | Malicious Code Protection | No user-executable code; input validated via Pydantic v2 | ✅ |
| SI-10 | Information Input Validation | Pydantic v2 strict models on all API endpoints | ✅ |

---

### CP — Contingency Planning

| Control | Requirement | HAVEN Implementation | Status |
|---------|------------|---------------------|--------|
| CP-9 | System Backup | MongoDB volume persistent; cloud provider snapshots | ✅ |
| CP-10 | System Recovery | Docker Compose restart policies (`unless-stopped`); stateless services | ✅ |

---

## OAuth Security Architecture (Login.gov / VA / SSA)

### PKCE (Proof Key for Code Exchange)

Mandatory for Login.gov and VA adapters per NIST SP 800-63B:

```
1. Client generates: code_verifier (64-byte random, base64url)
2. Client computes:  code_challenge = SHA256(code_verifier) base64url-encoded
3. Authorization:   GET /oauth/start -> code_challenge sent to agency
4. Agency stores:   code_challenge; issues authorization code
5. Token exchange:  POST /oauth/callback -> code_verifier sent; agency verifies
6. PKCE verifier:   stored server-side in oauth_states (MongoDB TTL 15min)
```

### State Token Security

| Property | Implementation |
|---------|---------------|
| Generation | `uuid4()` — cryptographically random |
| Storage | MongoDB `oauth_states` collection |
| TTL enforcement | MongoDB TTL index (`expires_at`, 15-min window) |
| Single-use | Deleted immediately on success OR expiry — never reusable |
| Binding | `state` binds to `integration_code + user_id + pkce_verifier + nonce` |
| Expiry env var | `OAUTH_STATE_TTL_SECONDS` (default 900) |

### Supported Agency Adapters

| Agency | Adapter Family | Auth Method | PKCE |
|--------|---------------|-------------|------|
| HUD, USDA, IRS, WIC, DOL, DMV, HHS, CMS | `logingov` | Login.gov OIDC | ✅ Mandatory |
| VA Benefits | `va` | VA Lighthouse API | ✅ Mandatory |
| SSA / SSI | `ssa` | SSA Developer Sandbox | Optional |
| Custom agencies | `oauth2` | Generic RFC 6749 | Optional |
| All (default) | `simulated` | Deterministic mock | N/A |

---

## FedRAMP Readiness Checklist

| Item | Status | Notes |
|------|--------|-------|
| AES-256-GCM encryption at rest | ✅ | Apex Vault — all PII fields |
| TLS 1.3 in transit | ✅ | nginx termination |
| FIPS 140-3 approved ciphers | ✅ | AES-256-GCM, HMAC-SHA256 |
| PKCE mandatory (Login.gov/VA) | ✅ | Enforced in `LoginGovAdapter`, `VaAdapter` |
| Single-use OAuth state tokens | ✅ | DB-level TTL + app-level delete on use |
| Token auto-rotation before expiry | ✅ | `token_refresh_job.py` |
| Immutable audit log (7yr) | ✅ | MongoDB TTL index |
| Role-based access control | ✅ | 4 roles, enforced per-endpoint |
| No secrets in code | ✅ | All credentials via env vars |
| System Security Plan (SSP) | 🔄 | In progress — see `09_FedRAMP_Compliance.md` |
| Login.gov sandbox registration | 🔄 | Pending registration at developers.login.gov |
| ATO (Authority to Operate) | 🔄 | Pending 3PAO assessment |
| FedRAMP Marketplace listing | 📋 | Post-ATO |

---

## Environment Variables for FedRAMP Mode

```bash
OAUTH_ENV=prod                          # Switch from sandbox to production endpoints
OAUTH_STATE_TTL_SECONDS=900             # State token TTL (15 min)
TOKEN_REFRESH_BUFFER_SECONDS=300        # Rotate tokens 5 min before expiry
VAULT_MASTER_KEY=<openssl rand -hex 32> # AES KEK derivation (NEVER reuse JWT_SECRET)

# Per-agency (example: Login.gov)
HUD_SEC8_OAUTH_CLIENT_ID=<login.gov client id>
HUD_SEC8_ADAPTER=logingov
OAUTH_REDIRECT_URI=https://homeishaven.cloud/api/integrations/oauth/callback
```

---

## Timeline to Authorization

| Milestone | Target |
|-----------|--------|
| Architecture validation complete | ✅ Done (v4.1.0) |
| Login.gov sandbox registration | Q1 2025 |
| SSP (System Security Plan) document | Q2 2025 |
| 3PAO security assessment | Q3 2025 |
| FedRAMP Tailored / Moderate ATO | Q3–Q4 2025 |
| GSA Schedule listing | 2026 |

---

*HAVEN Platform — homeishaven.cloud | "Help has a home." | Confidential*
