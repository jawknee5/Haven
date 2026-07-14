# HAVEN Platform — Unified Documentation Corpus (v3.0)
**Status**: Current  
**Last Updated**: 2025  
**Creator**: Johnathan R. Rodriquez  
**Live Domain**: homeishaven.cloud  
**Tagline**: "Help has a home."

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Features](#core-features)
4. [BB — AI Civic Concierge](#bb--ai-civic-concierge)
5. [Agency Integrations](#agency-integrations)
6. [Tech Stack](#tech-stack)
7. [Complete API Reference](#complete-api-reference)
8. [Data Model](#data-model)
9. [Environment Variables](#environment-variables)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Demo Accounts & Seeded Data](#demo-accounts--seeded-data)
12. [Known Limitations](#known-limitations)

---

## Platform Overview

**HAVEN is a universal civic navigation platform built for everyone.** Any person — regardless of income, housing status, background, or circumstance — who needs to interact with government at any level, for any reason, is HAVEN’s user.

HAVEN is not a housing-only platform. It was built to simplify, guide, and automate the full scope of what government touches in daily life:

- **Justice System** — court filings, eviction defense, legal aid, reentry
- **Transportation** — DMV (renewals, registration, title transfers, REAL ID), public transit info and services, paratransit
- **Benefits & Aid** — SNAP/CalFresh, SSI, TANF/CalWORKs, WIC, General Assistance
- **Employment** — Unemployment insurance (EDD), WIOA workforce training, job placement, reentry employment
- **Housing — Emergency** — Coordinated Entry, shelter navigation, crisis bed availability
- **Housing — Interim** — Transitional housing, rapid rehousing, Homekey
- **Housing — Long-Term** — Section 8 Housing Choice Vouchers, HUD-VASH, affordable housing applications
- **Healthcare** — Medi-Cal, Medicare, Covered California, free clinics, mental health, substance use
- **IRS & Tax** — VITA free filing, EITC, CTC, amended returns, tax debt navigation
- **Veterans Services** — VA disability compensation, pension, HUD-VASH, VA healthcare
- **Domestic Violence** — Safety planning, DV shelter routing, restraining orders, survivor services
- **Immigration** — Legal services, DACA navigation, naturalization, immigration court
- **Senior Services** — IHSS, Meals on Wheels, Sourcewise, Medicare Part D
- **Youth Services** — Drop-in centers, LGBTQ youth, foster care navigation
- **Childcare** — 4Cs, First 5, Head Start, childcare subsidy applications
- **Utilities** — LIHEAP, PG&E CARE/FERA, water assistance
- **Mental Health** — County behavioral health, crisis stabilization, recovery
- **Substance Use** — Sobering centers, residential programs, SAMHSA routing
- **Every other area where government intersects with daily life**

### Mission
Make every interaction between a person and their government simple, dignified, and successful.

### Data Processing
HAVEN collects, transmits, stores, and processes highly sensitive PII including SSNs, DOBs, tax forms, income brackets, and medical routing data — all protected via the Apex Vault (AES-256-GCM field-level encryption).

### Core Value Propositions
- **Universal Access**: Built for everyone — any income, any situation, any government domain
- **BB — Digital AI Caseworker**: Multi-language AI that guides or automates every interaction end-to-end
- **Zero Barriers**: Works offline, supports voice, accessible on any device
- **Interoperable**: Connects to 12 major government agencies via OAuth
- **Privacy-Forward**: Apex Vault (AES-256-GCM), zero-knowledge where possible, HIPAA-aligned
- **Dignity-First Design**: Clean, plain-language UX — no bureaucratic jargon

---

## User Roles & Permissions

### RESIDENT
**Access**: /resident, /survival-bible, /camping, /crisis, /resources, /forms/templates  
**Capabilities**:
- Create and track personal cases
- Upload documents (ID, income, residency, medical, other)
- Fill and submit 13 government agency forms with BB autofill
- Chat with BB for guidance, form help, emotional support, crisis resources
- Message assigned caseworker per-case
- Export case as PDF packet for appointments/court
- Access Survival Bible and Camping survival drills
- View interactive resource map
- One-click offline mode

**Demo Account**: `resident@haven.demo` / `james@haven.demo` / `sarah@haven.demo` (password: Demo2026!)

---

### CASEWORKER
**Access**: /caseworker, /caseworker/cases/:id, /caseworker/forms, /caseworker/bb-browser, /caseworker/integrations, /caseworker/workload  
**Capabilities**:
- View full case queue (urgency-sorted, filterable)
- Self-assign unassigned cases
- Create and manage tasks per case
- Two-way messaging with residents
- Verify uploaded documents
- Use BB to autofill forms deterministically (no cost)
- Submit applications to 12 integrated agencies
- Export case PDFs for handoffs
- View team workload heatmap
- Operate BB Browser Control (Playwright-powered) to automate real agency websites
- Build custom intake forms

**Demo Account**: `caseworker@haven.demo` / `Alex Rivera` (password: Demo2026!)

---

### ADMIN
**Access**: /admin, /admin/users, /admin/integrations, /admin/audit  
**Capabilities**:
- Full caseworker permissions + system administration
- Create, edit, deactivate users
- Connect/disconnect agency OAuth integrations (Login.gov, VA, SSA, etc.)
- View platform-wide audit log
- Access system analytics and health dashboard
- Manage form templates and custom forms
- Workload heatmap with drag-drop case reassignment

**Demo Account**: `admin@haven.demo` / `Jordan Lee` (password: Demo2026!)

---

### ARCHITECT
**Access**: Superuser access to all systems  
**Capabilities**:
- Everything admins can do
- System configuration and database management
- Advanced observability and debugging
- Full audit trail access

**Demo Account**: `jawknee.rodriquez@gmail.com` (password: Architect2026!)

---

## Core Features

### 1. Case Management
- **Central Unit**: Each case belongs to one resident; may be assigned to one caseworker
- **Status Lifecycle**: new → enriched → routed → active → resolved → closed
- **Urgency Scoring**: 0–100 (higher = more urgent, displayed as colored ring on dashboard)
- **Categorization**: housing | food | health | benefits | employment | legal | crisis | general
- **Intake Data**: Flexible key-value store for custom information capture
- **Case Detail Page**: Full history, tasks, messages, documents, form submissions in one view
- **Reassignment**: Drag-drop via workload heatmap (admin/architect only)

### 2. Task Management
- **Priority Levels**: low | medium | high | urgent
- **Statuses**: open | in_progress | done
- **Optional Due Dates**: Integrated with case workflow
- **Visibility**: Per-case, accessible in case detail and workload heatmap
- **Tracking**: Audit-logged for accountability

### 3. Document Management
- **Resident Upload**: ResidentDocumentsPage supports drag-drop and file browser
- **Document Types**: identity | income | residency | medical | other
- **Verification**: Caseworkers can mark as verified (timestamped, audited)
- **Export**: Included in case PDF packets
- **Storage**: Base64 in MongoDB for demo; production: S3/cloud blob with signed URLs

### 4. Secure Messaging
- **Per-Case Threads**: Only resident + assigned caseworker can see
- **Read/Unread Tracking**: Visible message status
- **Message History**: Last 20 included in case PDF export
- **Timestamps**: All messages logged with sender role (resident|caseworker)

### 5. Form Templates (13 Pre-Built)
**Location**: /resident/applications & /forms/templates

**Agency Coverage**:
1. **CalFresh / SNAP Application** (USDA) — Food | 30-day SLA
2. **HUD Section 8 Housing Choice Voucher** (HUD) — Housing | 30-day SLA
3. **Medi-Cal / Medicaid Enrollment** (CMS) — Health | 45-day SLA
4. **VA Disability Compensation Claim** (VA) — Benefits | 125-day SLA
5. **SSI — Supplemental Security Income** (SSA) — Benefits | 90-day SLA
6. **TANF / CalWORKs Cash Aid** (HHS) — Benefits | 45-day SLA
7. **WIC — Women, Infants & Children** (CA DPH) — Health | 10-day SLA
8. **Unemployment Insurance Claim (EDD)** (DOL) — Employment | 21-day SLA
9. **IRS VITA Free Tax Filing** (IRS) — Benefits | 21-day SLA
10. **DMV REAL ID / State ID Application** (CA DMV) — Identity | 14-day SLA
11. **Eviction Defense Response** (Santa Clara Court) — Legal | 3-day SLA
12. **Child Welfare Services Referral** (CPS) — Family | 1-day SLA
13. **HAVEN Universal Intake Form** (HAVEN) — Intake | 1-day SLA

**Features Per Template**:
- BB Autofill (deterministic, zero cost)
- Manual field editing
- PDF export (HAVEN-branded, ReportLab)
- Submission to agency with confirmation ID
- Application tracking across agencies

### 6. Case Packet PDF Export
**Endpoint**: `GET /api/cases/{id}/packet.pdf`  
**Access**: Resident (owner) | Assigned caseworker | Admin | Architect  
**Filename**: `HAVEN_CasePacket_{case_id[:8]}.pdf`

**Contents** (8-section layout with navy HAVEN header bars):
1. **Cover Page** — Case ID, title, category, status, urgency, resident, caseworker, timestamps
2. **Case Summary** — Full description + intake_data key/value grid
3. **People** — Resident and caseworker contact cards
4. **Submitted Applications** — All form submissions for this case
5. **Documents Index** — Filename, type, upload date, verification status
6. **Tasks & Notes** — Title, priority, status, due date
7. **Message Digest** — Last 20 messages (oldest to newest)
8. **Attestation Footer** — Generation timestamp + HAVEN branding

### 7. Interactive Resource Map
**Framework**: Leaflet + react-leaflet  
**Resources**: 113 real San José / Santa Clara County resources (9 core + 104 extended)

**Categories** (18 total):
- Shelter, Food, Health, Crisis, Legal, Employment, Childcare, Benefits
- Reentry, Veterans, Youth, Utility, Immigration, Domestic Violence
- Mental Health, Substance Use, Transportation, Seniors, Federal Direct

**Core 9 Seeded Resources**:
- Boccardo Reception Center (shelter, 24/7, 250 beds)
- Sacred Heart Community Service (food pantry, M-F)
- Valley Homeless Healthcare (free clinic, M-F)
- Santa Clara County Crisis Line (855) 278-4204 (24/7)
- Bill Wilson Center (youth shelter, 16-25)
- Law Foundation of Silicon Valley (legal aid, M-F)
- work2future Career Center (job training, M-F)
- Family Supportive Housing (families, 24/7)
- Loaves & Fishes Family Kitchen (hot meals, daily)

**Extended Catalog**: Includes homeless shelters, food pantries, clinics, reentry programs, DV services, mental health, substance-use, etc.

### 8. Agency Integrations (12 Agencies)
**Submission Flow**:
1. Caseworker or resident fills form template
2. POST `/api/integrations/submit` with integration_code, case_id, payload
3. Adapter (simulated or live) returns confirmation_id, status, SLA date
4. Submission stored with timeline; mirrored to application_tracking
5. POST `/api/integrations/submissions/{id}/sync` to check current status

**Agency Catalog**:
- `HUD_SEC8` — HUD Section 8 (housing)
- `SSA_SSI` — SSA Supplemental Security Income (benefits)
- `USDA_SNAP` — USDA SNAP / CalFresh (food)
- `CMS_MEDICAID` — CMS Medicaid / Medi-Cal (health)
- `VA_BENEFITS` — VA Veterans Benefits (benefits)
- `IRS_EFILE` — IRS VITA Free Tax Filing (benefits)
- `DMV_ID` — CA DMV REAL ID (identity)
- `DOL_UI` — DOL Unemployment Insurance (employment)
- `HHS_TANF` — HHS TANF / CalWORKs (benefits)
- `CPS_REPORT` — County CPS Child Welfare (family)
- `COURT_EFILE` — Santa Clara Court eFiling (legal)
- `WIC_CA` — CA WIC (health)

**OAuth Adapters**:
- `logingov` — Login.gov OIDC + PKCE (HUD, USDA, IRS, WIC, DOL, DMV, HHS, CMS)
- `va` — VA Lighthouse API + PKCE
- `ssa` — SSA Developer Sandbox
- `oauth2` — Generic RFC 6749 Authorization Code
- `simulated` — Default (deterministic responses, no credentials needed)

**Security**:
- PKCE mandatory for Login.gov & VA
- State tokens expire after 15 minutes
- State is single-use (deleted on success + expiry)
- No client secrets in code (env vars only)
- Revoke via POST `/api/integrations/{code}/oauth/disconnect`

### 9. Workload Heatmap
**Access**: Admin, Architect (caseworkers see read-only)  
**Display**: Every caseworker as a row with load score (0–100)  
**Color Coding**:
- Emerald (0–49) — Available
- Amber (50–74) — Balanced
- Rose (75–100) — Overloaded

**Functionality**:
- Expand any row to see active cases as draggable chips
- Drag to reassign case to different caseworker
- PATCH `/api/cases/{id}` fires on drop; heatmap reloads

### 10. Custom Form Builder
**Access**: /caseworker/forms  
**Capability**: Caseworkers and admins build intake forms

**Field Types**: text | email | phone | number | date | select | checkbox | radio | textarea | file  
**Per-Field Metadata**: label, name, placeholder, required, options, map_to hint  
**Publishing**: Published forms accessible by residents via /forms

### 11. Survival Bible
**Access**: /survival-bible (offline-capable), /book (book format)  
**BB Integration**: BB answers all survival questions with step-by-step guidance

**Content Areas**:
- **Water**: Finding, filtering, boiling, chemical treatment, SODIS
- **Food**: Foraging safety, edible plants (dandelion, chickweed, clover, cattails, acorns)
- **Shelter**: Lean-to, debris hut, A-frame, snow cave, tarp configs
- **Fire**: Bow drill, tinder, feather sticks, lay patterns
- **First Aid**: Bleeding, CPR, burns, hypothermia, fractures, wound care
- **Navigation**: Shadow-stick, Polaris, Southern Cross, declination
- **Weather**: Cloud reading, lightning, hypo/hyperthermia thresholds
- **Tools**: 10 essentials, knife maintenance, cordage
- **Knots** (10): Bowline, square, clove hitch, taut-line, figure-8, sheet bend, trucker's, prusik, double fisherman, alpine butterfly
- **Psychology**: STOP method, survival priorities, pacing

### 12. Camping & Crisis Pages
- **Camping**: /camping — Curated outdoor content + 30 survival drills for practice
- **Crisis**: /crisis — Immediate crisis resource surfacing + Santa Clara County Crisis Line (855) 278-4204

### 13. Offline Mode
**Service Worker**: /sw.js  
**Caching Strategy**:
- App shell (HTML/JS/CSS) → cache-first
- API GET requests → network-first with cache fallback
- Write queue: Form submissions go to IndexedDB, sync on reconnect

**Components**:
- OfflineSyncIndicator shows queue status
- Two named caches: haven-shell-v1, haven-api-v1
- Automatic reconnection on network restore

### 14. Onboarding Curriculum
**Access**: /onboarding  
**Role-Aware**: Modules filtered by resident|caseworker|admin  
**Progression**:
- 80% pass threshold to unlock next module
- Per-user progress in curriculum_progress collection
- Module types: resident welcome, resident documents, resident crisis, caseworker basics, admin systems

---

## BB — AI Civic Concierge

**BB** is HAVEN's built-in AI assistant accessible via floating chat bubble from any page. She adapts tone and capability to user role and context.

### Personality
- Warm, calm, dignity-first
- Never judgmental, bureaucratic, or robotic
- Residents feel relief; caseworkers feel supported

### Role-Aware Modes
| Role | Tone | Focus |
|------|------|-------|
| **Resident** | Plain language, step-by-step, reduce overwhelm | Guidance, forms, resources, emotional support |
| **Caseworker** | Operational, action-oriented | Case workflows, integrations, metrics, checklists |
| **Admin** | Systems-oriented, data-driven | Analytics, anomalies, recommendations |

### Capabilities
1. **Multi-turn Chat** — Remembers session history (up to 12 turns)
2. **Form Analysis** — Paste HTML form; extracts all fields with metadata
3. **Intelligent Autofill** — Maps resident profile + case data to form fields semantically
4. **Application Tracking** — Tracks submissions across agencies with timeline
5. **Crisis Detection** — Auto-detects high-risk keywords; surfaces hotlines + HAVEN actions
6. **BB Browser Control** — Drives headless Playwright browser to navigate real agency websites
7. **Voice Mode** — Mic input + speaker output via Web Speech API (Chrome/Edge; not Firefox)
8. **Survival Bible Expert** — Full knowledge of emergency skills with step-by-step guidance
9. **Emotional Intelligence** — Adapts responses to user emotional state

### Crisis Keywords
| Level | Keywords |
|-------|----------|
| **CRITICAL** | "suicide", "kill myself", "hurt myself", "domestic violence", "being hit", "evicted today/tomorrow", "homeless tonight", "child in danger" |
| **HIGH** | "end it", "abuse", "no food", "kids hungry" |

**Response**: Surface relevant crisis hotline + recommend HAVEN action immediately

### LLM Engine
- **Primary**: Local Ollama (llama3.2:3b default) — FREE, no API credits
- **Fallback**: Claude Sonnet 4.5 via Emergent key (only if Ollama down)
- **Disable Sonnet**: Set `EMERGENT_LLM_KEY=` (blank) to fully disable all credit usage
- **Health Status**: `/api/health` reports which engine active: "ollama_native" or "emergent_llm_fallback"

### API Endpoints
```
POST   /bb/chat                          chat with BB → { reply, intent, session_id, timestamp }
GET    /bb/intro                         role-aware greeting → { reply, role }
GET    /bb/sessions/{session_id}/history full chat history for session
POST   /bb/forms/analyze                 extract fields from HTML → { field_count, fields }
POST   /bb/forms/autofill                map profile + case to form fields → { mapping, missing }
POST   /bb/applications/track            track an application submission
GET    /bb/applications/summary          all tracked applications for current user
GET    /bb/applications/case/{case_id}   applications for specific case
GET    /bb/applications/status/{id}      single tracking record
POST   /bb/browser/start                 start Playwright browser (returns screenshot)
POST   /bb/browser/action                navigate|fill|click|type|submit|screenshot|extract|scroll|back|forward|autofill_all
POST   /bb/browser/stop                  close browser session
GET    /bb/browser/sessions              list active browser sessions
WS     /bb/browser/stream/{session_id}   live screenshot stream (?token=JWT)
```

---

## Agency Integrations

### Adapter Architecture

**Submission Flow**:
1. Form submission → `/api/integrations/submit`
2. Adapter (simulated or live) processes payload
3. Returns: `{ confirmation_id, status, sla_date, timeline }`
4. Stored in `integration_submissions` collection
5. Mirrored to `application_tracking` for user visibility
6. POST `/api/integrations/submissions/{id}/sync` checks current status

### Adapter Families

#### 1. **logingov** (Login.gov OIDC + PKCE)
**Used By**: HUD, USDA, IRS, WIC, DOL, DMV, HHS, CMS  
**Flow**:
- GET `/api/integrations/{code}/oauth/start` → `{ authorize_url, adapter_family }`
- User authorizes at Login.gov sandbox/prod
- Callback → PKCE verifier validation + state single-use enforcement
- Access token stored in `integration_tokens`
- POST `/api/integrations/{code}/oauth/disconnect` revokes

#### 2. **va** (VA Lighthouse API + PKCE)
**Used By**: VA_BENEFITS  
**Flow**: Similar to logingov; VA Lighthouse endpoints

#### 3. **ssa** (SSA Developer Sandbox)
**Used By**: SSA_SSI  
**Flow**: OAuth2 with SSA-specific endpoints

#### 4. **oauth2** (Generic RFC 6749)
**Used By**: Any agency with standard OAuth2  
**Flow**: Authorization code, token exchange, state validation

#### 5. **simulated** (Default)
**Mode**: Deterministic mock responses  
**No Credentials**: Runs without real authentication  
**Progression**: Status advances predictably (new → pending → approved/denied)  
**Use Case**: Testing, demo mode, agency downtime

### Configuration

**Environment Variables** (per-agency):
```bash
OAUTH_ENV=sandbox                          # sandbox | prod
{AGENCY}_OAUTH_CLIENT_ID=your_client_id
{AGENCY}_OAUTH_CLIENT_SECRET=secret        # optional for PKCE
{AGENCY}_OAUTH_AUTHORIZE_URL=url           # override if needed
{AGENCY}_OAUTH_TOKEN_URL=url               # override if needed
{AGENCY}_ADAPTER=logingov|va|ssa|oauth2    # auto-detected if omitted
```

**Example (HUD Section 8)**:
```bash
HUD_SEC8_OAUTH_CLIENT_ID=login.gov-test-id
HUD_SEC8_ADAPTER=logingov
```

### Security Measures
- PKCE mandatory for Login.gov & VA (code_verifier stored server-side)
- State tokens expire after 15 minutes (OAUTH_STATE_TTL_SECONDS=900)
- State is single-use (deleted on success + expiry)
- No client secrets in code (env vars only)
- Audit log tracks all OAuth events (state creation, token exchange, revocation)

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript (Vite build)
- **Styling**: TailwindCSS + shadcn/ui + Radix UI primitives
- **State**: Zustand (authStore, caseStore, bbChatStore, resourceStore)
- **Router**: React Router v7
- **Maps**: Leaflet + react-leaflet
- **Offline**: IndexedDB write queue + service worker
- **Voice**: Web Speech API (Chrome/Edge only)
- **Build**: Vite 7.3+

### Backend
- **Framework**: Python 3.12 + FastAPI + Uvicorn (2 workers production)
- **Database**: MongoDB 7.0 + Motor 3.x (async driver)
- **Validation**: Pydantic v2
- **Auth**: JWT (python-jose) + bcrypt
- **PDF Generation**: ReportLab 5.x
- **Browser Automation**: Playwright (optional, for BB Browser Control)
- **HTTP Client**: httpx (async)

### AI / LLM
- **Primary**: Ollama with llama3.2:3b (local, free)
- **Fallback**: Claude Sonnet 4.5 (via Emergent integration key)

### Infrastructure
- **Containerization**: Docker Compose (5 services)
- **Reverse Proxy**: nginx (HTTP/HTTPS, SSL termination, SPA routing)
- **Task Queue**: BullMQ + Redis (optional, for background jobs)
- **Domain**: homeishaven.cloud (+ legacy redirects)
- **SSL**: Let's Encrypt (certbot)

### Docker Services (docker-compose.yml)
```yaml
nginx      — Reverse proxy (ports 80/443)
frontend   — React/Vite (port 3000)
backend    — FastAPI (port 8000, 2 workers)
mongo      — MongoDB (port 27017, volume: mongo-data)
ollama     — Ollama (port 11434, volume: ollama-models, pulls llama3.2:3b on start)
```

---

## Complete API Reference

### Authentication
```
POST   /auth/register                       create account (role: resident|caseworker|admin)
POST   /auth/login                          returns { token, user }
GET    /auth/me                             current user profile
```

### Users
```
GET    /users                               list users (caseworker/admin, ?role=)
PATCH  /users/me                            update own name/phone
```

### Cases
```
POST   /cases                               create case
GET    /cases                               list (?status= ?category= ?assigned_to_me= ?caseworker_id=)
GET    /cases/{id}                          detail + tasks + messages + documents
PATCH  /cases/{id}                          update (caseworker/admin)
POST   /cases/{id}/claim                    caseworker self-assigns
GET    /cases/{id}/packet.pdf               8-section PDF export
```

### Tasks
```
POST   /tasks                               create task (caseworker/admin)
GET    /tasks                               list (?case_id= ?status=)
PATCH  /tasks/{id}                          update
DELETE /tasks/{id}                          delete
```

### Messages
```
POST   /messages                            send message
GET    /messages?case_id=                   thread for a case
```

### Documents
```
POST   /documents                           upload file (multipart/form-data)
GET    /documents?case_id=                  list documents
PATCH  /documents/{doc_id}/verify           verify document (caseworker/admin)
```

### BB Chat
```
POST   /bb/chat                             chat with BB
GET    /bb/intro                            role-aware greeting
GET    /bb/sessions/{session_id}/history    full chat history
POST   /bb/forms/analyze                    extract fields from HTML
POST   /bb/forms/autofill                   map profile to form fields
POST   /bb/applications/track               track an application
GET    /bb/applications/summary             all tracked applications
GET    /bb/applications/case/{case_id}      applications for specific case
GET    /bb/applications/status/{id}         single tracking record
POST   /bb/browser/start                    start Playwright browser
POST   /bb/browser/action                   navigate|fill|click|type|submit|screenshot|etc
POST   /bb/browser/stop                     close browser session
GET    /bb/browser/sessions                 list active sessions
WS     /bb/browser/stream/{session_id}      live screenshot stream
```

### Form Templates
```
GET    /form-templates                      list all 13 (summary only)
GET    /form-templates/{id}                 full template with fields
POST   /form-templates/{id}/autofill        deterministic autofill
POST   /form-templates/{id}/submit          submit filled form
GET    /form-templates/submissions/mine     all my submissions
GET    /form-templates/submissions/{id}     single submission
GET    /form-templates/submissions/{id}/pdf HAVEN-branded PDF
```

### Agency Integrations
```
GET    /integrations                        full agency catalog
GET    /integrations/{code}                 single agency
PATCH  /integrations/{code}/toggle          connect/disconnect (admin)
POST   /integrations                        create custom integration (admin)
DELETE /integrations/{code}                 delete integration (admin)
POST   /integrations/submit                 submit application to agency
GET    /integrations/submissions            all submissions (?case_id= ?integration_code= ?status=)
GET    /integrations/submissions/{id}       single submission with timeline
POST   /integrations/submissions/{id}/sync  check status from agency
GET    /integrations/{code}/oauth/meta      mode + adapter_family + authorized status
GET    /integrations/{code}/oauth/start     begin OAuth flow (admin) → { authorize_url, adapter_family }
GET    /integrations/oauth/callback         OAuth redirect handler (PKCE + state expiry enforced)
POST   /integrations/{code}/oauth/disconnect revoke tokens (admin)
GET    /integrations/_/stats                submission counts by category
```

### Resources
```
GET    /resources                           all map resources (113 total)
```

### Notifications
```
GET    /notifications                       in-app notifications for current user
```

### Custom Forms
```
POST   /forms                               create custom form
GET    /forms                               list published forms
GET    /forms/{id}                          form detail
POST   /forms/{id}/submit                   submit to custom form
```

### Analytics
```
GET    /analytics/admin                     system analytics (admin/architect)
GET    /analytics/workload-heatmap          caseworker load matrix
```

### Curriculum
```
GET    /curriculum/modules                  role-aware module list
GET    /curriculum/modules/{id}             module detail
POST   /curriculum/submit-quiz              quiz submission (80% pass threshold)
GET    /curriculum/progress                 current user's progress
```

### Health & System
```
GET    /health                              full health: API + DB + BB engine status
GET    /health/live                         liveness probe → { alive: true }
GET    /health/ready                        readiness probe (DB ping) → { ready, db }
```

---

## Data Model

### MongoDB Collections

**users**
```
id, email, name, role, phone, password_hash, avatar_url, created_at
```

**cases**
```
id, title, description, resident_id, resident_name, caseworker_id, caseworker_name,
status, urgency_score, category, intake_data, created_at, updated_at
```

**tasks**
```
id, case_id, caseworker_id, title, description, priority, status, due_date, created_at
```

**messages**
```
id, case_id, sender_id, sender_name, sender_role, recipient_id, content, read, created_at
```

**documents**
```
id, case_id, uploaded_by, type, filename, content_type, size, data_url (base64),
verified, verified_by, notes, created_at
```

**form_submissions**
```
id, template_id, template_name, agency, category, integration_code, case_id,
submitted_by, applicant_name, applicant_email, data, submitted_at
```

**resources**
```
id, name, type, lat, lng, address, phone, hours, capacity, capacity_available,
description, eligibility
```

**integrations**
```
id, code, name, agency, category, auth_type, required_fields, sla_days,
connected, submissions_count, avg_response_ms, uptime
```

**integration_tokens**
```
integration_code, access_token, refresh_token, id_token, adapter_family,
authorized_at, raw
```

**oauth_states**
```
state, integration_code, user_id, pkce_verifier, nonce, expires_at (15-min TTL, single-use)
```

**integration_submissions**
```
id, integration_code, case_id, resident_id, confirmation_id, status,
timeline[], payload, adapter_mode, submitted_at
```

**application_tracking**
```
id, case_id, user_id, agency_name, integration_code, application_id, status,
last_checked, notes
```

**bb_sessions**
```
session_id, user_id, messages[], last_message_at, created_at
```

**notifications**
```
id, user_id, message, type, read, created_at
```

**forms**
```
id, name, description, fields[], category, created_by, published, created_at
```

**curriculum_progress**
```
id, user_id, module_id, completed, best_score, attempts, updated_at
```

**audit_log**
```
id, actor_id, actor_name, actor_role, action, target, meta, created_at
```

---

## Environment Variables

### Core Backend
```bash
MONGODB_URI=mongodb://mongo:27017
DATABASE_NAME=haven
JWT_SECRET=<generate: openssl rand -hex 32>
CORS_ORIGINS=https://homeishaven.cloud,https://www.homeishaven.cloud
ENVIRONMENT=production
```

### BB / LLM Engine
```bash
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT=90
EMERGENT_LLM_KEY=                        # leave blank to disable Claude; otherwise set to API key
```

### OAuth / Agency Integrations
```bash
OAUTH_ENV=sandbox                         # sandbox | prod
OAUTH_REDIRECT_URI=https://homeishaven.cloud/api/integrations/oauth/callback
OAUTH_STATE_TTL_SECONDS=900               # 15 min
```

### Per-Agency OAuth (Example: HUD Section 8)
```bash
HUD_SEC8_OAUTH_CLIENT_ID=your_login_gov_client_id
HUD_SEC8_OAUTH_CLIENT_SECRET=optional_for_pkce
HUD_SEC8_OAUTH_AUTHORIZE_URL=override_url
HUD_SEC8_OAUTH_TOKEN_URL=override_url
HUD_SEC8_ADAPTER=logingov                 # auto-detected if omitted
```

### Frontend (Vite)
```bash
VITE_API_URL=https://homeishaven.cloud
```

---

## Deployment & Infrastructure

### Docker Compose Services
**File**: `docker-compose.yml`

**Services**:
1. **nginx** (nginx:1.27-alpine)
   - Ports: 80/443
   - Volumes: nginx.conf (read-only), certs (Let's Encrypt)
   - Healthcheck: wget localhost/health
   - Role: HTTP/HTTPS termination, SPA routing, API proxy

2. **frontend** (custom build from Dockerfile.frontend)
   - Port: 3000 (exposed)
   - Dockerfile: Multi-stage React/Vite build
   - Role: Static SPA serving via nginx

3. **backend** (custom build from ./backend/Dockerfile)
   - Port: 8000 (exposed)
   - Environment: MongoDB, Ollama, JWT, CORS, OAuth
   - Healthcheck: curl localhost:8000/api/health/live
   - Role: FastAPI application server

4. **mongo** (mongo:7.0)
   - Port: 27017 (exposed)
   - Volume: mongo-data
   - Healthcheck: mongosh --eval "db.adminCommand('ping')"
   - Command: mongod --wiredTigerCacheSizeGB 1

5. **ollama** (ollama/ollama:latest)
   - Port: 11434 (exposed)
   - Volume: ollama-models
   - Entrypoint: Serves Ollama + auto-pulls llama3.2:3b (~2GB, 2–3 min on first start)
   - Environment: OLLAMA_NUM_GPU=0 (set to 1 if host has GPU)

### Domain Routing
```
homeishaven.cloud          → main site (HTTPS)
www.homeishaven.cloud      → main site (HTTPS)
home-is-haven-com          → 301 → homeishaven.cloud
www.home-is-haven-com      → 301 → homeishaven.cloud
```

### Commands
```bash
# Start all services
docker compose up -d --pull always

# View logs
docker compose logs -f backend

# Rebuild images
docker compose build --no-cache

# Seed database
docker compose exec backend python seed.py

# Stop services
docker compose down
```

### Network
- **Driver**: bridge
- **Name**: haven-net
- **Services**: nginx, frontend, backend, mongo, ollama

---

## Demo Accounts & Seeded Data

### Demo Credentials
| Role | Email | Name | Password |
|------|-------|------|----------|
| Resident | resident@haven.demo | Maria Hernandez | Demo2026! |
| Resident | james@haven.demo | James Brown | Demo2026! |
| Resident | sarah@haven.demo | Sarah Kim | Demo2026! |
| Caseworker | caseworker@haven.demo | Alex Rivera | Demo2026! |
| Admin | admin@haven.demo | Jordan Lee | Demo2026! |
| Architect | jawknee.rodriquez@gmail.com | — | Architect2026! |

### Seeded Data on Startup
- **Users**: 6 (1 caseworker, 3 residents, 1 admin, 1 architect)
- **Resources**: 113 (9 core + 104 extended from seed_resources_extra.py)
- **Cases**: 6 demo cases (see below)
- **Tasks**: 12 (2 per case: confirm contact, verify documents)
- **Messages**: 12 (2 per case)
- **Forms**: 13 agency templates + 1 HAVEN universal intake
- **Integrations**: 12 agencies (via ensure_default_integrations())

### Demo Cases
| # | Title | Urgency | Category | Status |
|---|-------|---------|----------|--------|
| 1 | Family of 4 — eviction notice in 5 days | 92 | housing | active |
| 2 | Food insecurity — diabetic senior | 74 | food | active |
| 3 | Mental health crisis follow-up | 85 | health | enriched |
| 4 | Unemployment + childcare coordination | 58 | employment | new |
| 5 | Domestic violence — safety plan needed | 96 | crisis | active |
| 6 | Veteran — VA benefits not processing | 62 | benefits | active |

---

## Known Limitations

1. **BB Browser Control**: Requires Playwright + chromium (not in base Docker image)
   - Install: `pip install playwright && python -m playwright install chromium`

2. **Voice Chat**: Firefox lacks Web Speech API — mic/speaker buttons hidden automatically

3. **PDF Export**: Requires `reportlab==5.0.0` in requirements.txt

4. **OAuth Token Rotation**: Refresh token rotation for Login.gov/VA not yet implemented

5. **Internationalization**: LanguageSwitcher component present but not fully activated

6. **Health Status**: `/api/health` returns "degraded" when on Emergent LLM fallback (known quirk, not regression)

7. **Signed URLs**: PDF downloads not yet signed — currently JWT + ownership check only

8. **Document Storage**: Demo mode stores base64 in MongoDB; production should use S3 with signed URLs

---

## Quick Reference: All Routes

### Public Routes
- `/` — Landing intro animation
- `/home` — Landing page
- `/login` — Login (role demo chips)
- `/book` — Survival Bible book format
- `/demo` — BB demo page

### Resident Routes
- `/resident` — Dashboard
- `/resident/tasks` — Task list
- `/resident/documents` — Document upload
- `/resident/applications` — Applications + templates
- `/resident/messages` — Caseworker messaging
- `/survival-bible` — Full Survival Bible
- `/camping` — Camping drills
- `/crisis` — Crisis resources
- `/resources` — Resource map

### Caseworker Routes
- `/caseworker` — Dashboard + case queue
- `/caseworker/cases/:id` — Case detail
- `/caseworker/forms` — Custom form builder
- `/caseworker/bb-browser` — BB Browser Control
- `/caseworker/integrations` — Agency submission panel
- `/caseworker/workload` — Full workload heatmap

### Admin Routes
- `/admin` — Analytics dashboard
- `/admin/users` — User management
- `/admin/integrations` — OAuth setup
- `/admin/audit` — Audit log

### Architect Routes
- `/architect` — Superuser dashboard

### Shared (All Authenticated Roles)
- `/forms/templates` — 13 agency forms
- `/onboarding` — Curriculum modules
- `/dashboard` — Role-adaptive home
- `/chat` — BB full-page interface
- `/profile` — User profile
- `/settings` — App settings

---

**End of Unified Documentation Corpus v3.0**
