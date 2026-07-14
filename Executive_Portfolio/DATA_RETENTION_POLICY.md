# HAVEN Platform — Data Retention Policy
**Version**: 1.0  
**Effective Date**: 2025  
**Owner**: Johnathan R. Rodriquez, Founder & Architect  
**Applies To**: All data processed by the HAVEN civic technology platform (homeishaven.cloud)  
**Regulatory Basis**: GDPR Article 5(1)(e), CCPA 1798.100–1798.125, HIPAA 45 CFR § 164.530(j), IRS Rev. Proc. 98-25

---

## 1. Purpose

This policy establishes the retention periods, deletion procedures, and legal bases for all personal data processed by HAVEN. It satisfies:

- **GDPR Article 5(1)(e)** — Storage limitation principle
- **CCPA Section 1798.105** — Right to deletion
- **SOC 2 Type II CC6.5** — Disposal of data assets
- **FedRAMP AU-11** — Audit record retention

---

## 2. Scope

This policy applies to all personally identifiable information (PII) and sensitive personal information (SPI) processed by HAVEN, including data belonging to:

- **Residents** — Housing-insecure individuals using HAVEN for benefits navigation
- **Caseworkers** — Social workers, volunteers, and agency staff
- **Administrators** — Platform operators
- **Agency Partners** — Government and nonprofit agencies integrated via OAuth

---

## 3. Retention Schedule

### 3.1 Active User Data

| Data Type | Collection | Retention Period | Legal Basis | Deletion Trigger |
|-----------|-----------|-----------------|-------------|-----------------|
| User account (name, email, role) | `users` | Duration of account + 90 days | Contract (GDPR Art. 6(1)(b)) | Account deletion or purge request |
| Phone number (vault-encrypted) | `users` | Duration of account + 90 days | Contract | Account deletion or purge request |
| Password hash (bcrypt) | `users` | Duration of account | Security necessity | Account deletion |

### 3.2 Case & Application Data

| Data Type | Collection | Retention Period | Legal Basis | Notes |
|-----------|-----------|-----------------|-------------|-------|
| Case records | `cases` | 7 years from case closure | Legal obligation (HHS, HUD records) | Intake data vault-encrypted |
| Tasks | `tasks` | Duration of case | Legitimate interest | Deleted on case purge |
| Messages | `messages` | 7 years from case closure | Legal obligation | Per-case threads |
| Documents (encrypted blobs) | `documents` | 7 years from upload | Legal obligation (court, benefits) | Vault-encrypted at rest |
| Form submissions | `form_submissions` | 7 years from submission | Legal obligation (agency SLA) | Data fields vault-encrypted |
| Application tracking | `application_tracking` | 7 years from submission | Legal obligation | Agency confirmation IDs retained |

### 3.3 AI & Session Data

| Data Type | Collection | Retention Period | Deletion Method |
|-----------|-----------|-----------------|----------------|
| BB chat sessions | `bb_sessions` | 90 days from last message | MongoDB TTL index (auto-delete) |
| BB browser sessions | `bb_browser_sessions` | Session end + 24 hours | Application-level cleanup on shutdown |

### 3.4 System & Security Data

| Data Type | Collection | Retention Period | Regulatory Basis |
|-----------|-----------|-----------------|-----------------|
| Audit log | `audit_log` | 7 years (2,555 days) | SOC 2 CC6.7, FedRAMP AU-11, IRS 7-year rule |
| OAuth states | `oauth_states` | 15 minutes (TTL index) | Security (single-use state tokens) |
| OAuth tokens (vault-encrypted) | `integration_tokens` | Duration of authorization | FedRAMP IA-5 |
| Integration submissions | `integration_submissions` | 7 years | Legal obligation (agency records) |

### 3.5 Operational Data

| Data Type | Collection | Retention Period |
|-----------|-----------|-----------------|
| Notifications | `notifications` | 30 days (TTL index auto-delete) |
| Resources (agency directory) | `resources` | Indefinite (no PII) |
| Custom forms | `forms` | Until deleted by caseworker |

---

## 4. Deletion Procedures

### 4.1 Resident Right to Erasure (GDPR Art. 17 / CCPA 1798.105)

Residents may request complete data deletion via:
1. **API**: `DELETE /api/admin/users/{id}/purge` (admin-initiated)
2. **Email**: jawknee.rodriquez@gmail.com with subject "Data Deletion Request"
3. **In-App**: Settings → Account → Request Data Deletion (roadmap Q2 2025)

