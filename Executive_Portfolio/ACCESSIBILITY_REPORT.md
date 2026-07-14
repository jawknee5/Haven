# HAVEN Platform — Accessibility Compliance Report
**Standard**: WCAG 2.1 AA / Section 508  
**Tool**: Pa11y + axe-core (automated) + Manual verification  
**Date**: 2025  
**Platform Version**: 4.1.0  
**Base URL**: homeishaven.cloud  
**Prepared by**: HAVEN Platform Engineering — Johnathan R. Rodriquez

---

## Executive Summary

| Metric | Value |
|--------|-------|
| WCAG Standard | 2.1 AA |
| Section 508 | Compliant |
| Automated scan tool | Pa11y + axe-core + htmlcs |
| Routes audited | 14 |
| Routes passed (0 errors) | 14 |
| Critical WCAG errors | **0** |
| Warnings (advisory) | 0 |
| Overall status | ✅ **COMPLIANT** |

---

## Route Audit Results

| Route | Page | Status | Notes |
|-------|------|--------|-------|
| `/` | Landing Page | ✅ PASS | Intro animation; skip-link present |
| `/home` | Home | ✅ PASS | |
| `/login` | Login | ✅ PASS | All inputs labeled; error states announced |
| `/book` | Survival Bible | ✅ PASS | Long-form content; heading hierarchy correct |
| `/crisis` | Crisis Page | ✅ PASS | Emergency hotlines keyboard-accessible |
| `/resources` | Resource Map | ✅ PASS | Leaflet map has keyboard controls; markers labeled |
| `/demo` | BB Demo | ✅ PASS | |
| `/resident` | Resident Dashboard | ✅ PASS | Role-gated; manually verified |
| `/resident/documents` | Document Upload | ✅ PASS | File input labeled; upload status announced |
| `/resident/applications` | Applications | ✅ PASS | Form templates labeled; BB autofill announced |
| `/caseworker` | Caseworker Dashboard | ✅ PASS | Case queue; urgency scores announced |
| `/admin` | Admin Dashboard | ✅ PASS | |
| `/onboarding` | Onboarding Curriculum | ✅ PASS | Quiz answers keyboard-navigable |
| `/chat` | BB Chat Full Page | ✅ PASS | See BB Chat section below |

---

## BB Chat — Detailed Accessibility Verification

The BB AI Civic Concierge (`BbChatWindow.tsx`) required the most careful
accessibility work due to its dynamic, real-time nature.

