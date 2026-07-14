# HAVEN Platform — Data Processing Agreement (DPA) Template
**Version**: 1.0  
**Document Type**: Template — complete [BRACKETED] fields before execution  
**Governing Law**: State of California, United States  
**Platform Operator**: Johnathan R. Rodriquez ("The Architect"), HAVEN Platform, homeishaven.cloud

---

## DATA PROCESSING AGREEMENT

**Between:**

**HAVEN Platform** ("Data Processor" / "Platform")  
Operated by: Johnathan R. Rodriquez  
Contact: jawknee.rodriquez@gmail.com  
Platform: homeishaven.cloud

**And:**

**[AGENCY FULL LEGAL NAME]** ("Data Controller" / "Agency")  
Address: [AGENCY ADDRESS]  
Contact: [AGENCY DATA OFFICER NAME], [TITLE]  
Email: [AGENCY EMAIL]  
Phone: [AGENCY PHONE]

*Collectively referred to as the "Parties."*

---

## RECITALS

WHEREAS, the Agency operates [DESCRIBE PROGRAM — e.g., "the HUD Section 8 Housing Choice Voucher Program for Santa Clara County"] ("the Program");

WHEREAS, HAVEN operates a civic technology platform that provides housing-insecure residents with unified access to government benefits, case management, and agency integrations;

WHEREAS, the Parties wish to establish a data processing relationship under which HAVEN processes personal data on behalf of the Agency to facilitate resident benefit applications, case management, and inter-agency coordination;

NOW THEREFORE, the Parties agree as follows:

---

## ARTICLE 1 — DEFINITIONS

**1.1** "Personal Data" means any information relating to an identified or identifiable natural person, including but not limited to: name, email address, phone number, date of birth, Social Security Number, income data, residential address, household composition, disability status, immigration status, and case records.

**1.2** "Processing" means any operation performed on Personal Data, including collection, recording, storage, retrieval, use, disclosure, erasure, or destruction.

**1.3** "Data Subject" means a resident, applicant, or household member whose Personal Data is processed under this Agreement.

**1.4** "Apex Vault" means HAVEN's AES-256-GCM authenticated encryption system used to protect sensitive fields at rest.

**1.5** "Sub-processor" means any third party engaged by HAVEN to process Personal Data on behalf of the Agency.

**1.6** "Breach" means any accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, Personal Data.

---

## ARTICLE 2 — SUBJECT MATTER AND SCOPE

**2.1 Purpose.** HAVEN will process Personal Data solely for the following purposes:
- Pre-screening residents for eligibility under [PROGRAM NAME]
- Submitting benefit applications on behalf of Data Subjects
- Tracking application status and communicating outcomes to residents
- Facilitating caseworker coordination and case management
- Generating compliance and impact reports for the Agency

**2.2 Categories of Data.** The following categories of Personal Data will be processed:

| Category | Examples | Sensitivity |
|----------|---------|-------------|
| Identity | Name, DOB, SSN, State ID | High — vault-encrypted |
| Contact | Email, phone, address | High — vault-encrypted |
| Financial | Income, assets, employment | High — vault-encrypted |
| Household | Composition, dependents | Medium |
| Health | Disability status, pregnancy | High — vault-encrypted |
| Case records | Applications, documents, notes | High |
| Immigration | Status (where program-relevant) | High — vault-encrypted |

**2.3 Data Subjects.** Residents of [JURISDICTION] applying for benefits under [PROGRAM NAME] who consent to HAVEN processing their data.

**2.4 Duration.** This Agreement commences on [START DATE] and remains in effect until terminated per Article 11, or until the underlying integration agreement expires.

---

## ARTICLE 3 — OBLIGATIONS OF THE DATA PROCESSOR (HAVEN)

**3.1 Lawful Instructions.** HAVEN will process Personal Data only on documented instructions from the Agency, unless required by law.

**3.2 Confidentiality.** All HAVEN personnel with access to Personal Data are bound by confidentiality obligations.

