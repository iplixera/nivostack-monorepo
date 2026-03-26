# NivoStack Studio — UI/UX + IA + Functional Spec (Agent Brief v5)
_Last updated: 2026-01-24_

This revision consolidates prior feedback and adds:
- **Route map**
- **App shell + component breakdown**
- **URL state model (shareable filters)**
- **Data contracts + endpoint responsibilities**
- **Acceptance criteria**

---

## 0) Goal and non-negotiables

### Goal
Deliver a coherent Studio experience where:
- Users understand **where they are** (Projects vs Project vs Module).
- Filters **always work**, are **shareable**, and are **data-driven**.
- UI theme is consistent (no arbitrary black/red).

### Non‑negotiables
1) **No hard-coded filter options** (env/type/category/brand/language).  
2) **No hard-coded badges/counts**.  
3) **All major filters reflected in URL query params**.  
4) **Red is reserved** for destructive actions and error states only.  
5) **One navigation truth**:  
   - Top bar = global/account actions  
   - Left sidebar = project modules  

---

## 1) Information architecture (IA) and user journey

### 1.1 User journey
1) **Projects (global)** → pick a project  
2) **Project dashboard (overview)** → health + trends  
3) **Drilldown / Inspect** → raw events, filters applied  
4) **Module deep dive** → devices/traces/logs/sessions/crashes/screen flow  
5) **Configure** → module settings or project settings  
6) **Billing/Account** → user menu (global)

### 1.2 Navigation layers
- **Top bar (global)**: logo, breadcrumb/project selector, theme, notifications, user menu.
- **Left sidebar (project)**: modules only.
- **Page tabs (module local)**: e.g., Devices: List | Settings; Dashboard: Overview | Inspect.

No additional nav layer should be introduced.

---

## 2) Theme + visual system rules

### 2.1 Token-based palette (light theme)
- **Background**: light neutral
- **Surface**: white
- **Border**: light gray
- **Text**: near-black
- **Muted text**: medium gray
- **Primary**: blue
- **Primary subtle**: pale blue background
- **Success**: green
- **Warning**: amber
- **Danger**: red

### 2.2 Hard rules
- **No black/dark cards** in light theme for normal states.
- **No red** for neutral values (e.g., “0 crashes”).
- “Disabled” configuration ≠ danger. Style it neutral.

### 2.3 Status/metric color rules
- **0 crashes** => neutral gray  
- **crashes > 0** => danger  
- **quota near limit** => warning  
- **quota exceeded / blocked** => danger  
- **healthy** => success, but used sparingly (small badge)

---

## 3) App routes (route map)

> Use this as the canonical routing structure.

### 3.1 Global routes (outside project context)
- `/projects`  
  - Projects list + usage summary + “New Project”
- `/projects/new` (optional)  
  - Create project wizard

### 3.2 Project routes (inside a project context)
All project routes share:
- AppShell
- TopBar (global)
- Sidebar (project modules)

#### Dashboard
- `/projects/:projectId/dashboard`  
  - Default: `mode=overview`

#### Devices
- `/projects/:projectId/devices`
- `/projects/:projectId/devices/settings`

#### Traces
- `/projects/:projectId/traces`
- `/projects/:projectId/traces/settings`

#### Logs
- `/projects/:projectId/logs`
- `/projects/:projectId/logs/settings`

#### Sessions
- `/projects/:projectId/sessions`
- `/projects/:projectId/sessions/settings`

#### Crashes
- `/projects/:projectId/crashes`
- `/projects/:projectId/crashes/settings`

#### Screen flow
- `/projects/:projectId/screen-flow`
- `/projects/:projectId/screen-flow/settings`

#### Build
- `/projects/:projectId/business-configuration`
- `/projects/:projectId/localization`

#### APIs
- `/projects/:projectId/api-config`
- `/projects/:projectId/api-mocking`

#### Project settings
- `/projects/:projectId/settings`
  - Tabs:
    - Notifications
    - Product Features (SDK enable + feature toggles)
    - SDK Settings (batching/log levels/etc)
    - Data Cleanup (danger zone for bulk delete)
    - Project Settings (name, api key, delete project)

### 3.3 Global account routes (from user menu)
- `/account/subscription`
- `/account/billing`
- `/account/invoices`
- `/account/usage`
- `/account/profile`
- `/docs` (or `/documentation`)
- `/team`

---

## 4) URL state model (filters + shareable views)

### 4.1 Universal query params (applies to most data pages)
- `env` — environment name (string). Example: `production`, `staging`.
- `range` — time range preset: `15m | 1h | 24h | 7d | 30d`
- `from`, `to` — optional absolute timestamps (ISO), override `range` when present.
- `q` — free text search.

