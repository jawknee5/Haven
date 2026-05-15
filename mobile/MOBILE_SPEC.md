# PATHWAY MOBILE APP - OFFICIAL SPECIFICATION

## Executive Summary

Pathway is a personalized civic-navigation and life-management platform on mobile. It uses an interaction model and modular design inspired by Gridless: Survival App, but with Pathway's branding, mission, colors, and civic-tech features.

The app guides users through algorithmic workflows with task-driven roadmaps, resource discovery, and a rewritten survival manual (Survival: Book). The UI is tile-based, swipe-friendly, offline-capable, and uses dynamic, cinematic backgrounds.

---

## 📱 Global Navigation Structure

### Bottom Tab Navigation (6 Tabs)
1. **Dashboard** - Mission control with task widget
2. **Pathway** - Vertical connect-the-dots roadmap
3. **Resources** - Civic resource library
4. **Tools** - Utility grid
5. **Pack** - Backpack/briefcase with Survival: Book
6. **Profile** - User settings and account

Each tab:
- Has its own sub-views
- Uses dynamic backgrounds
- Maintains consistent spacing and typography
- Smooth horizontal transitions between tabs

---

## 🎯 Dashboard Tab — "I Will Show You The Way"

### Visual Hierarchy
- **Header**: "I Will Show You The Way" (28-32px, Bold)
- **Task Widget**: Scrollable card list
- **Background**: Civic imagery (city skylines, community centers), 15-25% opacity

### Task Widget
- Shows **3 tasks at a time**
- User can scroll to see full list
- Smooth inertial scrolling with settling animation

### Task Card Components
Each task card displays:
- **Title** (18-20px, Medium)
- **Description** (15-17px, Regular)
- **Status indicator** (color-coded: pending/in-progress/completed)
- **Due date** (13-14px, Light)
- **Micro-action buttons** (48px touch targets):
  - Upload (cloud-arrow icon)
  - Call (phone icon)
  - Map (pin icon)
  - Open Pathway (arrow-right icon)

### Interactions
- **Tap task card** → Navigate to that task in Pathway tab
- **Tap upload** → Open camera or file picker
- **Tap call** → Open native phone dialer
- **Tap map** → Cinematic map navigation
- **Tap open** → Jump to Pathway tab at that node

### Analytics Layer (Covert)
- Streaks display subtly
- Badges unlock on completion milestones
- Progress metrics feed engagement system

---

## 🧭 Pathway Tab — Vertical "Connect-the-Dots" Roadmap

### Visual Structure
- **Vertical scroll layout**
- **Nodes connected by animated lines** (3px stroke)
- **Node size**: 28-36px diameter
- **Vertical spacing**: 48-64px between nodes
- **Background**: Google Street View (destination-based, updates as user scrolls)

### Node Behavior
- **Pending nodes**: Outline only
- **Current node**: Subtle pulse animation
- **Completed nodes**: Soft glow + filled
- **Tap node** → Expand + show detail panel

### Node Detail Panel (On Tap)
Slides up from bottom with:
- Title
- Instructions
- Sub-steps (checkbox list)
- Document upload button
- Phone call button
- Map navigation button
- Resource link button
- Close button

### Node Interactions
- Tap to expand/collapse
- Swipe down to close detail panel
- Scroll to next/previous node
- Visual feedback on completion

---

## 📚 Resources Tab — Civic Resource Library

### Layout
- **Category grid** (3-column layout)
- **Categories** slide to resource list
- **Resource cards** show summary
- **Tap card** → Full resource detail

### Categories
- Housing
- Food & Nutrition
- Transportation
- Benefits & Assistance
- Legal Aid
- Healthcare
- Local Services
- Emergency Help

### Resource Card
- Name
- Description
- Address
- Phone number
- Website link
- Bookmark button
- Open button (full details)

### Resource Detail
- Full information
- Map view
- Hours of operation
- Eligibility requirements
- Call button
- Navigate button
- Related resources

### Features
- Offline caching
- Bookmark saved resources
- Search with fuzzy matching
- Filter by category

---

## 🔧 Tools Tab — Utility Suite

### Tool Grid (3-4 column layout)
Each tool is a tile with icon + label (48px touch target)

