# HAVEN Platform — Overview
**Universal Civic Navigation Platform**  
**Creator**: Johnathan R. Rodriquez  
**Domain**: homeishaven.cloud  
**Version**: 4.1.0 | **Year**: 2025

---

## Mission

Make every interaction between a person and their government simple, dignified, and successful.

**Tagline**: "Help has a home."  
**Acronym**: Helping Agencies, Volunteers, and Everyone Navigate.

---

## What HAVEN Is

HAVEN is a **universal civic navigation platform built for everyone** — any person, any income bracket, any situation — who needs to interact with government at any level, for any reason.

HAVEN does not exist solely to serve underserved or housing-insecure populations. It was built to help **all people** navigate the full complexity of government systems smoothly, whether they are:
- A new resident relocating to a city
- A veteran accessing benefits they earned
- A family navigating a domestic violence situation
- A working professional renewing a driver's license or filing taxes
- Someone dealing with the justice system
- Anyone interacting with any government agency for any reason

HAVEN is **not** a government website. It is a private platform that sits between people and government, translating bureaucracy into clarity through BB — a digital multi-language AI Caseworker that guides or automates every interaction seamlessly.

---

## Government Domains Covered

HAVEN covers the full scope of what government touches in daily life:

| Domain | Coverage |
|--------|----------|
| **Justice System** | Court filings, eviction defense, legal aid, public defender coordination, reentry programs |
| **Transportation** | DMV (renewals, new registration, title transfers, REAL ID), public transit info, paratransit, rideshare access |
| **Benefits & Aid** | SNAP/CalFresh, SSI, TANF/CalWORKs, WIC, General Assistance, SparkPoint financial coaching |
| **Employment** | Unemployment insurance (EDD), WIOA workforce training, job placement, reentry employment |
| **Housing — Emergency** | Coordinated Entry, emergency shelter navigation, crisis bed availability |
| **Housing — Interim** | Transitional housing, rapid rehousing, Homekey programs |
| **Housing — Long-Term** | Section 8 Housing Choice Voucher, HUD-VASH, affordable housing applications |
| **Healthcare** | Medi-Cal, Medicare, Covered California, free clinics, mental health, substance use treatment |
| **IRS & Tax** | VITA free filing, EITC, CTC, amended returns, tax debt navigation |
| **Veterans Services** | VA disability compensation, pension, healthcare, HUD-VASH housing |
| **Domestic Violence** | Safety planning, DV shelter routing, restraining orders, survivor services |
| **Immigration** | Legal services, DACA navigation, naturalization, immigration court |
| **Senior Services** | IHSS, Meals on Wheels, Sourcewise, senior legal aid, Medicare Part D |
| **Youth Services** | Boys & Girls Clubs, youth drop-in, LGBTQ youth services, foster care navigation |
| **Childcare** | 4Cs, First 5, Head Start, childcare subsidy applications |
| **Utilities** | LIHEAP energy assistance, PG&E CARE/FERA, water utility programs |
| **Mental Health** | County behavioral health, crisis stabilization, Momentum for Health |
| **Substance Use** | Sobering centers, recovery programs, SAMHSA Helpline routing |
| **Federal Direct** | IRS, SSA, HUD, DOL, VA, USDA — all 12 OAuth-integrated agencies |

---

## BB — The AI Caseworker

BB is the operational heart of HAVEN. Every domain above is navigated through BB:

- **Multi-language** — meets users in their language
- **Role-aware** — responds differently to residents, caseworkers, admins
- **Crisis-aware** — detects distress signals and routes to the right resource immediately
- **Form automation** — fills, submits, and tracks government forms without the user understanding the bureaucracy
- **Browser Control** — can operate real government websites on behalf of the user
- **Voice-capable** — mic input + speaker output (Chrome/Edge); accessible text fallback on all other browsers
- **Offline-capable** — available even without internet via service worker cache

---

## Data Processing

HAVEN processes highly sensitive PII on behalf of all users:

| Data Type | Protection |
|-----------|------------|
| Social Security Numbers (SSN) | AES-256-GCM vault encryption (Apex Vault) |
| Dates of Birth (DOB) | AES-256-GCM vault encryption |
| Tax forms & income brackets | AES-256-GCM vault encryption |
| Medical routing data | AES-256-GCM vault encryption |
| Government ID numbers | AES-256-GCM vault encryption |
| Bank account information | AES-256-GCM vault encryption |
| Legal case references | AES-256-GCM vault encryption |
| OAuth tokens (agency access) | AES-256-GCM vault encryption |