**Cascading Purge Scope** (implemented in `admin_router.py`):

| Collection | Action |
|-----------|--------|
| `users` | Hard delete |
| `cases` | Hard delete (all owned cases) |
| `tasks` | Hard delete (all tasks on owned cases) |
| `messages` | Hard delete (sent + received on owned cases) |
| `documents` | Hard delete (vault-encrypted blobs orphaned — irreversible) |
| `form_submissions` | Hard delete |
| `application_tracking` | Hard delete |
| `bb_sessions` | Hard delete |
| `notifications` | Hard delete |
| `integration_submissions` | Anonymized (`resident_id` → `[purged]`, `payload` → `{}`) |

**Vault shred**: When the user record is deleted, all vault-encrypted fields referencing that identity become orphaned AES-256-GCM ciphertext. Even with access to `VAULT_MASTER_KEY`, the data cannot be re-associated to the deleted identity. This satisfies the cryptographic erasure standard under GDPR Recital 26.

**Response Time**: Within 30 days of verified request (CCPA standard); within 72 hours for high-urgency requests.

### 4.2 Automated TTL Deletion

The following are deleted automatically by MongoDB TTL indexes — no manual action required:

| Collection | TTL Setting | Index Name |
|-----------|------------|-----------|
| `oauth_states` | `expires_at` field (15 min) | `oauth_states_ttl` |
| `bb_sessions` | 90 days from `last_message_at` | `bb_sessions_ttl` |
| `notifications` | 30 days from `created_at` | `notifications_ttl` |
| `audit_log` | 2,555 days from `created_at` | `audit_ttl` |

### 4.3 Scheduled Retention Review

- **Quarterly**: Review active user accounts against inactivity thresholds
- **Annually**: Full retention audit — verify TTL indexes are running, spot-check deleted user data is not recoverable
- **On breach**: Immediate purge of affected records per incident response plan

---

## 5. Legal Holds

When a case is subject to active litigation or regulatory investigation:
1. Admin sets `legal_hold: true` on affected cases via architect console
2. TTL indexes are bypassed for held records
3. Hold is logged in `audit_log` with actor, timestamp, and case reference
4. Hold is released only by an Architect-role user with documented reason

---

## 6. Cross-Border Data Transfers

- **Data residency**: United States (primary)
- **Storage**: homeishaven.cloud VPS / cloud provider (US region)
- **GDPR transfers**: Standard Contractual Clauses (SCCs) available on request for EU resident data
- **International access**: Not applicable in current deployment scope (Santa Clara County / California)

---

## 7. Data Subject Rights

| Right | GDPR Article | CCPA Section | HAVEN Endpoint / Process |
|-------|-------------|-------------|--------------------------|
| Access | Art. 15 | 1798.100 | `GET /api/cases`, `GET /api/documents` |
| Rectification | Art. 16 | — | `PATCH /api/users/me` |
| Erasure | Art. 17 | 1798.105 | `DELETE /api/admin/users/{id}/purge` |
| Portability | Art. 20 | 1798.100 | Case PDF export (`GET /api/cases/{id}/packet.pdf`) |
| Restriction | Art. 18 | — | Contact architect; account deactivation |
| Object | Art. 21 | 1798.120 | Opt-out form (roadmap Q2 2025) |

Response to all rights requests: within **30 days** (CCPA) / **30 days** (GDPR, extendable to 90 days for complex requests).

---

## 8. Security of Retained Data

All retained PII is protected by:

- **AES-256-GCM** authenticated encryption (Apex Vault) — sensitive fields encrypted at field level
- **scrypt** key derivation (N=2¹⁴, r=8, p=1) for KEK generation
- **HMAC-SHA256** integrity verification on all vault envelopes
- **TLS 1.3** for all data in transit
- **bcrypt** for password storage (never plaintext or reversibly hashed)
- **Role-based access control** — residents access only their own data
- **Immutable audit log** — all access to retained data is logged with actor + timestamp

---

## 9. Policy Review

This policy is reviewed:
- **Annually** by the Architect
- **On material changes** to the platform's data processing activities
- **On regulatory changes** affecting GDPR, CCPA, HIPAA, or FedRAMP obligations

**Next review**: Q1 2026  
**Contact**: jawknee.rodriquez@gmail.com

---

*HAVEN Platform — homeishaven.cloud | "Help has a home."*
