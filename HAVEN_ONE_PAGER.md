# HAVEN Platform — One-Pager
**Enterprise-Grade Civic Technology for Housing Security**  
Domain: homeishaven.cloud | Created by: Johnathan R. Rodriquez

---

## What is HAVEN?

HAVEN is a dignity-first civic technology platform that connects housing-insecure and underserved residents with government benefits, housing assistance, and community resources. It replaces fragmented agency interactions with a single, unified dashboard — helping residents apply, track, and succeed while giving caseworkers and agencies real-time visibility and automation.

**Tagline**: "Help has a home."

---

## The Problem

- **Residents**: Juggle multiple agency websites, forms, deadlines, and caseworkers—no single source of truth
- **Caseworkers**: Manually fill forms, track applications, manage cases across disparate systems
- **Agencies**: Receive incomplete intakes, struggle with inter-agency coordination, can't track outcomes
- **System Gaps**: Critical moments (evictions, homelessness, family separation) go unsupported

---

## The Solution

### For Residents
- **One Dashboard**: All cases, applications, documents, and messaging in one place
- **AI-Powered Guidance**: BB — an AI civic concierge — helps fill forms, answers questions, detects crisis, provides hotlines
- **Offline-Ready**: Works without internet; syncs when reconnected
- **13 Pre-Built Forms**: CalFresh, HUD Section 8, Medi-Cal, SSI, WIC, EDD, TANF, VA Benefits, IRS VITA, DMV REAL ID, Court eFiling, CPS Referral, Eviction Defense
- **Survival Resources**: Emergency knowledge base (water, shelter, fire, first aid, navigation, psychology)
- **Crisis Support**: Immediate access to 24/7 crisis lines + local resources (113 mapped)

### For Caseworkers
- **Case Queue**: All assigned cases, sorted by urgency (0–100 score)
- **Task & Message Management**: Track interventions and communicate securely per-case
- **BB Autofill**: One-click deterministic form autofill (zero LLM cost)
- **BB Browser Control**: Automate real agency websites via AI-driven browser automation
- **Application Tracking**: Submit to agencies, track status with timeline
- **Workload Heatmap**: Drag-drop case reassignment; see team capacity in real time
- **Custom Forms**: Build intake forms for your agency's needs

### For Admins & Agencies
- **OAuth Integrations**: Connect to 12 major government agencies (HUD, SSA, USDA, CMS, VA, IRS, DOL, DMV, HHS, WIC, CPS, Court eFiling)
- **Audit Log**: Full accountability for every action
- **System Analytics**: Case volumes, agency submissions, caseworker workload, SLA tracking
- **User Management**: Role-based access (resident, caseworker, admin, architect)
- **PDF Export**: One-click case packets for court, appeals, inter-agency handoffs

---

## Key Differentiators

| Feature | HAVEN | Status |
|---------|-------|--------|
| **AI Civic Concierge** | BB with crisis detection + voice chat | ✅ Live |
| **Browser Automation** | BB Browser Control (Playwright-powered) | ✅ Live |
| **Offline-First** | Works without internet | ✅ Live |
| **Zero LLM Costs** | Local Ollama (free) + optional Claude fallback | ✅ Live |
| **Multi-Agency** | 12 agency integrations with OAuth (Login.gov, VA, SSA) | ✅ Live |
| **Case Packet PDF Export** | 8-section branded PDF for court/appeals | ✅ Live |
| **Workload Heatmap** | Real-time caseworker capacity visualization | ✅ Live |
| **Survival Bible** | Offline emergency knowledge base | ✅ Live |
| **Crisis Page** | Immediate crisis resource + hotline surfacing | ✅ Live |
| **Custom Forms** | Caseworkers build their own intake forms | ✅ Live |
| **End-to-End Encryption** | Vault architecture for sensitive documents | ✅ Live |

