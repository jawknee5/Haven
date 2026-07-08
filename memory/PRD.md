# HAVEN — Product Requirements Document

> **Tagline:** Help has a home.
> **Acronym:** Helping Agencies, Volunteers, and Everyone Navigate.

## 1. Original problem statement

> Johnson and I made an enterprise grade civic platform that unifies housing,
> food, health, benefits, and crisis support into one calm, dignified place —
> for residents, caseworkers, agencies, and volunteers alike. It's called
> Haven and it's on my GitHub. We're going to need to clone into it and
> deploy it, even though it won't be fully usable until I can get counties,
> agencies, or civic entities to integrate within the platform to create the
> smooth unified workflow it's been created to do — ultimately reducing
> caseworker friction by 80% and saving $20M annually in administrative fees
> by year 3. GitHub.com/jawknee5/haven (`Web` branch).

## 2. Mission & North-Star metrics

- **Mission:** Unify housing, food, health, benefits, and crisis support into
  one calm, dignified place for residents, caseworkers, agencies, and
  volunteers.
- **Reduce caseworker friction by 80%.**
- **Save $20M/year in administrative fees by Year 3.**

## 3. Architecture

- **Frontend:** React 19 + CRA/CRACO, TailwindCSS, shadcn/ui (Radix), light
  React-context store, lucide-react icons, react-leaflet for the resource
  map. Dark "Swiss-Brutalist / Tactical-Minimalist" theme (see
  `design_guidelines.json`).
- **Backend:** FastAPI (Python 3.11) under `/api`, Motor (async MongoDB),
  JWT auth (HS256), Playwright-driven "BB" browser agent for autofilling
  agency forms, emergentintegrations for LLM access.
- **DB:** MongoDB (Motor / pymongo), seeded with demo users, cases,
  resources, forms, tasks, messages.
- **Routers mounted under `/api`:**
  `auth`, `users`, `cases`, `case_ops`, `forms_resources` (forms + resources),
  `bb` (BB AI browser agent + chat), `integrations`, `admin`, `notifications`.

## 4. Personas

| Persona     | Primary surface                | Top jobs-to-be-done                                              |
|-------------|--------------------------------|------------------------------------------------------------------|
| Resident    | `/resident` dashboard          | See active case, tasks, documents, applications, messages       |
| Caseworker  | `/caseworker` dashboard        | Triage cases by urgency, run BB autofill, message residents     |
| Admin       | `/admin` dashboard             | Manage users, configure integrations, view audit log            |
| Volunteer   | (future) resource map + tasks  | Surface and verify community resources                          |
| Agency      | (future) integration endpoints | Receive structured applications via BB submissions              |

## 5. Status — what is implemented (2026-05-27)

- [x] Cloned `Web` branch of `github.com/jawknee5/haven` into `/app` (replaced
  starter scaffold per user instruction).
- [x] Backend boots cleanly, `/api/health` returns 200, idempotent seed runs
  on startup (5 users, 9 resources, 6 cases, tasks, messages, 1 universal
  form).
- [x] Frontend compiles via `craco start` on port 3000; preview URL serves
  the multi-stage HAVEN intro cinematic → login screen with one-click demo
  accounts.
- [x] JWT login flow verified end-to-end (caseworker token returns 6 cases).
- [x] All routes wired in `App.js` for resident / caseworker / admin role
  hubs.
- [x] `REACT_APP_BACKEND_URL` and `MONGO_URL` configured for this pod;
  `EMERGENT_LLM_KEY` and `JWT_SECRET` present in `backend/.env`.
- [x] Test credentials documented in `memory/test_credentials.md`.

### Iteration 3 (2026-05-27) — Quick Drill + code-review fixes

- [x] **BB Quick Drill** card on the resident dashboard. Deterministic
  day-of-year rotation across 10 curated drills (knots, water purification,
  navigation, shelters, first aid, fire, hypothermia). Click → routes to
  `/survival-bible?askbb=1&ask=...` which auto-opens BB and pre-fills the
  question. User just hits Send to get BB's step-by-step answer.