All sensitive fields encrypted at the field level before MongoDB persistence. No plaintext PII ever touches disk. See `07_Apex_Vault_Specs.md` for full cryptographic specification.

---

## Platform Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     HAVEN Platform                        │
├──────────────┬───────────────────┬───────────────────────┤
│   Residents  │    Caseworkers    │    Admins / Agencies   │
│  (React SPA) │   (React SPA)     │    (React SPA)         │
├──────────────┴───────────────────┴───────────────────────┤
│              nginx (TLS 1.3, rate limiting, SPA routing)  │
├──────────────────────────────────────────────────────────┤
│          FastAPI Backend (Python 3.12, async, Pydantic)   │
│  ┌──────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │  Apex Vault  │  │ BB Brain │  │  Agency Bridge       │ │
│  │ AES-256-GCM  │  │  Ollama  │  │  12 OAuth Adapters   │ │
│  │ scrypt KEK   │  │llama3.2:3│  │  Login.gov/VA/SSA    │ │
│  └──────────────┘  └──────────┘  └─────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│            MongoDB 7.0  (35 indexes, TTL enforcement)     │
└──────────────────────────────────────────────────────────┘
```

---

## User Roles

| Role | Who | Key Access |
|------|-----|------------|
| **Resident / User** | Any person navigating government | Cases, forms, documents, BB, resources, applications |
| **Caseworker** | Social worker, agency staff, volunteer | Case queue, BB autofill, agency submissions, workload tools |
| **Admin** | Agency administrator | User management, OAuth setup, audit log, analytics |
| **Architect** | Platform owner (Johnathan R. Rodriquez) | Full system + vault + engine access |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite 7.3, TailwindCSS, shadcn/ui, Zustand, Leaflet |
| Backend | Python 3.12, FastAPI, Uvicorn (2 workers) |
| Database | MongoDB 7.0 + Motor 3.x (async) |
| AI / LLM | Ollama (llama3.2:3b local, free) + Claude Sonnet 4.5 (optional fallback) |
| Security | Apex Vault (AES-256-GCM), JWT HS256, bcrypt, PKCE OAuth |
| Infrastructure | Docker Compose (5 services), nginx 1.27-alpine, Let's Encrypt SSL |
| PDF Generation | ReportLab 5.x |
| Browser Automation | Playwright (BB Browser Control) |

---

## Resource Coverage

**113 real resources** mapped across San José / Santa Clara County — spanning 18 categories:
shelter, food, health, crisis, legal, employment, childcare, benefits, reentry, veterans, youth, utility, immigration, domestic violence, mental health, substance use, transportation, seniors.

Resource catalog is designed to scale to any metro area nationally.

---

## Demo Access

| Role | Email | Password |
|------|-------|----------|
| Resident | resident@haven.demo | Demo2026! |
| Caseworker | caseworker@haven.demo | Demo2026! |
| Admin | admin@haven.demo | Demo2026! |
| Architect | jawknee.rodriquez@gmail.com | Architect2026! |

**Live URL**: https://homeishaven.cloud

---

## Contact

**Founder**: Johnathan R. Rodriquez  
**Email**: jawknee.rodriquez@gmail.com  
**Website**: homeishaven.cloud  
**GitHub**: github.com/jawknee5/Haven

---

*HAVEN Platform — "Help has a home." | Confidential*

---

## What HAVEN Is

HAVEN is a universal civic navigation platform that simplifies every interaction between people and government. It replaces fragmented, bureaucratic interactions with a single unified platform — giving any user clarity and action, caseworkers automation, and agencies real-time visibility.

HAVEN is **not** a government website. It is a private platform that bridges residents with government and nonprofit agencies through a clean, dignified user experience. Every interaction is designed so residents feel relief, not bureaucracy.

---

## The Problem We Solve

| Pain Point | Current Reality |
|-----------|----------------|
| Residents bounce between 8–12 agency websites | 60% of applications are never completed |
| Caseworkers spend 70% of time on data entry | 1 case per day maximum throughput |
| Agencies can't coordinate across programs | Residents fall through cracks between agencies |
| Crisis moments go undetected | Evictions, homelessness, family separation avoidable |
| $17B+ in benefits go unclaimed annually | Residents who qualify simply can't navigate the system |

---

## The Solution

| Capability | Description |
|-----------|-------------|
| **Unified Resident Dashboard** | All cases, applications, documents, messages in one place |
| **BB — AI Civic Concierge** | Warm, non-judgmental AI; form autofill; crisis detection; voice chat |
| **Caseworker Automation** | 1-click agency submission; BB Browser Control; workload heatmap |
| **12 Agency Integrations** | HUD, SSA, USDA, CMS, VA, IRS, DOL, DMV, HHS, WIC, CPS, Court |
| **Offline-First** | Works without internet; IndexedDB queue syncs on reconnect |
| **Zero LLM Cost** | Local Ollama (free) primary; Claude Sonnet fallback (optional) |
| **Survival Bible** | Offline emergency knowledge base for crisis situations |
| **Apex Vault Security** | AES-256-GCM field-level encryption; SOC 2 / FedRAMP aligned |

---

## Impact at Scale

| Metric | Before HAVEN | With HAVEN | Improvement |
|--------|-------------|------------|-------------|
| Application Completion Rate | 40% | 80%+ | **+100%** |
| Time-to-Benefit | 15–30 days | 7–14 days | **50% faster** |
| Caseworker Productivity | 1 case/day | 1.4 cases/day | **40% gain** |
| Unclaimed Benefits per Resident | $8,000–12,000/yr | $2,000–3,000/yr | **75% reduction** |
| Crisis Response Time | 48–72 hours | <4 hours | **10x faster** |

---

## User Roles

| Role | Who | Key Capabilities |
|------|-----|-----------------|
| **Resident** | Housing-insecure individual | Create case, upload docs, fill forms, message caseworker, offline access |
| **Caseworker** | Social worker / volunteer | Case queue, BB autofill, agency submission, workload heatmap, browser automation |
| **Admin** | Agency administrator | User management, OAuth setup, audit log, analytics |
| **Architect** | Platform owner (Johnathan R. Rodriquez) | Full system access, vault status, engine health |

---

## Platform Architecture

```
┌─────────────────────────────────────────────────────┐
│                    HAVEN Platform                    │
├──────────────┬──────────────────┬───────────────────┤
│   Residents  │   Caseworkers    │   Admins/Agencies  │
│  (React SPA) │  (React SPA)     │   (React SPA)      │
├──────────────┴──────────────────┴───────────────────┤
│              nginx (TLS 1.3, rate limiting)          │
├─────────────────────────────────────────────────────┤
│         FastAPI Backend (Python 3.12, async)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Apex     │ │ BB Brain │ │ Agency Bridge         │ │
│  │ Vault    │ │ (Ollama) │ │ (12 OAuth Adapters)   │ │
│  │AES-256-  │ │ llama3.2 │ │ Login.gov/VA/SSA/etc  │ │
│  │GCM       │ │ :3b      │ │                       │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────┤
│              MongoDB 7.0  (TTL indexes)              │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript, Vite, TailwindCSS, Zustand, Leaflet |
| Backend | Python 3.12, FastAPI, Uvicorn (2 workers) |
| Database | MongoDB 7.0 + Motor 3.x (async) |
| AI / LLM | Ollama (llama3.2:3b local, free) + Claude Sonnet 4.5 (fallback) |
| Security | Apex Vault (AES-256-GCM), JWT (HS256), bcrypt, PKCE OAuth |
| Infrastructure | Docker Compose (5 services), nginx, Let's Encrypt SSL |
| PDF Generation | ReportLab 5.x |
| Browser Automation | Playwright (BB Browser Control) |

---

## Demo Accounts

| Role | Email | Password |
|------|-------|---------|
| Resident | resident@haven.demo | Demo2026! |
| Caseworker | caseworker@haven.demo | Demo2026! |
| Admin | admin@haven.demo | Demo2026! |
| Architect | jawknee.rodriquez@gmail.com | Architect2026! |

**Live URL**: https://homeishaven.cloud

---

## Contact

**Founder**: Johnathan R. Rodriquez  
**Email**: jawknee.rodriquez@gmail.com  
**Website**: homeishaven.cloud  
**GitHub**: github.com/jawknee5/Haven

---

*HAVEN Platform — "Help has a home." | Confidential*
