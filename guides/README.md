# 📖 Guides Folder

This folder contains implementation guides, code examples, and step-by-step instructions for building Pathway v4.0.

## Files in This Folder

### Phase 1: Infrastructure (Complete ✅)
- **PHASE_1_COMPLETE.md** - Acceleration plan overview
  - What got built (Zustand stores, API services)
  - Project status update
  - Next steps priorities
  - Code examples
  - Installation instructions

### Implementation Guides
- **IMPLEMENTATION_GUIDE.md** - Complete developer guide
  - Architecture overview
  - File structure
  - Code patterns with examples
  - API services reference
  - Type definitions
  - Testing procedures
  - Troubleshooting

## How to Use These Guides

### I'm New to the Project
1. Read `PHASE_1_COMPLETE.md` (30 min)
2. Review code examples in `IMPLEMENTATION_GUIDE.md`
3. Run `npm install` and test locally

### I Need to Build a Feature
1. Check relevant pattern in `IMPLEMENTATION_GUIDE.md`
2. Copy code example
3. Adapt to your component
4. Test with backend API

### I'm Fixing an Issue
1. Check troubleshooting section in `IMPLEMENTATION_GUIDE.md`
2. Verify `.env.local` configuration
3. Check backend is running (`docker-compose up`)
4. Review DevTools Network tab for API calls

### I'm Planning Development
1. Review phase breakdown in `PHASE_1_COMPLETE.md`
2. Check effort estimates in [../summaries/](../summaries/)
3. Plan sprint based on team size
4. Reference code patterns before starting

## Code Patterns Included

### Pattern 1: Fetch Data
```tsx
const { data, loading, error, fetch } = useStore();
useEffect(() => fetch(), []);
```

### Pattern 2: Create Data
```tsx
const { create, loading, error } = useStore();
await create({ title, description });
```

### Pattern 3: Filter & Search
```tsx
const { setFilter, setSearch, filtered } = useStore();
setFilter('status', 'NEW');
setSearch('housing');
```

### Pattern 4: Chat Integration
```tsx
const { messages, sendMessage, loading } = useBbChatStore();
await sendMessage('Help me with housing');
```

### Pattern 5: Admin Bulk Actions
```tsx
const { selectedCases, bulkEnrich, toggleSelection } = useAdminStore();
toggleSelection(caseId);
await bulkEnrich();
```

## Store Reference

### useAuthStore
- `login(email, password)` - Authenticate user
- `logout()` - Sign out
- `isAuthenticated()` - Check auth status

### useCaseStore
- `fetchCases()` - Load user's cases
- `createCase(data)` - Create new case
- `enrichCase(caseId)` - Trigger AI enrichment
- `routeCase(caseId, resourceId)` - Allocate resource
- `setStatusFilter(status)` - Filter by status
- `setSearchQuery(query)` - Search cases

### useResourceStore
- `fetchResources()` - Load resources
- `filterByCategory(category)` - Filter resources
- `toggleAvailableOnly()` - Show only available
- `setSearchQuery(query)` - Search resources

### useBbChatStore
- `sendMessage(text)` - Send chat message
- `clearHistory()` - Reset conversation
- `initializeSession(userId)` - Start new session

### useAdminStore
- `fetchAllCases()` - Load all cases
- `toggleCaseSelection(caseId)` - Select/deselect case
- `bulkEnrich()` - Enrich selected cases
- `bulkRoute(resourceMap)` - Route multiple cases

### useUIStore
- `toggleSidebar()` - Toggle sidebar
- `setDarkMode(enabled)` - Toggle theme
- `addNotification(message, type, duration)` - Show toast

## API Services Reference

### authService
```typescript
login(email: string, password: string): Promise<LoginResponse>
logout(): Promise<void>
getCurrentUser(): Promise<User | null>
```

### caseService
```typescript
getCases(): Promise<Case[]>
getCaseById(caseId: string): Promise<Case>
createCase(data: CaseInput): Promise<Case>
enrichCase(caseId: string): Promise<RiskAssessment>
routeCase(caseId: string, resourceId: string): Promise<Case>
bulkEnrich(caseIds: string[]): Promise<RiskAssessment[]>
bulkRoute(routingPlan: RoutingItem[]): Promise<Case[]>
```

