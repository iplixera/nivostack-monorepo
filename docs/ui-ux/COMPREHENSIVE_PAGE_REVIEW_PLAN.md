# Comprehensive Page Review & Fix Plan

## Status Overview

### ✅ Working Systems
- **Aggregation**: Queue running, 11 completed jobs, no failures
- **Workers**: Both aggregation-worker and data-seeder-worker running
- **APIs**: All 6 project APIs returning 200 (dashboard, devices, traces, logs, crashes, sessions)
- **Navigation**: Complete structure with all 8 sections per mockup
- **Routes**: All required pages exist in the file system

### ❌ Issues Reported
1. Sessions page: `sessionToken` undefined error (FIXED ✅)
2. Hard-coded filters on pages - not functional
3. Missing actions/interactions on buttons
4. Pages don't match mockup design
5. UI/UX inconsistencies with mockup
6. Need to verify aggregation logic on each page

---

## Page-by-Page Review Checklist

### 1. App Shell (Layout)
**Location**: `src/components/layout/AppShell.tsx`, `src/app/(dashboard)/layout.tsx`

**Review Against Mockup** (`docs/ui-ux/new-pages/00_app_shell_v2.html`):
- [ ] Sidebar width: 300px ✓
- [ ] Brand section with logo and name ✓
- [ ] Project switcher in sidebar (not topbar) ✓
- [ ] Navigation sections (8 sections) ✓
- [ ] Topbar sticky with project title
- [ ] Actions in topbar (data mode, env, theme toggle, primary action)
- [ ] Content padding: 18px
- [ ] Max content width: 1320px

**Actions to Fix**:
- Verify topbar actions match mockup
- Ensure project switcher is functional (not just display)
- Add proper branding (logo, "NicoStack Console")

---

### 2. Dashboard (Aggregated)
**Location**: `src/app/(dashboard)/projects/[id]/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/01_dashboard_aggregated.html`

**Current Status**:
- ✅ Data mode toggle implemented
- ✅ Stats API working
- ⚠️ Need to verify stat cards match mockup

**Review**:
- [ ] 6 main stat cards (devices, sessions, API requests, error rate, p95 latency, cost)
- [ ] Aggregated data mode showing rolled-up metrics
- [ ] Time range selector (24h, 7d, 30d, 90d)
- [ ] Charts/graphs for trends (if in mockup)
- [ ] "View Details" links to respective pages
- [ ] Filter bar with data mode dropdown

**Actions**:
- Verify stat card layout matches mockup
- Ensure time range filter is functional
- Add missing charts if required
- Test aggregation data vs raw data toggle

---

### 3. Devices (Raw)
**Location**: `src/app/(dashboard)/projects/[id]/devices/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/02_devices_raw.html`

**Current Status**:
- ✅ API working (200 response)
- ⚠️ Unknown filter/action state

**Review**:
- [ ] Search by device ID, email, or model
- [ ] Filter by platform (iOS, Android, All)
- [ ] Filter by debug mode status
- [ ] Sort by: lastSeenAt, createdAt, etc.
- [ ] Pagination (working, not hard-coded)
- [ ] Row actions: View details, Enable debug, Delete
- [ ] Debug mode toggle button (functional)
- [ ] Export/bulk actions

**Actions**:
- Make search input functional (not display-only)
- Wire up platform filter dropdown
- Wire up debug mode filter
- Implement sort functionality
- Test row actions (debug toggle, delete)
- Verify pagination works with real data

---

### 4. Sessions (Raw)
**Location**: `src/app/(dashboard)/projects/[id]/sessions/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/05_sessions_raw.html`

**Current Status**:
- ✅ API working (200 response)
- ✅ sessionToken undefined error fixed

**Review**:
- [ ] Search by session token or device
- [ ] Filter by platform
- [ ] Filter by duration range
- [ ] Sort by startedAt, duration, screenCount
- [ ] Pagination functional
- [ ] Row click → session details view
- [ ] Session duration formatting (HH:MM:SS)
- [ ] Error/crash indicators

**Actions**:
- Implement search functionality
- Wire up filters (platform, duration)
- Ensure sort works
- Test session detail drill-down
- Verify error indicators show correctly

---

### 5. API Traces (Raw)
**Location**: `src/app/(dashboard)/projects/[id]/traces/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/03_api_traces_raw.html`

**Current Status**:
- ✅ API working (200 response, stats disabled)

**Review**:
- [ ] Search by endpoint, device, or status
- [ ] Filter by HTTP method (GET, POST, etc.)
- [ ] Filter by status code range (2xx, 4xx, 5xx)
- [ ] Filter by duration (slow queries)
- [ ] Sort by timestamp, duration, status
- [ ] Pagination functional
- [ ] Row click → trace details (headers, body, response)
- [ ] Status code color coding
- [ ] Duration > threshold highlighted

**Actions**:
- Implement search
- Wire up method filter
- Wire up status code filter
- Add duration filter/threshold
- Test detail view
- Re-enable stats if needed (was temporarily disabled)

