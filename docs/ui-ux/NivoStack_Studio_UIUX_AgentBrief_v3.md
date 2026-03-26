# NivoStack Studio — UI/UX + Behavior Brief (v3)
Audience: Implementation agent (Claude/Cursor).  
Scope: **Dashboard** and **Devices** pages, plus **global menus** and **settings placement rules**.  
Non-goal: Do not discuss code, APIs, or DB schema in this document. Implement using existing project structure.

---

## 0) Outcome we are targeting
We are building a monitoring/observability console. The UI must support **two different user intents**:

1) **Overview / Trend monitoring (Aggregated)**  
   - “Is the system healthy?”  
   - Needs **KPIs + charts + top issues + drilldowns**.

2) **Investigation (Raw rows)**  
   - “Show me the evidence now.”  
   - Needs **raw event streams + fast filters + row detail view**.

**Hard rule:** Aggregated and Raw are different modes. Do not blend them into one cluttered view.

---

## 1) Global UI standards (apply to ALL pages)
### 1.1 Layout / spacing
- Use a **wider content max-width** than the current centered narrow layout.  
  - Monitoring UIs need room for charts/tables.  
- Reduce “dead space” on the right by using responsive grid:
  - Up to ~1440–1600px content width is acceptable on desktop.
- Avoid stacking tall banners at the top that push content down.

### 1.2 Information hierarchy
- Each page must have a clear structure in this order:
  1. Page title + concise description (optional)
  2. Primary controls (time range, environment, mode switch)
  3. Primary content (charts/tables)
  4. Secondary content (issues lists, optional panels)

### 1.3 Controls consolidation (no duplicates)
- Do not duplicate controls in multiple places.
  - Example: time range should be **one** control, not a dropdown + repeated chips.
- Use one **segmented control** for major mode switching (e.g., Overview | Inspect).

### 1.4 Filtering standard
- Show **3–4 primary filters inline**.  
- Everything else goes into **More Filters** (drawer/popover) with:
  - Apply, Reset, and clear defaults
- Always render **Active Filter Chips** below the filter bar:
  - Each chip removable
  - “Clear all” available when chips exist

### 1.5 Tables and drilldowns
- Any raw list must be:
  - sortable where relevant
  - paginated or virtualized
  - supports row click → **details drawer** (right-side panel)
- Drilldowns must preserve context:
  - Clicking a dashboard widget must open the destination page with **filters pre-applied**.

### 1.6 Empty states, low data, and “absurd metrics”
- If the denominator is 0 (e.g., sessions=0) show “—” not 0% or 100%.
- If sample size is low, show **Low data** badge and tooltips.
- Don’t render contradictory-looking KPIs unless they’re valid and explained.

---

## 2) Navigation + Menus (Global restructuring rules)
We currently have:
- Top bar (project selector + theme + notifications + user menu)
- Left side nav (product sections)
- Per-page tabs (e.g., Devices: List | Settings)

### 2.1 Top bar (global)
Top bar is for:
- **Project selector**
- **Global time range** (optional; if used, it must sync across pages)
- Theme toggle
- Notifications
- User menu (account/billing/profile)

**Do not put page-specific actions here** (e.g., Export Devices).

### 2.2 Left nav (product navigation)
Left nav is for primary modules. Keep it stable:
- Overview
  - Dashboard
- Debug / Runtime
  - Devices
  - API Traces
  - Sessions
  - Logs
  - Crashes
  - Screen Flow (if it belongs here)
- Content
  - Business Configuration
  - Localization
- APIs
  - API Config
  - API Mocking
- Monitoring (if separate from Dashboard)
- Cost Analysis
- Settings
  - Project Settings (and possibly “Workspace/Org Settings” if applicable)

**Rule:** Do not scatter “Settings” across random places. Make it discoverable.

### 2.3 User menu (account-level)
User menu should contain only account/workspace items:
- Subscription / Billing / Invoices / Usage
- Profile settings
- Workspace/Org settings (if exists)
- Developer guide / Setup instructions
- Team management
- Logout

**Rule:** Project-level settings must NOT live inside user menu.

### 2.4 Settings placement rules (critical)
We have two categories of settings:

1) **Project-level settings** (applies to the project as a whole)  
   → goes under **Settings → Project Settings** (left nav)

2) **Module/page-level settings** (only affects that module)  
   → goes as a **secondary tab** inside that module:
   - Devices: List | Settings
   - API Traces: Traces | Settings
   - Logs: Logs | Settings
   - Sessions: Sessions | Settings
   - Crashes: Crashes | Settings

**Rule:** Do not create inconsistent patterns (some pages have settings tab, others don’t).  
**Rule:** Avoid multiple “Settings” entry points for the same thing.

---

## 3) Dashboard (Overview vs Inspect) — Required implementation
### 3.1 Single mode switch (no redundancy)
Use ONE segmented control:
- **Overview** (Aggregated)
- **Inspect** (Raw)