**3.3 Security Measures.** HAVEN implements and maintains the following technical and organizational measures:

| Measure | Implementation |
|---------|---------------|
| Encryption at rest | AES-256-GCM (Apex Vault) — field-level envelope encryption |
| Encryption in transit | TLS 1.3 (nginx termination) |
| Key management | scrypt KEK derivation; HMAC-SHA256 integrity verification |
| Access control | Role-based (resident/caseworker/admin/architect); JWT authentication |
| Audit logging | Immutable insert-only audit_log; 7-year retention |
| Signed URLs | HMAC-SHA256 signed document access; 15-min TTL |
| Token rotation | Single-use OAuth refresh tokens; auto-rotation before expiry |
| Breach detection | Audit log anomaly detection; health monitoring at /api/health |
| Vulnerability management | Dependency scanning; Docker image hardening |

**3.4 Sub-processors.** HAVEN will not engage sub-processors to process Agency Personal Data without prior written consent. Current approved sub-processors:

| Sub-processor | Purpose | Location | DPA in Place |
|--------------|---------|----------|--------------|
| [HOSTING PROVIDER] | Infrastructure | United States | Yes |
| MongoDB Atlas (if applicable) | Database | United States | Yes |
| Ollama (local) | AI inference | Local (no data egress) | N/A |

**3.5 Data Subject Rights.** HAVEN will assist the Agency in responding to Data Subject rights requests (access, rectification, erasure, portability) within the timeframes specified in HAVEN's Data Retention Policy.

**3.6 Breach Notification.** HAVEN will notify the Agency without undue delay, and no later than **72 hours** after becoming aware of a Breach affecting Agency Personal Data.

**3.7 Deletion.** Upon termination of this Agreement, HAVEN will, at the Agency's election, either delete or return all Agency Personal Data within **30 days**, and provide written certification of deletion.

**3.8 Audit Rights.** HAVEN will make available all information necessary to demonstrate compliance with this Agreement and will allow for and contribute to audits conducted by the Agency or a mandated auditor, no more than once per calendar year, with 30 days' notice.

---

## ARTICLE 4 — OBLIGATIONS OF THE DATA CONTROLLER (AGENCY)

**4.1 Lawful Basis.** The Agency confirms it has a lawful basis for sharing Personal Data with HAVEN under applicable law (GDPR Art. 6, CCPA, or relevant federal statute).

**4.2 Data Subject Consent.** The Agency is responsible for obtaining and documenting Data Subject consent prior to referring individuals to HAVEN, or for establishing another lawful basis for processing.

**4.3 Accuracy.** The Agency will take reasonable steps to ensure Personal Data shared with HAVEN is accurate and up to date.

**4.4 Instructions.** The Agency will provide processing instructions in writing. HAVEN will flag any instruction it believes violates applicable law.

---

## ARTICLE 5 — DATA TRANSFERS

**5.1** All Personal Data processed under this Agreement will remain within the United States.

**5.2** HAVEN will not transfer Personal Data to any jurisdiction outside the United States without prior written consent from the Agency and appropriate safeguards (e.g., SCCs for EU-origin data).

---

## ARTICLE 6 — COMPLIANCE CERTIFICATIONS

HAVEN is working toward and/or maintains the following compliance certifications relevant to this Agreement:

| Standard | Status | Target Date |
|---------|--------|------------|
| SOC 2 Type II | Audit in progress | Q1 2025 |
| FedRAMP Baseline | Architecture validated | Q3–Q4 2025 |
| HIPAA BAA | Available on request | Q2 2025 |
| WCAG 2.1 AA | Implemented | Current |
| CCPA compliance | Implemented | Current |

---

## ARTICLE 7 — LIABILITY

**7.1** Each Party will be liable for damages caused by processing that violates this Agreement to the extent they are responsible.

**7.2** HAVEN's total aggregate liability under this Agreement will not exceed **[DOLLAR AMOUNT OR INSURANCE LIMIT]** per incident, except in cases of gross negligence or willful misconduct.