- [x] `BBChat` now accepts an `initialInput` prop for pre-filling.
- [x] `SurvivalBiblePage` honors `?ask=` and `?askbb=1` URL params.
- [x] **Code-review fixes** (real findings only):
  - Replaced array-index React keys with stable IDs in `BBChat`,
    `SurvivalBiblePage`, `ApplicationsPage`, `IntegrationsPage`.
  - Replaced silent empty `catch {}` blocks with `console.error(...)` /
    `console.warn(...)` in `MessagesPage`, `IntegrationsPage`, `LoginPage`,
    `ResidentDashboard`.
  - Added eslint-disable comments where intentional, matching existing
    project convention (`AdminUsersPage` style).
- [x] **Code-review false positives declined** (with rationale recorded in
  the chat): hardcoded "secrets" findings flagged the public demo password
  shown on-screen as part of the demo UX; `is None` flagged as `==` issue
  (incorrect — `is None` is canonical Python); `tokens` undefined finding
  ignored a re-raising try/except; localStorage → httpOnly-cookie migration
  deferred as a major architectural change requiring user approval.

### Iteration 2 (2026-05-27)
- [x] **Intro overflow fixed** — "STABILITY STARTS HERE." now uses a tighter
  `clamp(1.6rem, 4.6vw, 4.4rem)` font with 6vw side padding so it never
  clips at any viewport width.
- [x] **Login logo enlarged** — bumped max-width 640→780px, centered on all
  viewports (was right-aligned on desktop), tagline + caption now stack
  cleanly underneath.
- [x] **Survival Bible page** at `/survival-bible` — 12 chapters ported from
  the `main` branch (`survivalGuide.ts` + `enhancedSurvivalGuide.ts`):
  water, food, shelter, fire, first aid, navigation, weather, tools,
  psychology, 15 wilderness knots, bow-drill fire crafting, wilderness
  shelter designs. Includes search, chapter sidebar, and an inline "Ask BB"
  toggle.
- [x] **Camping page** at `/camping` — 12 Bay-Area sites (6 paid, 6 free)
  on a Leaflet map + filterable card list with price, services, phone, and
  website.
- [x] **Camping on the main resource map** — `ResourceMapWidget` now unions
  `/api/resources` with `CAMPING_AS_MAP_RESOURCES`, adds a green ⛺ marker
  glyph and a "Camping" legend entry.
- [x] **Resident & caseworker sidebars** now include "Camping" and
  "Survival Bible" links.
- [x] **BB = the dove** — `BBFloatingBubble` and `BBChat` avatar now render
  `/haven-bird-sm.png` inside a soft golden halo instead of the "BB" text
  block.
- [x] **BB knows the Survival Bible** — `bb_brain.BB_SYSTEM_BASE` now
  embeds a condensed but comprehensive survival-knowledge appendix
  (water, food, shelter, fire, first aid, navigation, weather, tools,
  knots with memory tricks, psychology). Verified via curl: BB returns
  step-by-step bowline instructions and a 4-method water-purification
  walkthrough.

## 6. Known gaps / "not yet usable until counties integrate"

These are expected per the user's brief — Haven is a unifying layer that
needs civic data sources behind it:

- Real-time housing-authority Section 8 status (only demo HTML form mounted
  at `/demo/housing-form`).
- Live food-bank inventory + SNAP eligibility.
- HIE / county health-record handshake.
- VA / SSA benefit status integrations.
- 211 / county crisis dispatch handoff.

Until a county/agency partner is signed, BB (browser agent) bridges the gap
by autofilling agency portals on the resident's behalf.

## 7. Backlog (prioritised)

### P0 — Deployment-blockers
- [ ] User confirms native Emergent deployment from the chat → waiting for
      deploy button click.
- [ ] After first deploy, swap `JWT_SECRET=haven-prod-secret-change-me-…` for
      a real production secret.