Remove any duplicate “Aggregated for trends / Raw for investigation” toggles.

### 3.2 Global controls (top of dashboard)
Top row controls (consistent across Overview and Inspect):
- Environment selector (e.g., Production/Staging/Dev)
- Time range (single control)
- Optional: Segment selector (if required)
- Optional: Saved Views (if implemented)

Below that, show Active Filter Chips (if any).

### 3.3 Overview mode (Aggregated) layout
Must include:
1) KPI row:  
   - Active devices (time window)
   - Sessions (time window)
   - API requests/traces (time window)
   - Crash-free sessions or crash rate (time window; guarded against 0)
   - Optional latency KPI (P95)

2) Charts section (left 2/3):
   - Requests + Errors over time (time series)
   - Must support hover values and click-to-drilldown
   - Chart header must allow metric switching (Requests/Errors/Latency)

3) Top Issues (right 1/3):
   - List of top issues (HTTP errors, crash groups, slow endpoints)
   - Each item has “Open” and drills into the relevant module with filters applied

**Rule:** Do not replace charts with raw tables in Overview.

### 3.4 Inspect mode (Raw) layout
Inspect is an investigation view:
- A stream/table of raw events (traces/logs/sessions/crashes depending on “Type” filter)
- Filters:
  - Quick search (deviceId/sessionId/userId/endpoint)
  - Type selector (Traces / Logs / Crashes / Sessions)
  - Sampling toggle (with clear indicator of effective sampling)
  - Refresh / Auto-refresh controls
- Right-side row details drawer:
  - Clicking a row opens full payload (headers/body/metadata as available)
- “Pinned device”:
  - Pinning must create a filter chip
  - Persistent until removed

**Rule:** Inspect is not a second dashboard. It’s a live investigation console.

---

## 4) Devices — Required implementation
Devices needs to feel like a **registry** (competitor standard: table-first).

### 4.1 Devices tabs
- **Device List**
- **Settings**

### 4.2 Device List layout
Order:
1) Compact quota alert (only if needed) + CTA  
   - Must not be excessively tall.
2) Actions row:
   - Export Devices (secondary action, right side)
3) KPI row (semantics must be clear):
   - Totals: Total devices (lifetime)
   - Activity: Active (24h/7d), New (24h/7d) — if available
   - Breakdown: iOS / Android / Web
   - Debug: Debug-enabled count
   **Do not** show vague “This Month” without saying what metric it applies to.
4) Filter bar:
   - Inline: Search, Platform, Debug, Time range (for activity-based metrics, if used)
   - More Filters: brand, language, registered date range, category, etc.
   - Active filter chips below
5) Devices table:
   Columns (example; adjust to what exists):
   - Device (label + deviceId)
   - Platform
   - App version
   - OS
   - Model
   - Environment
   - Debug
   - Last seen
   - Actions (View details)
   Table must support sorting on Last seen and Platform.

6) Row details drawer:
   - Device metadata, last activity, tags, linked traces/logs/crashes shortcuts
   - “View in Traces/Logs/Crashes” opens those pages with device filter applied

### 4.3 Devices Settings tab (module-level)
Keep it small and explicit. Examples:
- Device tracking scope (All / Debug-only / Disabled)
- Any device retention or sampling (if applicable)
- Any debug mode management policies (if relevant)

**Rule:** Do not mix list filters with settings.

---

## 5) Project Settings screen — Required improvements
Project settings must be project-scoped only:
- Project name
- API key (copy)
- Delete project (danger zone)

### 5.1 UX improvements
- Reduce vertical whitespace; use compact cards
- Danger zone should be last and visually separated
- API key card: show masked by default + reveal + copy

**Rule:** Do not put “runtime module settings” inside Project Settings.

---

## 6) Acceptance checklist (agent must self-verify)
Before marking done, verify:

### Dashboard
- [ ] Only one mode switch (Overview | Inspect)
- [ ] Only one time range control
- [ ] Overview contains charts + KPIs + top issues (no raw tables)
- [ ] Inspect has raw table + row details drawer + filters + chips
- [ ] Drilldowns preserve filters/context

### Devices
- [ ] Devices list is table-first with sortable columns
- [ ] KPIs grouped by meaning (Totals/Activity/Breakdown/Debug)
- [ ] Filters are 3–4 inline + More Filters + chips
- [ ] Settings tab exists and contains only module settings

### Menus/Settings
- [ ] User menu only account/workspace items
- [ ] Project settings live under left nav Settings → Project Settings
- [ ] Module settings live inside module tabs (List | Settings pattern)
- [ ] No duplicate “Settings” entry points for the same configuration

---

## 7) Implementation guidance (behavior)
- Do not “copy screenshot layout” blindly.
- Implement based on **intent**:
  - Overview = aggregated trends + drilldowns
  - Inspect = investigation stream + details
  - Devices = registry table + device drilldowns
- Prefer consistency across modules; any deviation must be justified by the module’s nature.