**7.3** Neither Party will be liable for indirect, consequential, or punitive damages.

---

## ARTICLE 8 — INDEMNIFICATION

Each Party will indemnify and hold the other harmless against third-party claims arising from its own breach of this Agreement, negligence, or violation of applicable law.

---

## ARTICLE 9 — CONFIDENTIALITY

Both Parties will maintain the confidentiality of this Agreement and all Personal Data processed hereunder. Neither Party will disclose the terms of this Agreement without the other's prior written consent, except as required by law.

---

## ARTICLE 10 — GOVERNING LAW & DISPUTE RESOLUTION

**10.1** This Agreement is governed by the laws of the State of California.

**10.2** Disputes will first be addressed through good-faith negotiation for 30 days. If unresolved, disputes will be submitted to binding arbitration in Santa Clara County, California under JAMS rules.

---

## ARTICLE 11 — TERM AND TERMINATION

**11.1** This Agreement is effective from the date of last signature and continues until:
- The underlying integration agreement expires or is terminated; or
- Either Party provides 30 days' written notice of termination; or
- HAVEN ceases operations.

**11.2** Articles 3.7 (Deletion), 7 (Liability), 8 (Indemnification), and 9 (Confidentiality) survive termination.

---

## ARTICLE 12 — AMENDMENTS

Amendments to this Agreement require written consent of both Parties. HAVEN will provide 30 days' notice of any material changes to its security measures or sub-processors.

---

## SIGNATURES

**HAVEN Platform — Data Processor**

Signature: ___________________________  
Name: Johnathan R. Rodriquez  
Title: Founder & Architect  
Date: ___________________________  
Email: jawknee.rodriquez@gmail.com

---

**[AGENCY FULL LEGAL NAME] — Data Controller**

Signature: ___________________________  
Name: [AUTHORIZED SIGNATORY NAME]  
Title: [TITLE]  
Date: ___________________________  
Email: [EMAIL]

---

## ANNEX A — TECHNICAL AND ORGANIZATIONAL MEASURES (TOMs)

### A.1 Encryption
- **At rest**: AES-256-GCM authenticated encryption via Apex Vault. All PII fields (SSN, DOB, income, phone, address) encrypted at field level with unique DEK per field, envelope-encrypted under a scrypt-derived KEK.
- **In transit**: TLS 1.3 minimum for all external traffic. Internal Docker network traffic isolated via `haven-net` bridge.

### A.2 Access Control
- JWT-based stateless authentication (HS256, 72-hour TTL)
- Role-based access: resident | caseworker | admin | architect
- Residents access only their own cases and documents
- PKCE mandatory for all OAuth flows (Login.gov, VA, SSA)
- OAuth state tokens: single-use, 15-minute TTL, MongoDB TTL-index enforced

### A.3 Audit & Monitoring
- Immutable audit_log: insert-only, 7-year retention, indexed by actor + action + timestamp
- Every data mutation (create, update, delete, download, purge) emits an audit record
- Health monitoring: `/api/health`, `/api/health/live`, `/api/health/ready`
- Token auto-refresh job: proactive rotation 5 minutes before expiry

### A.4 Incident Response
- Breach detection: audit log anomaly analysis; Sentry integration (configurable)
- Response SLA: 72-hour Agency notification; 72-hour regulatory notification (where required)
- Containment: JWT secret rotation invalidates all active sessions instantly

### A.5 Data Minimization
- Only fields required for benefit eligibility processed
- Autofill maps only declared fields; no speculative data collection
- BB session data expires after 90 days

### A.6 Deletion
- GDPR/CCPA purge endpoint: cascading hard-delete across 9 collections
- Vault shred: encrypted fields become orphaned ciphertext post-deletion
- TTL indexes: oauth_states (15 min), bb_sessions (90 days), notifications (30 days)

---

*HAVEN Platform — homeishaven.cloud | "Help has a home."*  
*This template requires legal review before execution. Not legal advice.*
