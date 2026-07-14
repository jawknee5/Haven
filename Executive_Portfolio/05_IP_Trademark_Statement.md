# HAVEN Platform — IP & Trademark Statement
**Prepared by**: Johnathan R. Rodriquez  
**Audience**: Investors | Legal | Partners | Government Procurement  
**Year**: 2025

---

## Ownership Statement

**HAVEN is 100% owned and created by Johnathan R. Rodriquez.**

No third-party IP encumbrances. No co-founders with equity claims. No GPL/AGPL viral licensing in the core product. The platform was designed, engineered, and deployed entirely by the founder.

---

## Trademark

| Asset | Status |
|-------|--------|
| **"HAVEN"** (wordmark) | Applied for federal registration — USPTO |
| **"Help has a home."** (tagline) | Common law trademark — in continuous commercial use |
| **homeishaven.cloud** | Registered, active, primary domain |
| **Logo & UI design system** | Proprietary — not licensed for third-party use |
| **"BB"** (AI concierge name/persona) | Common law trademark — product persona |

---

## Software & Codebase

| Item | Detail |
|------|--------|
| Source code | Proprietary, closed-source |
| Repository | github.com/jawknee5/Haven (private) |
| License | Custom commercial license — not open-source |
| Version | 4.1.0 (production-deployed) |
| Language breakdown | Python 3.12 (backend) / TypeScript + React 19 (frontend) |

---

## Patent Portfolio (Pending)

The following innovations are novel, non-obvious, and ready for patent filing:

### 1. AI-Powered Civic Concierge with Crisis Detection (BB)
- Method for real-time classification of user messages into crisis severity tiers
- Role-adaptive response generation (resident/caseworker/admin) using local LLM
- Deterministic form autofill via semantic field mapping (zero LLM cost)
- Browser automation integration for real-time agency form submission

### 2. Multi-Agency OAuth Integration Framework
- Unified adapter architecture (logingov/va/ssa/oauth2/simulated) for government API interoperability
- Single-use PKCE state token management with MongoDB TTL enforcement
- Proactive token rotation background job with vault-encrypted credential storage
- Simulated mode fallback for deterministic testing without live credentials

### 3. Caseworker Workload Heatmap with Predictive Load Balancing
- Real-time visual representation of caseworker capacity (0–100 load score)
- Drag-drop case reassignment with immediate persistence
- Urgency-weighted queue ordering algorithm

### 4. Encrypted Vault for Sensitive Government Documents (Apex Vault)
- AES-256-GCM field-level envelope encryption (DEK/KEK architecture)
- scrypt key derivation with per-field random salt
- HMAC-SHA256 tamper-evident integrity verification
- Cryptographic erasure via identity-record deletion (GDPR compliance)

---

## Third-Party Dependency Compliance

All open-source dependencies are properly licensed. No license conflicts with commercial distribution:

| Dependency | License | Commercial Use |
|-----------|---------|---------------|
| React 19 | MIT | ✅ |
| FastAPI | MIT | ✅ |
| MongoDB (SSPL) | SSPL | ✅ (commercial terms available) |
| Ollama | MIT | ✅ |
| Leaflet | BSD-2-Clause | ✅ |
| TailwindCSS | MIT | ✅ |
| Pydantic | MIT | ✅ |
| python-jose | MIT | ✅ |
| ReportLab | BSD | ✅ |
| shadcn/ui | MIT | ✅ |

**No GPL or AGPL dependencies** in the core product. All derivative works remain proprietary.

---

## Data Ownership

| Data Type | Owner | HAVEN's Role |
|-----------|-------|-------------|
| Resident personal data | The resident | Data Processor (holds in trust) |
| Government agency data | The agency | Data Processor (per DPA) |
| Case records | Resident + agency (jointly) | Custodian |
| Aggregated analytics | HAVEN | Data Controller (anonymized, no PII) |
| Platform source code | Johnathan R. Rodriquez | Sole owner |
| AI model weights (Ollama) | Meta / Ollama (MIT) | Licensed user |

---

## Regulatory Compliance Posture

| Regulation | Status | Notes |
|-----------|--------|-------|
| HIPAA | Aligned | BAA available on request |
| CCPA | ✅ Implemented | Right to erasure endpoint live |
| GDPR | ✅ Implemented | DPA template ready; SCCs available |
| FedRAMP | 🔄 Pending | Architecture validated; registration in progress |
| SOC 2 Type II | 🔄 Audit window open | Expected Q1 2025 |
| Section 508 | ✅ Implemented | WCAG 2.1 AA — accessibility report on file |
| WCAG 2.1 AA | ✅ Implemented | Full audit report in portfolio |

---

## No Encumbrances

- ✅ 100% founder-owned pre-seed — no outside investors hold IP rights
- ✅ No joint development agreements that would dilute ownership
- ✅ No open-source contributions accepted that carry licensing obligations
- ✅ All contractor/freelance work (if any) done under work-for-hire agreements
- ✅ Patent-ready: core innovations documented, prior art searches underway

---

*HAVEN Platform — homeishaven.cloud | "Help has a home." | Confidential*  
*All rights reserved. Johnathan R. Rodriquez © 2025*
