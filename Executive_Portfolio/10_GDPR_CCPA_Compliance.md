# HAVEN Platform — GDPR, CCPA & FTC Compliance
**Prepared by**: Johnathan R. Rodriquez  
**Audience**: Legal | Compliance Officers | Agency Partners | International Expansion  
**Status**: Fully Implemented | **Year**: 2025

---

## Overview

HAVEN processes sensitive personal data on behalf of housing-insecure residents. The platform is architected with privacy by design — not bolted on. Every data collection decision, retention period, and deletion mechanism has a legal basis and a technical enforcement mechanism.

Full policy documents:
- `DATA_RETENTION_POLICY.md` — retention schedules, legal bases, TTL index mappings
- `DPA_TEMPLATE.md` — Data Processing Agreement for agency partnerships

---

## Legal Basis for Processing

| Data Category | Legal Basis (GDPR Art. 6) | CCPA Basis | Notes |
|--------------|--------------------------|------------|-------|
| Resident account data | Contract (6(1)(b)) | Service provision | Required for platform use |
| Case records + intake data | Contract + Legal obligation (6(1)(b)(c)) | Service provision | Benefits navigation |
| Health-related data | Explicit consent (9(2)(a)) or legal obligation | Sensitive category | Disability status, pregnancy |
| Agency-submitted data | Legitimate interest (6(1)(f)) | Service provision | Case coordination |
| Audit log | Legal obligation (6(1)(c)) | Compliance | SOC 2 / FedRAMP / IRS requirement |
| BB chat sessions | Legitimate interest | Service provision | 90-day retention then auto-purge |
| Notifications | Legitimate interest | Service provision | 30-day TTL |

---

## GDPR Article 17 — Right to Erasure

### Cascading Purge Implementation

**Endpoint**: `DELETE /api/admin/users/{id}/purge`  
**Access**: Admin role + Architect role only  
**Response time**: Immediate (synchronous operation) + 30-day maximum (GDPR Art. 12(3))

**Deletion manifest** (returned on completion):

| Collection | Action |
|-----------|--------|
| `users` | Hard delete |
| `cases` | Hard delete (all owned cases) |
| `tasks` | Hard delete (all tasks on owned cases) |
| `messages` | Hard delete (sent + received on owned cases) |
| `documents` | Hard delete (vault-encrypted blobs orphaned) |
| `form_submissions` | Hard delete |
| `application_tracking` | Hard delete |
| `bb_sessions` | Hard delete |
| `notifications` | Hard delete |
| `integration_submissions` | Anonymized (`resident_id → "[purged]"`, `payload → {}`) |

**Why anonymize instead of delete `integration_submissions`**: Agency confirmation IDs and submission timelines are government records that agencies may need to retain for their own compliance. HAVEN anonymizes the resident reference while preserving the agency-facing record.

### Cryptographic Erasure

When a user record is deleted:
1. All vault-encrypted fields (SSN, DOB, phone, income, etc.) that belong to this resident become **orphaned AES-256-GCM ciphertext**
2. Even with access to `VAULT_MASTER_KEY`, the data cannot be re-associated to the deleted identity
3. This satisfies GDPR Recital 26 (anonymization standard) — rendered anonymous data is no longer personal data

---

## CCPA — California Consumer Privacy Act

### Consumer Rights Implemented

| Right | CCPA Section | HAVEN Implementation |
|-------|-------------|---------------------|
| Right to Know | 1798.100 | `GET /api/cases`, `GET /api/documents`, case PDF export |
| Right to Delete | 1798.105 | `DELETE /api/admin/users/{id}/purge` |
| Right to Correct | 1798.106 | `PATCH /api/users/me`, caseworker doc verification |
| Right to Opt-Out | 1798.120 | No data selling — not applicable (B2G model) |
| Right to Non-Discrimination | 1798.125 | All features available regardless of rights exercise |
| Right to Limit Sensitive PI | 1798.121 | Vault encryption limits access to role-authorized parties only |

### HAVEN Does Not Sell Data

HAVEN's B2G revenue model means:
- **No advertising**: Residents are never shown ads
- **No data brokering**: Resident data is never sold or shared for commercial purposes
- **Analytics**: Only anonymized aggregate metrics retained (case volumes, completion rates)

---

## FTC — Children's Online Privacy

HAVEN's primary user base is adults (18+) in crisis. Platform does not knowingly collect data from minors. If a minor is a household member in a case, their data is:
- Treated as protected family data under the case record
- Subject to the same retention and purge rules as adult data
- Not used for any purpose outside benefit navigation

COPPA compliance review pending for any future direct minor-facing features.

---

## Automated Data Lifecycle (TTL Indexes)

No manual cron jobs required — MongoDB TTL indexes enforce retention automatically:

| Collection | TTL Field | Window | Purpose |
|-----------|----------|--------|---------|
| `oauth_states` | `expires_at` | 15 minutes | Single-use state token security |
| `bb_sessions` | `last_message_at` | 90 days | AI session data minimization |
| `notifications` | `created_at` | 30 days | Operational data pruning |
| `audit_log` | `created_at` | 2,555 days (7yr) | Regulatory retention then purge |

---

## Data Subject Request Process

### For Residents (Self-Service — Roadmap Q2 2025)
- Settings → Account → "Request Data Export" → Case PDF + document list
- Settings → Account → "Request Data Deletion" → Submits purge ticket to admin

### For Residents (Current — Admin-Mediated)
1. Resident emails jawknee.rodriquez@gmail.com with subject: "Data Request — [email]"
2. Identity verified (matches account email)
3. Admin executes appropriate endpoint within 30 days (CCPA) / 30 days (GDPR)
4. Confirmation sent to resident with deletion manifest

### Response SLAs
| Right | CCPA | GDPR | HAVEN Target |
|-------|------|------|-------------|
| Acknowledgement | 10 days | 1 month | 72 hours |
| Completion | 45 days (extendable to 90) | 1 month (extendable to 3) | 30 days |
| Urgent (crisis case) | N/A | N/A | 72 hours |

---

## Data Minimization

HAVEN collects only what is required for benefit navigation:

| Principle | Implementation |
|-----------|---------------|
| Collection limitation | Only fields required for agency form templates collected |
| Purpose limitation | Data used only for benefit navigation; no secondary commercial use |
| Storage limitation | BB sessions 90d; notifications 30d; OAuth states 15min |
| Accuracy | Residents can update their own profile; caseworkers can correct intake data |

---

## Cross-Border Transfers

- **Data residency**: United States only (primary deployment)
- **GDPR transfers**: Standard Contractual Clauses (SCCs) available on request for EU-origin data
- **Current scope**: Santa Clara County / California — no international transfers in current deployment

---

## Privacy by Design Principles

| Principle | HAVEN Implementation |
|-----------|---------------------|
| Proactive, not reactive | Vault encryption, TTL indexes, RBAC designed-in from v1 |
| Privacy as default | Residents see only own data by default; no opt-in required for protection |
| Full functionality | Privacy controls don't degrade features; autofill works with encrypted fields |
| End-to-end security | TLS 1.3 in transit + AES-256-GCM at rest |
| Visibility + transparency | This policy document; audit log accessible to admin |
| Respect for user privacy | Data never sold; no ads; residents own their data |

---

## Compliance Contacts

**Data Controller Representative**: Johnathan R. Rodriquez  
**Email**: jawknee.rodriquez@gmail.com  
**Platform**: homeishaven.cloud  
**Response to regulatory inquiries**: Within 72 hours

---

*HAVEN Platform — homeishaven.cloud | "Help has a home." | Confidential*