**Rule:** If `from` and `to` exist, ignore `range` preset.

### 4.2 Dashboard
`/projects/:projectId/dashboard?env=production&range=24h&mode=overview`

Additional:
- `mode` — `overview | inspect`
- `type` — for inspect mode only: `traces | logs | sessions | crashes`
- `auto` — `0 | 1` (inspect polling)
- `limit` — number of events displayed (e.g., 100)

### 4.3 Devices
`/projects/:projectId/devices?platform=ios&debug=0&brand=samsung&lang=en&from=...&to=...`

Recommended device-specific params:
- `platform` — `all | ios | android | web`
- `debug` — `all | 0 | 1`
- `category` — string (data-driven)
- `brand` — string (data-driven)
- `lang` — string (data-driven)
- `registeredFrom`, `registeredTo` — date range (device registration)

Pagination:
- `page` — 1-based page number
- `pageSize` — e.g., 25/50/100
- `sort` — `lastSeen:desc`, etc.

### 4.4 Traces/Logs/Sessions/Crashes lists
All should support:
- `status` (if applicable)
- `minDuration`, `maxDuration` (traces)
- `level` (logs)
- `deviceId`, `sessionId`, `userId`, `endpoint` (as dedicated filters for power users)

**Rule:** Keep `q` as the simple entry point, but allow structured filters for precision.

---

## 5) AppShell + component breakdown

### 5.1 Layout (AppShell)
**AppShell** renders:
- `TopBar`
- `Sidebar`
- `MainContent`

**TopBar responsibilities**
- Brand/logo (to `/projects`)
- Breadcrumb: `Projects / {ProjectName}` (Projects clickable)
- Theme toggle
- Notifications (only if real)
- User menu (account routes)

**Sidebar responsibilities**
- Project navigation only
- Grouped sections:
  - Overview
  - Observe (rename from “Debug” unless product is strictly debugging)
  - Build
  - APIs
  - Settings
- Active state: primary blue + subtle background
- Optional badges: only if accurate and cheap to compute

**MainContent responsibilities**
- Page header: title + short description (compact)
- Page controls (FilterBar)
- Page content (cards, charts, tables)
- Empty states / error states

### 5.2 Shared components
- **FilterBar**
  - Renders standard controls depending on page type:
    - `EnvSelect`
    - `TimeRangeSelect`
    - `SearchInput`
    - Optional structured filters (chips)
  - Writes to URL (debounced)
  - Triggers data refresh

- **Tabs**
  - Used for module sub-pages (List | Settings)

- **KpiCard**
  - Clickable when it drills down (Dashboard)
  - Shows label, value, delta, optional status badge

- **DataTable**
  - Server-driven pagination
  - Column config per event type
  - Row click opens details

- **Banner**
  - `info | warning | danger`
  - Dismissible unless it blocks the user action

- **EmptyState**
  - Purpose-based copy:
    - “No events for current filters”
    - “SDK disabled”
    - “Quota exceeded”

---

## 6) Data model + endpoint responsibilities (logic, not UI)

### 6.1 Principles
- UI never guesses. UI requests data for the exact filters.
- The backend returns:
  - data rows
  - aggregates for KPIs
  - distinct filter values (or top values)

### 6.2 Required endpoints (minimum)

#### Projects
- `GET /api/projects`
  - returns: list of projects with role (owned/viewer), and lightweight stats
  - stats must specify scope: last_24h or all_time

- `GET /api/projects/usage`
  - returns: quota usage, limits

#### Environments (data-driven)
- `GET /api/projects/:projectId/environments`
  - returns: list of envs actually present in data

#### Dashboard aggregates
- `GET /api/projects/:projectId/dashboard/overview?env&from&to`
  - returns:
    - kpis: activeDevices, sessions, apiRequests, crashFreePct
    - timeseries: requests/errors buckets
    - topIssues: list with counts and primary type (trace/log/crash)

#### Inspect stream (dashboard)
- `GET /api/projects/:projectId/events?type&env&from&to&q&limit`
  - returns: rows + cursor (optional)

#### Devices list
- `GET /api/projects/:projectId/devices?filters...&page&pageSize&sort`
  - returns: rows + pagination
- `GET /api/projects/:projectId/devices/stats?env&from&to`
  - returns: totals for device tiles
- `GET /api/projects/:projectId/devices/filters?env&from&to`
  - returns: distinct values: brands, languages, categories

#### Module lists (traces/logs/sessions/crashes)
- `GET /api/projects/:projectId/{module}?filters...&page&pageSize&sort`
- `GET /api/projects/:projectId/{module}/stats?env&from&to`
- `GET /api/projects/:projectId/{module}/filters?env&from&to`

