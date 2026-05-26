# HAVEN — Product Requirements Document
**Helping Agencies, Volunteers, and Everyone Navigate**
**Headline:** Help has a home.

## Project Status (2026-05-26)
Pulled both `main` and `Web` branches of `jawknee5/Haven` into Emergent workspace.
Web branch contains the production-grade FastAPI + React app and is now running at
`https://haven-dashboard-1.preview.emergentagent.com` with the following new modules
layered on top in this session:

### NEW this session
1. **Legacy Bridge / Multi-Agency Integrations** (the core ask)
   - 12 default federal/state/county agency integrations seeded:
     HUD Section 8, SSA SSI, USDA SNAP/CalFresh, CMS Medicaid/Medi-Cal, VA Benefits,
     IRS VITA, DMV REAL ID, DOL/EDD Unemployment, HHS TANF/CalWORKs,
     CPS Child Welfare Referral, Court e-Filing Eviction Defense, WIC.
   - Endpoints: `GET/POST/PATCH/DELETE /api/integrations`,
     `POST /api/integrations/submit`, `GET /api/integrations/submissions`,
     `POST /api/integrations/submissions/{id}/sync`, `GET /api/integrations/_/stats`.
   - Realistic-looking confirmation IDs (sha256-derived) + simulated status
     progression (`submitted → under_review → approved/denied/needs_action`)
     with a per-submission timeline.
   - Per-case `AgencySubmitPanel` on Case Detail page auto-maps intake_data → required fields.
   - Resident-facing "Applications" page tracks every submission with sync button.
2. **Admin Console v2**
   - User Management (`/admin/users`): list, search, filter by role, create user, edit role/name/phone inline.
   - Integrations console (`/admin/integrations`): cards with SLA / uptime / submissions, toggle connect/disconnect.
   - Audit Log (`/admin/audit`): every privileged action (user create/update, integration toggle, agency submit/sync).
   - Enhanced Admin Dashboard: live integration health, audit feed, system snapshot, resource map, BB chat.
3. **Resident Dashboard v2**
   - At-a-glance counters: Tasks, Documents, Applications, Messages.
   - Recent updates feed (powered by `/api/notifications`).
   - New pages: **My Tasks** (`/resident/tasks`), **Document Locker** (`/resident/documents`),
     **Applications** (`/resident/applications`), **Messages** (`/resident/messages`).
4. **Mobile-responsive nav**
   - New `MobileNav` drawer with hamburger toggle on <768px.
   - Top bar collapses subtitle on small screens, action buttons wrap.
5. **Backend new routers**
   - `routers/integrations_router.py`, `routers/admin_router.py`, `routers/notifications_router.py`.
   - `audit_log` collection populated with every privileged write.

### Carried over (from Web branch — already polished)
- Auth: JWT + bcrypt, 1-click demo logins.
- Caseworker Dashboard: case queue, urgency bars, filters, BB chat, live resource map.
- Case Detail: header, intake grid, urgency banner, tasks, documents, messages, **AgencySubmitPanel (new)**, BB case-context chat.
- BB AI (Claude Sonnet 4.5 via emergentintegrations) + intent classification + crisis detection.
- BB Browser Control (real Playwright headless Chromium).
- Form Builder, Resources directory, Crisis page, Book (Calendly) page.
- Landing & Intro animations.

## Demo Credentials
- Caseworker: `caseworker@haven.demo` / `Demo2026!`
- Resident:   `resident@haven.demo`   / `Demo2026!`
- Admin:      `admin@haven.demo`      / `Demo2026!`

## What's MOCKED vs REAL
- **REAL**: All app logic, MongoDB, JWT auth, BB chat (real Claude Sonnet 4.5 via Emergent Universal LLM key), BB Browser Control (real Playwright Chromium).
- **MOCKED (simulated, by design)**: The 12 legacy agency integrations themselves — endpoints look real (`https://api.hud.gov/...`) but responses are synthesized locally. Connecting to live federal APIs requires per-agency OAuth/SAML/credentialed access that cannot be provisioned in a demo environment. The schema, required fields, SLAs, and status flows mirror real-world patterns so the UX is production-true; swapping in real adapters is a one-file replacement per agency.