### P1 — Partner-readiness
- [ ] Build a minimal "Agency Integration Sandbox" page so prospective
      counties can hit a working OAuth/webhook stub.
- [ ] Audit log export (CSV/JSON) for HIPAA / state-audit reviewers.
- [ ] Per-agency tenancy (RBAC scoping by `agency_id`).

### P2 — Resident polish
- [ ] Multilingual UI (i18n scaffolding already present in `src/lib/i18n.js`).
- [ ] Push/SMS notifications via Twilio (router exists, sender not wired).
- [ ] Resource-map cluster icons + drive-time filter.

## 8. Pitch-day enhancement idea

**Add a public "Impact Counter" widget to the marketing/landing surface**
that shows live (or simulated) numbers like _"4,812 cases routed · 312
caseworker hours saved this week · 17 partner agencies live."_ It turns
Haven from "a portal" into "a movement" — perfect for the GovTech /
foundation grant pitches where the $20M/year claim lives. It also gives
counties instant social proof when they're evaluating whether to integrate.

## 9. Repo layout (after clone)

```
/app
├── backend/                   FastAPI app
│   ├── server.py              entrypoint, lifespan, /api router mount
│   ├── auth.py, database.py, models.py, seed.py
│   ├── bb_brain.py, browser_engine.py, agency_adapters.py
│   ├── routers/               auth, users, cases, case_ops, forms_resources,
│   │                          bb, integrations, admin, notifications
│   └── .env                   MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY
├── frontend/                  React 19 + CRACO + Tailwind + shadcn/ui
│   ├── src/App.js             routes
│   ├── src/pages/             IntroAnimation, Login, Landing, Resident*,
│   │                          Caseworker*, Admin*, BB*, Crisis, Resources,
│   │                          Book, Messages, Applications, FormBuilder,
│   │                          Integrations, Settings
│   ├── src/components/        AppLayout, BBChat, BBFloatingBubble,
│   │                          ResourceMapWidget, BirdMark, LanguageSwitcher,
│   │                          MobileNav, AgencySubmitPanel, ui/
│   └── .env                   REACT_APP_BACKEND_URL
├── design_guidelines.json     dark Swiss-Brutalist tactical theme
└── memory/                    PRD.md, test_credentials.md
```

### Iteration 4 (2026-07-07) — Engines + Apex Vault + Architect + 63 resources