### resourceService
```typescript
getResources(filters?: ResourceFilters): Promise<Resource[]>
getResourceById(resourceId: string): Promise<Resource>
createResource(data: ResourceInput): Promise<Resource>
updateCapacity(resourceId: string, newCapacity: number): Promise<Resource>
getAvailableResources(): Promise<Resource[]>
```

### bbService
```typescript
sendMessage(request: ChatRequest): Promise<ChatResponse>
getIntroduction(userId: string): Promise<BbChatMessage>
analyzeForm(formHtml: string): Promise<FormAnalysisResult>
autoFillForm(formId: string, data: Record): Promise<FormAnalysisResult>
trackApplication(agencyName: string, appData: Record): Promise<ApplicationTrackingRecord>
getApplicationStatus(trackingId: string): Promise<ApplicationTrackingRecord>
```

## Development Workflow

### 1. Create Component
```bash
# Create new feature component
mkdir -p src/components/MyFeature
touch src/components/MyFeature/MyFeature.tsx
```

### 2. Import Store
```tsx
import { useCaseStore } from '@/stores/caseStore';
```

### 3. Use Store Data
```tsx
const { cases, loading, fetchCases } = useCaseStore();
useEffect(() => fetchCases(), []);
```

### 4. Render & Interact
```tsx
{cases.map(c => <CaseCard key={c.id} case={c} />)}
```

### 5. Handle Errors
```tsx
{error && <ErrorAlert message={error} />}
```

## File Structure

```
src/
├─ lib/
│  ├─ api.ts                  (Base HTTP client)
│  └─ services/
│     ├─ authService.ts
│     ├─ caseService.ts
│     ├─ resourceService.ts
│     └─ bbService.ts
├─ stores/
│  ├─ index.ts               (Auth & UI stores)
│  ├─ caseStore.ts
│  ├─ resourceStore.ts
│  ├─ bbChatStore.ts
│  └─ adminStore.ts
├─ pages/
│  ├─ Login.tsx
│  ├─ Dashboard.tsx
│  └─ Admin.tsx
├─ components/
│  └─ [Your components here]
└─ App.tsx
```

## Common Tasks

### Add Loading Spinner
```tsx
{loading && <div className="spinner">Loading...</div>}
```

### Add Error Alert
```tsx
{error && (
  <div className="alert error">
    {error}
    <button onClick={clearError}>Dismiss</button>
  </div>
)}
```

### Add Form Submission
```tsx
const { createCase, loading } = useCaseStore();

async function handleSubmit(e) {
  e.preventDefault();
  await createCase(formData);
}
```

### Add Filter
```tsx
const { setStatusFilter, filteredCases } = useCaseStore();

<select onChange={e => setStatusFilter(e.target.value)}>
  <option value="ALL">All</option>
  <option value="NEW">New</option>
  <option value="ENRICHED">Enriched</option>
</select>

<div>{filteredCases.length} cases found</div>
```

## Troubleshooting

### "Module not found" - useStore
```bash
npm install
```

### API calls return 401
- Verify backend is running: `docker-compose up`
- Check `.env.local` has `VITE_API_URL=http://localhost:4000`
- Verify login was successful

### Store state not updating
- Check Redux DevTools (browser extension)
- Verify action was called
- Check network tab for API call

### TypeScript errors
```bash
npm run build
```

Fix any errors shown.

## Performance Tips

- ✅ Use `useEffect` dependencies correctly to avoid infinite loops
- ✅ Use `const { data } = store` to destructure only needed data
- ✅ Memoize callbacks with `useCallback` if passed to children
- ✅ Use `useMemo` for expensive calculations
- ✅ Lazy load heavy components

## Testing

### Manual Testing
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (login, create case, etc.)
4. Verify API call made to correct endpoint
5. Check response body

### Store Testing
```tsx
import { useCaseStore } from '@/stores/caseStore';

// Get store state
const state = useCaseStore.getState();
console.log(state.cases);

// Call action directly
await useCaseStore.getState().fetchCases();
```

## Next Steps

1. **Try It Out:** Follow pattern examples
2. **Build a Component:** Start with user dashboard
3. **Test API Calls:** Use DevTools Network tab
4. **Deploy:** When ready, follow deployment guide

## Related Resources

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [summaries/](../summaries/) - Project status
- [README.md](README.md) - Guide overview

---

**Last Updated:** January 2025  
**Maintained By:** Pathway Development Team