---

### 6. Logs (Raw)
**Location**: `src/app/(dashboard)/projects/[id]/logs/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/06_logs_raw.html`

**Current Status**:
- ✅ API working (200 response)

**Review**:
- [ ] Search by message content
- [ ] Filter by level (DEBUG, INFO, WARN, ERROR, FATAL)
- [ ] Filter by device/platform
- [ ] Sort by timestamp
- [ ] Pagination functional
- [ ] Row expand → full log message + metadata
- [ ] Level color coding (INFO=blue, WARN=orange, ERROR=red)
- [ ] JSON/structured log formatting

**Actions**:
- Implement message search
- Wire up level filter
- Ensure platform filter works
- Test log expansion
- Verify color coding for levels

---

### 7. Crashes (Aggregated → Raw)
**Location**: `src/app/(dashboard)/projects/[id]/crashes/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/07_crashes_agg.html`

**Current Status**:
- ✅ API working (200 response, stats disabled)

**Review**:
- [ ] Aggregated view: group by crash message
- [ ] Show crash count per group
- [ ] Show affected devices count
- [ ] Sort by frequency, last occurrence
- [ ] Click group → drill down to raw crash instances
- [ ] Raw view: individual crash events
- [ ] Stack trace display
- [ ] Device info per crash

**Actions**:
- Implement aggregation grouping
- Add drill-down functionality
- Test raw detail view
- Verify stack trace formatting
- Re-enable stats if needed

---

### 8. Screen Flow (Aggregated → Raw)
**Location**: `src/app/(dashboard)/projects/[id]/screenflow/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/08_screenflow_agg.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] Aggregated view: most common screen paths
- [ ] Flow diagram/visualization
- [ ] Filter by start screen
- [ ] Filter by time range
- [ ] Drill down to sessions with specific flow

**Actions**:
- Review current implementation
- Implement flow aggregation if missing
- Add visualization
- Test drill-down

---

### 9. Live Debug
**Location**: `src/app/(dashboard)/projects/[id]/live-debug/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/04_live_debug_live.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] Real-time log stream for debug-enabled devices
- [ ] Device selector
- [ ] Auto-scroll toggle
- [ ] Filter by log level
- [ ] Pause/resume streaming

**Actions**:
- Review WebSocket/polling implementation
- Test real-time updates
- Ensure debug mode toggling works

---

### 10. Business Configuration
**Location**: `src/app/(dashboard)/projects/[id]/business-config/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/11_business_config_control.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List all business config keys
- [ ] Search configs
- [ ] Add new config
- [ ] Edit existing config
- [ ] Delete config
- [ ] Config versioning/history
- [ ] Deployment status per environment

**Actions**:
- Review CRUD operations
- Ensure API endpoints exist
- Test add/edit/delete
- Verify deployment workflow

---

### 11. Localization
**Location**: `src/app/(dashboard)/projects/[id]/localization/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/12_localization_control.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List languages
- [ ] List translation keys per language
- [ ] Add new language
- [ ] Add new key
- [ ] Edit translations
- [ ] Delete keys/languages
- [ ] Translation coverage percentage
- [ ] Import/export CSV

**Actions**:
- Review CRUD operations
- Ensure API endpoints exist
- Test translation editing
- Verify import/export

---

### 12. Builds
**Location**: `src/app/(dashboard)/projects/[id]/builds/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/13_builds_release.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List all builds (version, platform, date)
- [ ] Upload new build
- [ ] Mark build as production/staging
- [ ] Download build
- [ ] Delete build
- [ ] Build metadata (size, changelog, etc.)

**Actions**:
- Review build upload flow
- Ensure file storage works
- Test build management

---

### 13. API Config
**Location**: `src/app/(dashboard)/projects/[id]/api-config/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/15_api_config_control.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List API endpoints being monitored
- [ ] Add new endpoint config
- [ ] Edit endpoint config (cost, threshold, etc.)
- [ ] Delete endpoint
- [ ] Cost calculation settings

**Actions**:
- Review API config CRUD
- Ensure cost tracking is functional
- Test endpoint configuration

---

### 14. API Mocking
**Location**: `src/app/(dashboard)/projects/[id]/mocks/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/16_mocking_dev.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List mock endpoints
- [ ] Add new mock
- [ ] Edit mock response
- [ ] Enable/disable mocks
- [ ] Mock scenarios (success, error, delay)
- [ ] Test mock in SDK

**Actions**:
- Review mocking implementation
- Ensure mock toggle works
- Test mock responses

---

### 15. Alerts
**Location**: `src/app/(dashboard)/projects/[id]/alerts/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/09_alerts_ops.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List alert rules
- [ ] Add new alert rule
- [ ] Edit rule (condition, threshold, channel)
- [ ] Delete rule
- [ ] Alert history/log
- [ ] Test alert sending