**Available Tools:**
1. **Document Scanner** - Camera for document capture
2. **ID Verification** - Validate identification
3. **Case Notes Recorder** - Audio/text case notes
4. **Appointment Scheduler** - Calendar integration
5. **Eligibility Estimator** - Quick eligibility check
6. **Address Validator** - Verify addresses
7. **Offline Form Filler** - Pre-filled forms
8. **Resource Matcher** - Find matching resources
9. **Crisis Routing Tool** - Emergency resource routing

### Tool Interactions
- **Tap tile** → Opens fullscreen tool interface
- Smooth transition animation
- Close button returns to grid

### Tool Screen Behaviors
- Camera slides up
- File picker fades in
- Map zooms smoothly
- Form scrolls with context

---

## 📦 Pack Tab — "Backpack" / "Briefcase"

### Submodule: Survival: Book
A rewritten, non-copyrighted survival manual inspired by Gridless's Field Manual.

**Content Categories:**
- Wilderness Basics
- First Aid
- Water Purification
- Firecraft
- Shelter Building
- Navigation
- Foraging
- Emergency Protocols
- Knot Tying
- Urban Survival
- Disaster Readiness

### UI Structure
1. **Category grid** → 2-3 column layout
2. **Article list** → Scrollable article cards
3. **Article detail** → Full content + images

### Article Card
- Title
- Preview text
- Category badge
- Read button

### Article Detail
- Header image
- Full content
- Image gallery
- Related articles
- Share button
- Bookmark button
- Back button

### Features
- Offline caching
- Smooth scroll-to-read
- Bookmark articles
- Share via native share sheet
- Swipe navigation between articles

### Dynamic Background
- Forest imagery
- Mountains
- Campfires
- Wilderness scenes
- Blur: 12-18px
- Parallax: 30% scroll speed

---

## 👤 Profile Tab

### User Info Section
- Avatar
- User name
- Email
- User role (Individual / Caseworker / Admin)
- Edit profile button

### Settings Sections
- **Agency Settings** - Organization details
- **Offline Data Manager**
  - Sync status
  - Manual sync button
  - Data usage indicator
- **Notifications** - Push/notification preferences
- **Appearance** - Theme selection (Pathway only)
- **Permissions** - Location, camera, contacts
- **Account**
  - Change password
  - Delete account
  - Logout button

---

## 🎨 Visual System

