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