#### Settings
- `GET /api/projects/:projectId/settings`
- `PATCH /api/projects/:projectId/settings`
- Module settings:
  - `GET /api/projects/:projectId/{module}/settings`
  - `PATCH /api/projects/:projectId/{module}/settings`

#### Data cleanup (danger)
- `POST /api/projects/:projectId/cleanup` with action:
  - `deleteDevices | deleteTraces | deleteLogs | deleteSessions`
  - must require confirmation step in UI

---

## 7) Page specs (what to build, how it behaves)

## A) Projects page
### UI
- Header: “Projects”
- Usage bar (quota usage)
- Grid of project cards

### Card rules
- Show: project name, role, scoped stats (clearly labeled)
- 0 crashes is neutral, not red

### Interactions
- Click card → `/projects/:projectId/dashboard?mode=overview`
- “New Project” → wizard
- User menu accessible in top bar

---

## B) Dashboard (Overview | Inspect)
### Overview
Controls:
- Env select (data-driven)
- Range presets (15m/1h/24h/7d/30d)
- Optional absolute time selector (from/to)
- Mode tabs: Overview | Inspect

KPI cards:
- Clickable → takes user to module list with filters applied:
  - Active devices → `/devices?...`
  - Sessions → `/sessions?...`
  - API requests → `/traces?...`
  - Crash-free → `/crashes?...`

Time series:
- Click point → navigates to traces list filtered to that bucket/time window

Top issues:
- Click issue → navigates to raw view with signature filter applied

### Inspect
Controls:
- Search `q`
- Type dropdown: traces/logs/sessions/crashes
- Refresh (manual)
- Auto toggle: polling 3–5s
- Limit selector (e.g., 100/250)

Behavior:
- Query params update on change
- Data fetch uses params
- Column config changes per type (no meaningless columns)

---

## C) Devices (List | Settings)
### List tab
Sections:
1) Quota banner (warning/danger only)
2) Stat tiles (scoped)
3) Filters (compact; advanced in collapsible)
4) Table (server paginated)
5) Export (async job)

Filters:
- platform, debug, category, brand, language, registeredFrom/to
- all values data-driven

### Settings tab (visual fix)
Replace dark cards and red “Disabled” block with:
- light option cards
- selected: blue border + subtle blue background
- disabled: neutral; show muted note

Settings logic:
- Setting: `deviceIngestionMode`:
  - `all`
  - `debugOnly`
  - `disabled`
- “Current” value displayed at top
- PATCH updates immediately; show toast

---

## 8) “Too much space” remediation checklist
- Reduce top padding on page headers
- Reduce trial banner height and spacing
- Use max-width container
- Convert verbose filter blocks into:
  - row 1: key filters
  - row 2: advanced filters collapsible

---

## 9) “No hard-code” implementation requirements

### 9.1 Filter options
- env list from `/environments`
- category/brand/lang from `/filters`
- type list is product-supported list; still show even if empty results

### 9.2 Counts & badges
- Sidebar badges:
  - either real counts for current filters (expensive) → avoid
  - or show none
- If shown at all, clarify scope (24h) and keep minimal.

### 9.3 Error/empty states must be truthful
- If env has no data → “No data for this environment/time range”
- If SDK disabled → show state + CTA to enable
- If quota exceeded → show blocked message + upgrade CTA

---

## 10) Acceptance criteria (definition of done)

### Navigation
- Top bar global only; sidebar project only
- One consistent project context indicator (breadcrumb or selector)

### Theme
- No black cards in light theme (except code blocks)
- Red only for destructive/error
- 0 values not red

### Functionality
- Every filter updates URL
- Every URL state restores UI controls
- All filters affect API requests
- Dashboard drilldown works

### Performance
- Server pagination for big lists
- Debounced search
- Caching for filter lists per (project, env, range)

---

## 11) Implementation notes (practical)

### Recommended client architecture
- A single `useQueryState()` hook for reading/writing URL params
- A `buildQuery()` function per module:
  - validates params
  - sets defaults
  - normalizes from/to vs range
- A `useData()` hook per module that consumes normalized query

### Recommended conventions
- Keep query param names identical across modules where possible.
- Keep time handling consistent (UTC or project timezone, but pick one).

---

## 12) Quick punch list (what to fix first)
1) Remove black pills/cards; normalize theme tokens  
2) Fix red misuse (0 crashes, disabled settings)  
3) Implement URL-driven filters + data fetch wiring (Dashboard + Devices first)  
4) Reduce whitespace (header + filter blocks)  
5) Ensure drilldowns from Dashboard actually navigate with filters  

---