### Color Palette
- **Navy (#0A1A2F)**: Headers, nav, backgrounds
- **Blue (#1E3A5F)**: Buttons, active states
- **Teal (#1F6F78)**: Highlights, accents, progress
- **Slate Blue (#2C4A72)**: Card backgrounds
- **Warm Gray (#A9B4C2)**: Labels, dividers
- **Success (#3BB273)**: Completed, approved
- **Error (#D9534F)**: Errors, failed uploads
- **Dark Canvas (#0F1F33)**: App background

### Typography
- **Font**: Inter (or SF Pro/Roboto fallback)
- **Sizes**: 12px (micro) → 28-32px (title)
- **Weights**: Light → Bold
- **Line height**: 1.2 (titles) to 1.45 (body)

### Spacing
- 4px (XS) → 48px (XXXL)
- Card padding: 16px
- Button padding: 12px vertical / 20px horizontal
- Touch targets: 48px minimum, 56px ideal

### Icon Style
- Thin-line rounded corners
- 1.75px stroke (primary), 2px (emphasis)
- Active/completed: Teal (#1F6F78)
- Inactive: Warm Gray (#A9B4C2)

---

## 🎬 Motion & Animation

### Global Principles
- **Easing**: easeInOutCubic (default)
- **Confidence**: Slow, intentional motion
- **Cinematic**: Fades, glows, smooth zooms
- **Directional**: Vertical = progress, horizontal = context switch

### Key Animations

#### Dashboard Task Cards
- Fade in from bottom (150ms)
- Slide up (10px)
- Hover: scale 1.02

#### Pathway Nodes
- Sequential fade-in with stagger
- Connector lines draw themselves (300ms)
- Completed nodes pulse glow
- Current node has subtle pulse (1000ms loop)

#### Map Navigation (Signature Animation)
1. Fade in map (200ms)
2. Auto-zoom to destination (600ms, easeInOutCubic)
3. Zoom out to reveal area (500ms)
4. Pan to user location (400ms, easeOutQuad)
5. Display: "This is you." (fade in)
6. Zoom out to show both points (600ms)
7. Draw route in blue (stroke animation, 700ms)
8. Display: "This is your Path." (fade in)
9. Drop cascading resource icons (PITstops)
10. Display: "These are your PITstops." (fade in)
11. Confirm button slides up (250ms)

#### Tab Switching
- Horizontal slide (250ms)
- Background crossfade
- Icons bounce (scale 1.1 → 1.0)

#### Dynamic Backgrounds
- Crossfade: 300-500ms
- Blur increases during transition
- Parallax: 30% of scroll speed
- Opacity overlay auto-adjusts

### Micro-interactions
- Streak increase: flame effect + pop
- Badge unlock: scale + glow ring expansion
- Button press: scale 0.98 feedback
- Task completion: confetti (subtle, dark-friendly)

---

## 🌐 Dynamic Backgrounds

### Per-Tab Imagery
- **Dashboard**: Civic skylines, community centers, soft gradients
- **Pathway**: Google Street View (destination-based)
- **Resources**: Government buildings, maps, service icons
- **Tools**: Abstract tech textures, geometric patterns
- **Pack**: Forest, mountains, campfires, wilderness
- **Profile**: Civic imagery with soft gradients

### Properties
- **Opacity**: 15-25%
- **Blur**: 12-18px Gaussian
- **Brightness**: Slightly dimmed
- **Parallax**: 30% scroll speed
- **Transition**: Crossfade 300-500ms with blur increase

### Content Rules
- No faces
- No identifiable people
- No copyrighted imagery
- Always subtle
- Always supportive

---

## 🎯 Interaction Patterns

### Task Card Actions
- **Upload**: Opens camera or file picker
- **Call**: Opens native dialer
- **Map**: Triggers cinematic map navigation
- **Open**: Jumps to Pathway tab at task node

### Node Interactions
- **Tap**: Expand detail panel
- **Swipe down**: Close detail panel
- **Scroll**: Moves to next/previous nodes

### Map Navigation
- **Tap "map" button** → Cinematic sequence begins
- Shows both origin ("This is where your Path begins") and destination
- Draws blue route with PITstop icons
- User confirms before navigation starts

### Resource Bookmarking
- **Tap bookmark icon** → Saves to "My Resources"
- Heart fills with primary teal color
- Offline accessible

---

## 📊 Analytics Layer (Covert)

### Streaks
- Tracks consecutive days of task completion
- Visual indicator on Dashboard
- Resets if day is missed
- Highest streak tracked

### Badges
- **Housing Seeker** - 5 housing tasks completed
- **Crisis Resolver** - Completed emergency routing
- **First Shelter** - First shelter booking
- **Employment Starter** - First job training task
- **Health Champion** - 10 health-related tasks
- **Community Connector** - Completed 20 tasks
- And many more...

### Completion Weight
- Tasks have varying weights (1.0–5.0)
- Affects overall progress percentage
- Complex tasks worth more

---

## 🔌 Offline Capabilities

### Offline Features
- Cached resources
- Saved bookmarks
- Downloaded articles (Pack tab)
- Pre-filled form templates
- Offline task list
- Streaks persist locally

### Sync Behavior
- Manual sync button in Profile
- Auto-sync when online
- Data usage indicator
- Conflict resolution (server wins)

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation
- Bottom navigation structure
- Dashboard task widget
- Basic styling system
- Dynamic background framework

### Phase 2: Pathway Core
- Vertical roadmap with nodes
- Node detail panels
- Task completion tracking
- Cinematic map navigation

### Phase 3: Resources & Tools
- Resource library with categories
- Tool grid and implementations
- Offline caching system

### Phase 4: Pack & Analytics
- Survival: Book content + UI
- Badge/streak system
- Full offline support

### Phase 5: Polish
- Performance optimization
- Animation refinement
- Accessibility audit
- Beta testing

---

## 📋 Component Dependencies

- All tabs depend on `design-system.ts` (colors, motion, spacing)
- Tabs depend on `component-tree.ts` (interfaces, theme)
- Dynamic backgrounds use parallax from motion spec
- Animations use easing from motion spec
- Task cards use spacing from spacing scale

---

**Official Pathway Mobile App Specification**
*v1.0 — Complete Design System & Architecture*