---

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript, TailwindCSS, Zustand, Leaflet maps
- **Backend**: Python 3.12 + FastAPI + MongoDB + Motor async
- **AI**: Ollama (llama3.2:3b local) + Claude Sonnet 4.5 (optional fallback)
- **Infrastructure**: Docker Compose (nginx, frontend, backend, MongoDB, Ollama)
- **Domain**: homeishaven.cloud (HTTPS, Let's Encrypt SSL)

### 5-Service Deployment
1. **nginx** — Reverse proxy, SSL termination, SPA routing
2. **frontend** — React/Vite (port 3000)
3. **backend** — FastAPI + Uvicorn (port 8000)
4. **mongo** — MongoDB 7.0 (port 27017)
5. **ollama** — LLM service (port 11434, ~2GB models)

**Startup**: `docker compose up -d --pull always`

---

## Core Workflows

### Resident Journey
1. **Register** → Create account (role: resident)
2. **Create Case** → New case with title, description, category, intake data
3. **Upload Documents** → ID, income, residency, medical
4. **Fill Form** → Select 1 of 13 agency forms; BB autofills; submit
5. **Track Application** → See submission status, SLA date, agency contact
6. **Message Caseworker** → Per-case secure chat
7. **Export Case Packet** → One-click PDF for court/appeals
8. **Access Resources** → Map of 113 local agencies + crisis hotlines

### Caseworker Workflow
1. **View Case Queue** → All cases, sorted by urgency
2. **Claim Case** → Self-assign unassigned cases
3. **Create Tasks** → "Confirm contact", "Verify documents" with due dates
4. **Message Resident** → Per-case communication
5. **Use BB Autofill** → Auto-populate form fields (deterministic)
6. **Submit to Agency** → POST to integrations; get confirmation_id
7. **Track Status** → Sync submissions; monitor SLA
8. **Reassign Cases** → Via workload heatmap (admin only)
9. **Export Case PDF** → Handoff to other agencies

### Admin Setup
1. **Create Users** → Residents, caseworkers, admins
2. **Connect Agencies** → OAuth setup for Login.gov, VA, SSA
3. **Monitor Health** → Check API + DB + LLM engine status
4. **View Audit Log** → Full action history
5. **Build Custom Forms** → Agency-specific intake templates

---

## Competitive Advantages

### 1. **Dignity-First UX**
- Warm, non-bureaucratic language
- Guides residents through overwhelming processes
- Emotional intelligence: adapts tone to user state

### 2. **Zero Infrastructure Barrier**
- Works offline (IndexedDB + service worker)
- Runs on commodity Docker (any VPS, Render, Railway, Heroku)
- No complex Kubernetes setup needed

### 3. **AI at No Cost**
- Local Ollama (free, no API credits)
- Optional Claude fallback (Emergent key)
- Forms auto-filled deterministically—no per-form LLM cost

### 4. **Interoperability by Default**
- 12 government agencies via OAuth (Login.gov, VA, SSA)
- Simulated mode for testing (deterministic, no credentials)
- Live mode when credentials present

### 5. **Caseworker Automation**
- BB Browser Control (Playwright) automates real agency sites
- 1-click form autofill (profile + case data → form fields)
- Crisis detection (flags high-risk keywords, surfaces hotlines)

### 6. **Transparent Workflows**
- Application tracking with timeline (submitted → pending → approved/denied)
- Workload heatmap shows caseworker capacity in real time
- Audit log tracks every action

---

## Data Security & Privacy

- **Encryption Vault**: End-to-end encryption for sensitive documents
- **JWT Auth**: Stateless session tokens with configurable TTL
- **PKCE OAuth**: Mandatory for Login.gov & VA integrations
- **Role-Based Access**: Resident sees only their cases; caseworkers see assigned cases
- **Audit Log**: Every action (create, update, delete, submit) logged with actor, timestamp, metadata
- **No Secrets in Code**: All credentials via environment variables

---

## User Roles

| Role | Access | Key Actions |
|------|--------|-------------|
| **Resident** | Own cases, documents, messages | Create case, upload docs, fill forms, message caseworker |
| **Caseworker** | All assigned cases, custom forms | Claim cases, create tasks, submit to agencies, use BB autofill |
| **Admin** | System-wide; all cases | User management, OAuth setup, audit log, analytics |
| **Architect** | Superuser | Full database + system configuration access |

---

## Demo Accounts
```
Resident:    resident@haven.demo / Demo2026!
Caseworker:  caseworker@haven.demo / Demo2026!
Admin:       admin@haven.demo / Demo2026!
Architect:   jawknee.rodriquez@gmail.com / Architect2026!
```

**Demo Cases**: 6 seeded (eviction, food insecurity, mental health, unemployment, DV, veteran)

---

## Integration Agencies (12 Total)

| Code | Agency | Category | SLA |
|------|--------|----------|-----|
| USDA_SNAP | USDA SNAP / CalFresh | Food | 30 days |
| HUD_SEC8 | HUD Section 8 Housing | Housing | 30 days |
| CMS_MEDICAID | CMS Medi-Cal | Health | 45 days |
| VA_BENEFITS | VA Disability Benefits | Benefits | 125 days |
| SSA_SSI | SSA Supplemental Security Income | Benefits | 90 days |
| IRS_EFILE | IRS VITA Free Tax Filing | Benefits | 21 days |
| DMV_ID | CA DMV REAL ID | Identity | 14 days |
| DOL_UI | DOL Unemployment Insurance (EDD) | Employment | 21 days |
| HHS_TANF | HHS TANF / CalWORKs | Benefits | 45 days |
| WIC_CA | CA WIC | Health | 10 days |
| CPS_REPORT | County CPS Child Welfare | Family | 1 day |
| COURT_EFILE | Santa Clara Court eFiling | Legal | 3 days |

---

## Business Model & Revenue

### Pricing Model
- **B2G (Government/Nonprofits)**: SaaS subscription per county/agency
  - *Starter*: $5K–10K/month (10–50 caseworkers, 5 agencies)
  - *Professional*: $15K–25K/month (50–200 caseworkers, 12 agencies)
  - *Enterprise*: Custom (multi-county, custom integrations, SLA)

- **B2C (Residents)**: Free (funded by government contracts)

### Revenue Drivers
1. Per-agency integration SLAs (faster submissions = higher adoption)
2. Multi-county deployments (Santa Clara County → Bay Area → California → National)
3. Premium analytics & reporting add-ons
4. Custom agency integrations (beyond the 12 pre-built)
5. Managed hosting & support

---

## Roadmap (Next 12 Months)

### Q1 2025
- ✅ Unified documentation corpus
- ✅ Executive portfolio + investor materials
- Signed URL PDF downloads
- Refresh token rotation (Login.gov, VA)

### Q2 2025
- Mobile app (React Native)
- SMS notifications + voice hotline
- Multi-language support (Spanish, Mandarin, Vietnamese)

### Q3 2025
- Advanced analytics dashboard
- Predictive SLA alerts
- AI-powered case recommendations (next best action)

### Q4 2025
- Multi-county federation (sync cases across counties)
- Blockchain document attestation (optional)
- Advanced compliance reporting (HIPAA, civil rights)

---

## Go-to-Market Strategy

### Phase 1: Regional (Bay Area — 2025)
- **Target**: Santa Clara County government, social services agencies
- **Pilot**: 3–5 agencies, 100–300 caseworkers, 5,000–10,000 residents
- **KPIs**: Adoption rate, application completion rate, caseworker efficiency gains

### Phase 2: Statewide (California — 2025–2026)
- **Expansion**: Regional rollout across California counties
- **Partnerships**: CDS (California Department of Social Services), philanthropic funding

### Phase 3: National (USA — 2026–2027)
- **Replicable Model**: Multi-state deployment, standardized agency adapters
- **Channels**: Government software vendors, nonprofit networks, HHS partnerships

---

## Success Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| **Application Completion Rate** | 80%+ (vs. 40% industry avg) | 2x more residents get benefits |
| **Caseworker Productivity** | 40% efficiency gain | Same team handles 2x cases |
| **Time-to-Benefit** | 50% faster (avg 15→7 days) | Immediate relief for residents |
| **User Adoption** | 70%+ of residents + caseworkers | Network effects, viral referrals |
| **Agency Integration** | 12+ agencies connected | Multi-agency coordination |
| **Satisfaction Score** | 4.5+/5.0 (NPS 50+) | Market-leading UX |

---

## Team & Founder

**Founder/Lead**: Johnathan R. Rodriquez
- Full-stack architect (React, Python, FastAPI)
- Civic tech focus; deep government systems knowledge
- Open-source contributor; community advocate

---

## Contact & Getting Started

**Website**: homeishaven.cloud  
**GitHub**: github.com/jawknee5/Haven  
**Email**: jawknee.rodriquez@gmail.com

**Quick Start**:
```bash
git clone github.com/jawknee5/Haven
cd Haven
docker compose up -d --pull always
# Open http://localhost:80
# Demo account: caseworker@haven.demo / Demo2026!
```

---

**HAVEN Platform — Help has a home.**
