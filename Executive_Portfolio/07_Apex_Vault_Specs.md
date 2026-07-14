# HAVEN Platform — Apex Vault Specifications
**Classification**: Technical — Security Architecture  
**Prepared by**: Johnathan R. Rodriquez  
**Audience**: CTO | Security Auditors | SOC 2 / FedRAMP Reviewers  
**File**: `backend/vault.py` | **Version**: 4.1.0 | **Year**: 2025

---

## Overview

The **Apex Vault** is HAVEN's field-level authenticated encryption system. Every sensitive personally identifiable field is encrypted before persistence to MongoDB. Plaintext never reaches disk at any layer of the stack.

**Threat model addressed**:
- Attacker with read-only MongoDB access → cannot decrypt any field
- Attacker who steals a running process's environment → limited to current master key window; rotate to invalidate
- Compromised database backup → zero PII recoverable

---

## Cryptographic Specification

### Encryption Algorithm
- **Cipher**: AES-256-GCM (AEAD — authenticated encryption with associated data)
- **Key size**: 256-bit Data Encryption Key (DEK)
- **Nonce**: 96-bit (12 bytes) randomly generated per-field per-encryption
- **Tag**: 128-bit GCM authentication tag (built into AESGCM primitive)
- **Associated data**: `resource_type` string — binds ciphertext to its semantic context (prevents field substitution attacks)

### Key Derivation (KEK)
- **Function**: scrypt (NIST SP 800-132 compliant)
- **Parameters**: N=2¹⁴ (16,384), r=8, p=1, maxmem=64MB, dklen=32 bytes
- **Input**: `VAULT_MASTER_KEY` (env var, min 32 chars) + per-field random 16-byte salt
- **Output**: 256-bit Key Encryption Key (KEK)

### Envelope Encryption (DEK/KEK Pattern)
```
VAULT_MASTER_KEY + salt  --[scrypt]--> KEK (256-bit)
random DEK (256-bit)     --[AES-256-GCM, KEK]--> dek_wrap (encrypted DEK)
plaintext                --[AES-256-GCM, DEK]--> ciphertext
```
Each field gets its own fresh DEK and salt. Compromise of one field's DEK does not affect any other field.

### Integrity Verification
- **Method**: HMAC-SHA256 over `(ciphertext || nonce || dek_wrap || salt)`
- **Comparison**: `hmac.compare_digest()` — constant-time, immune to timing attacks
- **Verification order**: HMAC checked **before** any decryption attempt

### Storage Format (`EncryptedPayload`)
```json
{
  "version": 1,
  "algo": "AES-256-GCM",
  "ciphertext_b64": "<base64>",
  "nonce_b64": "<base64>",
  "dek_wrap_b64": "<base64>",
  "salt_b64": "<base64>",
  "hmac_b64": "<base64>",
  "created_at": "<ISO 8601 UTC>",
  "resource_type": "<field name>"
}
```

---

## Protected Fields

All fields in `SENSITIVE_FIELDS` are auto-encrypted via `protect_document()` before every MongoDB insert:

| Field | Collections | Resource Type |
|-------|------------|---------------|
| `ssn` | cases.intake_data, form_submissions.data | `ssn` |
| `dob` | cases.intake_data, form_submissions.data | `dob` |
| `phone` | users, cases.intake_data | `phone` |
| `income` | cases.intake_data, form_submissions.data | `income` |
| `bank_account` | form_submissions.data | `bank_account` |
| `address_line1` | cases.intake_data | `address_line1` |
| `case_number` | cases.intake_data | `case_number` |

**OAuth tokens** (access_token, refresh_token, id_token) are individually vault-encrypted before storage in `integration_tokens` using `encrypt_field()` with `resource_type="oauth_token:{field}"`.

**Integration credentials** (oauth_client_secret, api_key) vault-encrypted in `integration_requests.credentials_vault`.

---

## Router Coverage

All 12 backend routers are vault-patched. Zero plaintext PII surfaces remain:

| Router | Vault Operations |
|--------|-----------------|
| `auth_router` | `encrypt_field(phone)` on register/update |
| `cases_router` | `protect_document(intake_data)` on create/update; `unprotect_document()` on read |
| `case_ops_router` | Document bytes `encrypt_field()` before blob storage; `decrypt_field()` on download |
| `admin_router` | `encrypt_field(phone)` on create/update; full purge cascade |
| `users_router` | `encrypt_field(phone)` on self-update |
| `bb_router` | `_unvault()` on all user/case fields before autofill mapping |
| `forms_resources_router` | `protect_document(data)` on form submission |
| `templates_router` | `protect_document(data)` on template submission; `_unvault_value()` in autofill |
| `integrations_router` | `_encrypt_token_doc()` / `_decrypt_token_doc()` on all OAuth tokens; `protect_document(payload)` on submission |
| `integration_request_router` | `encrypt_field()` on oauth_client_secret and api_key |
| `case_packet_router` | `unprotect_document(intake_data)` + `_unvault_user()` before PDF render |
| `architect_router` | `_unvault_user()` on list/update |