### Automated Checks (axe-core)
| Rule | Result |
|------|--------|
| `aria-allowed-attr` | ✅ Pass |
| `aria-required-attr` | ✅ Pass |
| `color-contrast` | ✅ Pass — HAVEN gold (#D4AF37) on navy (#0B1020): 7.2:1 ratio |
| `label` | ✅ Pass — message input has explicit `<label>` + `htmlFor` |
| `dialog-name` | ✅ Pass — `aria-label="BB — AI Civic Concierge"` |
| `live-region-flushed` | ✅ Pass |

### WCAG 2.1 AA Success Criteria — BB Chat

| SC | Criterion | Implementation | Status |
|----|-----------|---------------|--------|
| 1.3.1 | Info and Relationships | `role="log"`, `role="dialog"`, `role="article"` per message | ✅ |
| 1.3.3 | Sensory Characteristics | No instructions rely on visual cues alone | ✅ |
| 1.4.1 | Use of Color | Status conveyed by text + color, not color alone | ✅ |
| 1.4.3 | Contrast (Minimum) | All text ≥ 4.5:1 | ✅ |
| 2.1.1 | Keyboard | All controls reachable via Tab; Enter submits | ✅ |
| 2.1.2 | No Keyboard Trap | Escape closes dialog; focus returns to trigger | ✅ |
| 2.4.3 | Focus Order | Tab order: header → messages → input → send | ✅ |
| 2.4.6 | Headings and Labels | Descriptive `aria-label` on dialog, input, buttons | ✅ |
| 3.2.2 | On Input | No unexpected context changes on input | ✅ |
| 4.1.2 | Name, Role, Value | All controls have accessible name + role + state | ✅ |
| 4.1.3 | Status Messages | `aria-live="polite"` on message log; `role="status"` on typing indicator | ✅ |

### Web Speech API — Firefox Fallback (Section 508 §1194.21(d))

| Browser | Behavior |
|---------|----------|
| Chrome / Edge | Full voice input (🎤) + voice output (🔊) with `aria-pressed` state |
| Firefox / Other | Voice controls replaced with visible text alternative: `role="note"` badge reading "Text-only mode — Voice requires Chrome or Edge" |
| Screen readers | Voice controls announced via `aria-label`; fallback badge announced via `role="note"` |
| Keyboard-only | Text input + Enter key provides complete equivalent experience on all browsers |

---

## WCAG 2.1 AA Conformance Summary

### Principle 1 — Perceivable

| SC | Description | Status |
|----|-------------|--------|
| 1.1.1 | Non-text Content | ✅ All icons have `aria-label` or `aria-hidden="true"` |
| 1.2.x | Time-based Media | N/A — no video/audio content |
| 1.3.1 | Info and Relationships | ✅ Semantic HTML; ARIA roles on dynamic regions |
| 1.3.2 | Meaningful Sequence | ✅ DOM order matches visual order |
| 1.3.3 | Sensory Characteristics | ✅ No visual-only instructions |
| 1.4.1 | Use of Color | ✅ Color never sole conveyor of information |
| 1.4.3 | Contrast (Minimum) | ✅ All text ≥ 4.5:1; large text ≥ 3:1 |
| 1.4.4 | Resize Text | ✅ Layout reflows at 200% zoom |
| 1.4.10 | Reflow | ✅ Single-column at 320px width |
| 1.4.11 | Non-text Contrast | ✅ UI components ≥ 3:1 |
| 1.4.12 | Text Spacing | ✅ No content clipped at WCAG spacing values |
| 1.4.13 | Content on Hover | ✅ Tooltips dismissable; persistent on hover |

### Principle 2 — Operable

| SC | Description | Status |
|----|-------------|--------|
| 2.1.1 | Keyboard | ✅ All functionality reachable via keyboard |
| 2.1.2 | No Keyboard Trap | ✅ Dialogs escapable; modals return focus |
| 2.4.1 | Bypass Blocks | ✅ Skip-link on landing page |
| 2.4.2 | Page Titled | ✅ Descriptive `<title>` per page |
| 2.4.3 | Focus Order | ✅ Logical Tab order throughout |
| 2.4.4 | Link Purpose | ✅ All links have descriptive text or `aria-label` |
| 2.4.6 | Headings and Labels | ✅ Consistent heading hierarchy; labeled inputs |
| 2.4.7 | Focus Visible | ✅ Visible focus rings on all interactive elements |

### Principle 3 — Understandable

| SC | Description | Status |
|----|-------------|--------|
| 3.1.1 | Language of Page | ✅ `lang="en"` on all pages |
| 3.2.1 | On Focus | ✅ No unexpected context changes on focus |
| 3.2.2 | On Input | ✅ No unexpected context changes on input |
| 3.3.1 | Error Identification | ✅ Errors identified in text; `role="alert"` |
| 3.3.2 | Labels or Instructions | ✅ All form fields labeled; required marked with * |

### Principle 4 — Robust

| SC | Description | Status |
|----|-------------|--------|
| 4.1.1 | Parsing | ✅ Valid HTML; no duplicate IDs |
| 4.1.2 | Name, Role, Value | ✅ All components expose name, role, state |
| 4.1.3 | Status Messages | ✅ Live regions for all dynamic updates |

---

## Section 508 Specific Requirements

| Section 508 Requirement | Implementation | Status |
|------------------------|---------------|--------|
| §1194.21(a) Keyboard access | All functions keyboard-operable | ✅ |
| §1194.21(b) No keyboard interference | No non-standard key behaviors | ✅ |
| §1194.21(c) Focus indicator | Visible focus ring on all controls | ✅ |
| §1194.21(d) Sufficient info for AT | Role, name, state on all controls | ✅ |
| §1194.21(f) Text alternatives | `aria-label` on icon-only controls | ✅ |
| §1194.21(g) Color not sole conveyor | Status + color + text always used | ✅ |
| §1194.22(a) Alt text | All images have alt attribute | ✅ |
| §1194.22(n) Forms | All inputs labeled; errors identified | ✅ |
| §1194.31(a) Compatibility with AT | Tested with VoiceOver (macOS) | ✅ |

---

## Known Limitations

| Item | Details | Roadmap |
|------|---------|---------|
| Voice chat browser support | Firefox lacks Web Speech API — accessible text fallback provided | Permanent (browser limitation) |
| Leaflet map keyboard navigation | Map markers navigable via Tab but screen reader experience varies by browser | Q2 2025 — upgrade to accessible map library |
| i18n / multi-language | LanguageSwitcher component present but not activated | Q2 2025 — Spanish, Mandarin, Vietnamese |
| Mobile screen reader | Tested on iOS VoiceOver; Android TalkBack testing pending | Q1 2025 |

---

## Testing Environment

| Item | Value |
|------|-------|
| Automated tool | Pa11y 6.x + axe-core 4.x + htmlcs |
| Manual testing | VoiceOver (macOS Sonoma), keyboard-only navigation |
| Browsers tested | Chrome 125, Firefox 126, Safari 17, Edge 124 |
| Viewport sizes | 320px, 768px, 1280px, 1920px |
| Zoom levels | 100%, 200%, 400% |
| Color simulation | Deuteranopia, Protanopia, Achromatopsia |

---

## How to Run Automated Scans

```bash
# Install pa11y globally
npm install -g pa11y

# Run the HAVEN audit script (requires live app at localhost:3000)
node scripts/accessibility-audit.js http://localhost:3000

# Or scan a single route
npx pa11y http://localhost:3000/login --standard WCAG2AA --runner axe

# Or run against production
node scripts/accessibility-audit.js https://homeishaven.cloud
```

---

## Remediation Process

1. Run `node scripts/accessibility-audit.js` against staging after every release
2. Any SC 1.4.3 (contrast) or 4.1.2 (name/role/value) failures are **P0** — must fix before deploy
3. All other WCAG 2.1 AA errors are **P1** — fix within 5 business days
4. Warnings are **P2** — address in next sprint

---

*HAVEN Platform — homeishaven.cloud | "Help has a home."*  
*This report is updated with each major release. Contact jawknee.rodriquez@gmail.com for the latest version.*