**Actions**:
- Review alert CRUD
- Ensure alerting works
- Test notification channels

---

### 16. SDK Settings
**Location**: `src/app/(dashboard)/projects/[id]/sdk-settings/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/14_sdk_settings_dev.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] SDK keys display
- [ ] Regenerate API key
- [ ] SDK configuration (endpoints, features)
- [ ] SDK version tracking
- [ ] Download SDK snippets

**Actions**:
- Review SDK key management
- Ensure key regeneration works
- Test configuration updates

---

### 17. Files
**Location**: `src/app/(dashboard)/projects/[id]/files/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/20_files_uploads.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List uploaded files
- [ ] Upload new file
- [ ] Download file
- [ ] Delete file
- [ ] File metadata (size, type, date)
- [ ] Search files

**Actions**:
- Review file upload flow
- Ensure file storage works
- Test download/delete

---

### 18. Project Settings
**Location**: `src/app/(dashboard)/projects/[id]/settings/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/18_project_settings_org.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] Project name edit
- [ ] Project description
- [ ] Environment settings (prod, staging, dev)
- [ ] Danger zone (delete project)

**Actions**:
- Review settings form
- Ensure save works
- Test project deletion

---

### 19. Team & Access
**Location**: `src/app/(dashboard)/team/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/17_team_access_org.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List team members
- [ ] Invite new member
- [ ] Change member role
- [ ] Remove member
- [ ] Pending invitations list

**Actions**:
- Review team management
- Ensure invite flow works
- Test role changes

---

### 20. Billing & Quotas
**Location**: `src/app/(dashboard)/billing/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/10_billing_org.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] Current plan display
- [ ] Usage stats vs quota
- [ ] Upgrade/downgrade plan
- [ ] Billing history
- [ ] Payment method management

**Actions**:
- Review billing integration
- Ensure plan changes work
- Test payment flow

---

### 21. Notifications
**Location**: `src/app/(dashboard)/projects/[id]/notifications/page.tsx`
**Mockup**: `docs/ui-ux/new-pages/19_notifications_org.html`

**Current Status**:
- ⚠️ Unknown - need to review

**Review**:
- [ ] List notifications
- [ ] Mark as read
- [ ] Filter by type
- [ ] Notification preferences

**Actions**:
- Review notification list
- Ensure mark-as-read works
- Test preferences

---

## Critical Fixes Required

### High Priority (Break functionality)
1. **Filters**: All filter dropdowns must be functional, not display-only
2. **Search**: All search inputs must filter data, not just display
3. **Pagination**: Must work with actual data, not hard-coded pages
4. **Row Actions**: Click events, buttons must have real handlers
5. **Data Mode Toggle**: Must actually switch between aggregated/raw data

### Medium Priority (UX issues)
6. **Loading States**: Add spinners/skeletons for async data
7. **Error Handling**: Show user-friendly errors when APIs fail
8. **Empty States**: Show helpful messages when no data exists
9. **Validation**: Form inputs need proper validation
10. **Confirmations**: Destructive actions need confirmation modals

### Low Priority (Polish)
11. **Animations**: Smooth transitions for state changes
12. **Accessibility**: ARIA labels, keyboard navigation
13. **Responsive**: Mobile-friendly layouts
14. **Dark Mode**: Ensure all components work in both themes
15. **Performance**: Optimize re-renders, lazy load heavy components

---

## Testing Checklist

For each page, test:
- [ ] Load with real data
- [ ] Load with empty data
- [ ] Load with error from API
- [ ] Search/filter/sort functionality
- [ ] Pagination (first, last, middle pages)
- [ ] Row actions (edit, delete, view)
- [ ] Form submission (if applicable)
- [ ] Responsive on mobile/tablet
- [ ] Dark mode toggle
- [ ] Browser back/forward navigation

---

## Implementation Strategy

### Phase 1: Core Functionality (Immediate)
1. Fix all broken filters and searches
2. Wire up all button actions
3. Ensure pagination works with real data
4. Test all APIs return proper data

### Phase 2: Data Integrity (Week 1)
1. Verify aggregation logic on each page
2. Test data mode toggles
3. Ensure real-time features work (live debug)
4. Validate CRUD operations on all control plane pages

### Phase 3: Polish & UX (Week 2)
1. Add loading states everywhere
2. Improve error handling
3. Add empty states
4. Implement confirmations for destructive actions

### Phase 4: Review & Testing (Week 3)
1. Compare every page against mockup
2. Test all user flows end-to-end
3. Performance testing
4. Accessibility audit

---

## Notes
- All pages exist in the file system ✅
- All APIs return 200 ✅
- Aggregation system is working ✅
- Workers are running ✅
- Navigation structure is complete ✅
- Main issue: **UI/UX implementation incomplete, filters/actions not wired up**

---

## Next Steps
1. Review this document with the team
2. Prioritize fixes based on user impact
3. Create GitHub issues for each page review
4. Assign owners for each section
5. Set timeline for Phase 1 completion