---

## Key Rotation

### Manual Rotation (VaultRotator)
```python
from vault import VaultRotator

rotator = VaultRotator()
new_payload = rotator.rotate(old_payload, old_master_key, new_master_key)
```
Re-encrypts under new master without exposing plaintext. Old key can be retired after rotation completes.

### Rotation Procedure
1. Generate new `VAULT_MASTER_KEY` (`openssl rand -hex 32`)
2. Run rotation script against all encrypted collections
3. Verify HMAC integrity on all re-encrypted fields
4. Update `VAULT_MASTER_KEY` env var and redeploy
5. Audit log records rotation event

---

## GDPR Cryptographic Erasure

When `DELETE /api/admin/users/{id}/purge` is called:
1. All user records deleted from 9 collections
2. `integration_submissions` anonymized (`resident_id→[purged]`, `payload→{}`)
3. **Vault shred**: All previously encrypted fields that referenced this user's identity become orphaned AES-256-GCM ciphertext
4. Without the user identity record to anchor context, re-association is computationally infeasible even with `VAULT_MASTER_KEY`
5. Satisfies GDPR Recital 26 (anonymization) + Article 17 (right to erasure)

---

## Document Signed URLs

Documents use a separate HMAC-SHA256 signed URL mechanism (not the vault, but the same security tier):

```
SIGNED_URL_SECRET + doc_id + expires_timestamp  --[HMAC-SHA256]-->  sig
URL: /api/documents/{id}/download?expires={ts}&sig={hex}
```
- TTL: `SIGNED_URL_TTL_SECONDS` (default 900s / 15 min)
- Timing-safe comparison on verification (`hmac.compare_digest`)
- Every issuance and download emits an audit record
- S3 presigned URLs used when `BLOB_STORE_BACKEND=s3` (AWS KMS double-envelope)

---

## Environment Variables

| Variable | Purpose | Requirement |
|---------|---------|------------|
| `VAULT_MASTER_KEY` | AES KEK derivation input | Min 32 chars; NEVER reuse `JWT_SECRET` in production |
| `JWT_SECRET` | Fallback if `VAULT_MASTER_KEY` unset | Dev only; triggers warning in health endpoint |
| `SIGNED_URL_SECRET` | Document URL HMAC signing | Separate from `VAULT_MASTER_KEY` |
| `SIGNED_URL_TTL_SECONDS` | URL expiry window | Default 900; reduce to 300 for high-security |

---

## Health Endpoint Reporting

`GET /api/health` reports vault configuration without exposing key values:
```json
{
  "checks": {
    "vault": {
      "ok": true,
      "detail": "configured"
    },
    "signed_urls": {
      "ok": true,
      "detail": "configured"
    }
  }
}
```
Status values: `"configured"` | `"fallback_jwt"` | `"NOT_CONFIGURED"`

---

## Compliance Mappings

| Standard | Control | Apex Vault Mechanism |
|---------|---------|---------------------|
| SOC 2 CC6.1 | Logical access controls | AES-256-GCM field encryption; RBAC at API layer |
| SOC 2 CC6.7 | Transmission/disposal of data | Signed URLs; GDPR purge with crypto shred |
| FedRAMP SC-28 | Protection of information at rest | AES-256-GCM; scrypt KDF |
| FedRAMP SC-8 | Transmission confidentiality | TLS 1.3 (nginx termination) |
| FedRAMP IA-5 | Authenticator management | Vault-encrypted OAuth tokens; auto-rotation |
| HIPAA § 164.312(a)(2)(iv) | Encryption and decryption | AES-256-GCM + HMAC |
| GDPR Art. 17 | Right to erasure | Cryptographic erasure via identity deletion |
| GDPR Art. 32 | Security of processing | AES-256-GCM + scrypt + HMAC-SHA256 |

---

*HAVEN Platform — homeishaven.cloud | "Help has a home." | Confidential*  
*Apex Vault: backend/vault.py | Token Refresh: backend/token_refresh_job.py*
