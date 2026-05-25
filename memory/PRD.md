# HAVEN — Product Requirements Document
**Helping Agencies, Volunteers, and Everyone Navigate**
**Headline:** Help has a home.

## Original Problem Statement
Build HAVEN — a modern civic-tech platform that unifies housing, food, health, benefits, crisis support, and community resources for residents AND streamlines case management for caseworkers, agencies, and volunteers. Must be investor-ready, suitable to be presented before the chairman of Microsoft. Replace events/welcome-sessions/donations with a single Calendly booking page. Free for everyone.

**Primary focus this session:** Caseworker Dashboard fully featured + BB AI with full skills including BB Browser Control autofill.

## Architecture
- **Backend:** FastAPI (Python 3.11), MongoDB (motor async), Playwright (headless Chromium for BB Browser Control), Emergent Universal LLM Key → Claude Sonnet 4.5
- **Frontend:** React 19 + craco, Tailwind + shadcn/ui, react-router-dom v7, Leaflet/react-leaflet, lucide-react icons
- **Auth:** JWT (HS256) with bcrypt, Bearer token
- **Hosting:** Kubernetes container, frontend on 3000, backend on 8001 (all routes /api prefixed)

## Roles & Personas
- **Resident** — seeks support; sees only own cases; mobile-first calm UI; crisis quick-exit
- **Caseworker** — manages caseload, drives BB Browser Control, builds custom forms, verifies documents, sends secure messages
- **Admin** — system-wide visibility, manages users + resources

## What's Implemented (2026-01-25)

### Backend
- JWT auth: register, login, /me; bcrypt password hashing
- Cases CRUD + claim + role-scoped listing
- Tasks (open/in-progress/done) with priorities
- Secure messages with role-aware ownership
- Document upload (base64 in MongoDB, 8MB limit) + verification
- Custom form builder with conditional logic-ready schema
- Resources directory (9 seeded San José resources)
- Analytics: caseworker + admin
- BB AI router (8 endpoints): chat, intro, forms/analyze, forms/autofill, applications/track, applications/status, applications/summary, browser/* (start/action/stop/sessions)
- BB AI brain: Claude Sonnet 4.5 via emergentintegrations; crisis intent classification; semantic form-field mapping
- BB Browser Control: real Playwright headless Chromium session manager; actions: navigate/fill/click/type/submit/extract/scroll/back/forward/screenshot/autofill_all
- Demo Section-8 housing form served at `/demo/housing-form` for end-to-end BB demos
- Idempotent seed: 5 users, 9 resources, 6 cases (incl. crisis cases), tasks, messages, 1 form

### Frontend
- **Landing page** — Hero, mission, BB feature, how-it-works, CTA, footer
- **Login page** — 1-click demo logins (Caseworker/Resident/Admin)
- **Caseworker Dashboard** — Metrics, filterable case queue with urgency bars, live resource map, BB chat, quick-action cards
- **Case Detail Page** — Case header, intake grid, high-urgency banner, tasks, documents (upload + verify), secure messages, BB case-context chat
- **Form Builder** — Live preview, drag-reorder, all field types, save/delete
- **BB Browser Control** — Live Playwright viewport (base64 screenshots), address bar, back/forward/refresh, scroll, analyze, prepare autofill, BB-autofill-live, submit; per-field mapping table; activity log; per-case data source selection
- **Resident Dashboard** — Roadmap cards, current-case summary, resource map, BB chat
- **Admin Dashboard** — User/case/resource metrics, system health, BB chat
- **Resources Page** — Filterable directory + sticky live map
- **Book page** — Calendly iframe (https://calendly.com/jawknee-rodriquez)
- **Crisis page** — Hotlines, quick-exit button (ESC also exits)
- **BB Floating Bubble** — Always present (every authed page) with pulse/bob animation and full chat panel

### Authorization Hardening
- Residents cannot read other residents' cases/messages/documents/tasks
- Only caseworkers/admins can create/update/delete tasks, claim cases, mutate cases, manage forms, verify documents
- BB browser sessions scoped per user (session_id format: `bb-browser-<user_id>`); stop endpoint validates ownership (admin override allowed)

## Testing Status
- Backend: **43/43 tests passing** (auth + cases + tasks/messages/documents + forms + resources + analytics + BB chat with real Claude Sonnet 4.5 + BB Browser Control with real Playwright Chromium extracting 12 fields and autofilling them)
- Frontend: manually verified — landing, login, caseworker dashboard, case detail, form builder, BB browser control with end-to-end autofill, resources page, resident dashboard

## Prioritized Backlog (P0/P1/P2)
- **P0** Real-time WebSocket streaming of browser screenshots (currently polled per action — works but a continuous stream would be smoother)
- **P0** Provider/agency onboarding flow + multi-tenant data partitioning
- **P1** Form submission engine: route data into cases, kick off application tracking automatically
- **P1** Document OCR pipeline → BB auto-extracts ID/income data when uploaded
- **P1** Capacity-aware routing engine (HTCRM) — when resident's case is enriched, auto-suggest the right shelter/food/health resource based on capacity_available
- **P1** Push notifications + email digests for caseworkers (high-urgency cases, new replies)
- **P2** Crisis Surge Router — auto-detect when >N high-urgency cases per hour, alert on-call staff
- **P2** Animated roadmap (per the user's "Animated roadmap preview" doc) for the resident dashboard
- **P2** AI-drafted message composer in case detail (one-click "Draft follow-up" using current case context)
- **P2** Audit log viewer in admin console
- **P2** Mobile-optimized PWA install prompts

## Files of Reference
- Backend: `/app/backend/server.py`, `bb_brain.py`, `browser_engine.py`, `auth.py`, `database.py`, `models.py`, `seed.py`, `routers/*`
- Frontend: `/app/frontend/src/App.js`, `pages/CaseworkerDashboard.jsx`, `pages/BBBrowserControlPage.jsx`, `pages/CaseDetailPage.jsx`, `pages/FormBuilderPage.jsx`, `components/ResourceMapWidget.jsx`, `components/BBChat.jsx`, `components/BBFloatingBubble.jsx`, `components/AppLayout.jsx`
- Design: `/app/design_guidelines.json`
- Test credentials: `/app/memory/test_credentials.md`