- [x] **Six Engines** ported to Python at `backend/engines/*.py` (civic_context, firstresponse_router, qualifycore, nexus_match, civic_flow, cascade_pipeline, dispatcher). `run_all_engines(ctx, db=db)` executes the full pipeline in ~1.5 ms; verified via `/api/architect/engines/self-test`.
- [x] **Apex Vault** at `backend/vault.py` — AES-256-GCM authenticated encryption + scrypt KDF (N=2^15) + DEK/KEK envelope + HMAC-SHA256 timing-safe integrity + `VaultRotator`. Module-level helpers (`encrypt_field`, `decrypt_field`, `protect_document`, `unprotect_document`) with a 7-field auto-encryption allow-list (ssn, dob, case_number, income, bank_account, phone, address_line1).
- [x] **Massive resource catalog** — `seed_resources_extra.py` adds 100-line dump (~55 entries) covering HUD-VASH, Here4You Coordinated Entry, Homekey, homeless prevention, emergency shelter, Second Harvest, CalFresh, WIC, hot-meal kitchens, Medi-Cal, valley homeless healthcare, FQHCs, DV shelters, crisis lines, 988, work2future, Reentry Resource Center, EDD unemployment, CalWORKs, GA, SSA, Law Foundation SV, Public Defender record clearance, SIREN + Catholic Charities immigration, LIHEAP, PG&E CARE, 4Cs childcare, First 5, Boys & Girls, PAL youth, Gateway SUD, Pathway Society, Sourcewise seniors, IHSS, VTA Access + Lifeline, HUD SF regional, VA Palo Alto homeless, 211 Bay Area. Idempotent upsert-by-name; new entries flow in on every restart.
- [x] **Resource click-to-expand modal** (`ResourceDetailModal.jsx`) with Call / Email / Website / Directions / Apply / Reserve action buttons; capacity + availability badge; explains that live open-spot data lights up once the agency signs the DPA.
- [x] **The Architect dashboard** at `/architect` — **exclusively** gated to `role="architect"` (only `jawknee.rodriquez@gmail.com`). Admins get 403. Shows: 6 live metric tiles, Apex Vault status card, Six-engine self-test button, User CRUD table, Agency Integration Requests panel. Auto-refreshes every 15 s.
- [x] **Request Integration OAuth form** (`IntegrationRequestForm.jsx`) — Architect enters agency + top-3 chain-of-command → backend generates pre-filled DPA (HTML endpoint, print-to-PDF) + mailto link → when a signed doc + credentials come back via `POST /api/integration-requests/{id}/authorize`, secrets are encrypted through the Apex Vault before storage and status flips to `active`.
- [x] **Case-number widget** (`CaseNumberWidget.jsx`) on both **resident** AND **caseworker** dashboards — value is encrypted via the Apex Vault so BB can use it later for autofill on the corresponding agency portal.
- [x] **Login redirects**: architect → `/architect`, admin → `/admin` (unchanged), everyone else → `/{role}`.
- [x] **Sidebar navigation**: added new `architect` schema with "The Architect" link at the top (Crown icon).
- [x] **Login layout**: kept the enlarged logo (max 640px on desktop), tagline stacked underneath, side-by-side with the sign-in card.
- [x] **BB knows the Apex Vault & engines**: system-prompt appendix from Iteration 2 already teaches survival topics; engines run behind the scenes to generate the eligibility + resource-match context BB serves to the resident.
- [x] Document Locker upload button confirmed working (data-testid `doc-upload-btn` in `ResidentDocumentsPage`); no fix required, user just needs to be on their active-case documents page.

### Known non-blockers deferred
- **OCR/AI document scanner** (Gemini Vision + auto-classification into the locker) — will land in a dedicated pass.
- **Live open-spot data** for each resource — activates the moment each agency signs the DPA; until then, the modal shows "live sync pending integration".
- **SendGrid email delivery** — currently uses `mailto:` chain-of-command; SendGrid wiring pending an API key.

### Iteration 5 (2026-06 / current fork) — Universal Document Scanner
- [x] **Universal Document Scanner** — `backend/scanner.py`: GPT-4o vision (Emergent Universal Key) OCR + classification into 9 categories (identity, social_security, birth_certificate, medical, benefits, housing, income, legal, other).
- [x] Supported formats: JPG, PNG, WEBP, PDF (PyMuPDF first-page render), TXT, DOCX (python-docx), legacy DOC (antiword).
- [x] `POST /api/documents/scan` — scans, classifies, auto-files into Document Locker; extracted key_fields + full OCR text encrypted with Apex Vault (`extracted_vault`). `GET /api/documents/{id}/extracted` decrypts for owner/staff.
- [x] Frontend: "Smart Scan" button + scan result card + "Vault" button per doc opening decrypted-extraction modal (`ResidentDocumentsPage.jsx`). Route: `/resident/documents`.
- [x] E2E verified: image→housing 0.98, txt→income 0.95, docx→medical 0.98; vault decrypt round-trip OK; UI modal verified via screenshot.
- [x] Universal Key in backend/.env refreshed after user top-up (old key was budget-exhausted).
- Error handling: 402 with top-up message when key balance empty; 415 for unsupported types; 413 >8MB.

### Remaining backlog
- P2: SendGrid email delivery for MOU/DPA (blocked on API key)
- P3: Live open-spot counts + case-number autoload (blocked on agency partnerships)
- Refactor: BBBrowserControlPage.jsx modularization; JWT localStorage → httpOnly cookies
