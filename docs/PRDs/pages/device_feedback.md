# device_feedback.md — Devices Management (NivoStack Studio)

Owner: Karim  
Audience: Cursor (implementation)  
Scope: **Devices Management page** (Studio dashboard) — UI/UX refactor + correct use of **raw rows vs aggregated** data + competitive parity gaps.

---

## 0) What this document is (and what it is not)

**This is not a “new app redesign” that breaks current behavior.**  
This is a **refactor**: keep all existing functionality and data flows, but present them consistently with the new layout, and fix the logic around **Aggregated vs Raw-row** data.

Deliverable outcome:
- Devices page supports **fast debugging** (raw row list, realtime updates) **and** **business insights** (aggregated metrics and breakdowns).
- UI stays consistent with your new shell/theme and works with current schema; if missing data is required, add it cleanly and backfill demo seed data.

---

## 1) Confirmed product logic: Aggregation vs Raw-row

### 1.1 Core principle
NivoStack has **two data products** that must co-exist:

1) **Raw-row data** (debugging):
- Per-device, per-event, per-session records.
- Used for “what happened on this device right now?”
- Required for **devices with Debug enabled** and for realtime follow-up.

2) **Aggregated data** (dashboards):
- Rollups across devices/time (counts, uniques, percentiles, trends).
- Used for “what is happening overall?” and plan limits/usage visibility.

**Important:** Aggregation must never replace raw rows.  
Aggregation is a **layer on top** of raw data, not a separate mode that hides the list.

### 1.2 Devices page rule
Devices page must always show:
- **(A) Aggregated summary** at top (cards + breakdown)
- **(B) Raw devices table** below (search/filter + pagination)
- **(C) Device detail drawer** (per-row drill-in, includes realtime tail when Debug=On)

This avoids conflict: **insights** + **debugging** in one page.

---

## 2) What’s wrong in the current Cursor implementation (based on screenshot)

### 2.1 Visual/UX issues
- Top header shows “NicoStack” typo, brand mismatch; should be **NivoStack**.
- Devices page uses a large empty top area; the content hierarchy is unclear.
- The “Device Usage” bar is good but not integrated with plan limits and warnings.
- Filters exist but are not aligned or grouped logically (search + dropdowns + clear).
- Table is missing key operational columns (Last seen, App build, OS version, Environment, Debug state reason).
- Row actions are too limited (only “Debug” button). Missing: View, Tag, Block, Delete, Export, etc.
- No visible concept of “Aggregated breakdowns” (platform/app version/OS breakdown) that competitors usually show.

### 2.2 Logic issues (raw vs aggregation)
- Aggregations appear to be treated as a “replacement” for rows in some places in your broader implementation.
- Devices requires aggregated **counts/breakdowns**, but still must show the raw list always.
- Debug devices should support **realtime** (polling/WS) without forcing aggregation-heavy queries.

---

## 3) Target UX for Devices page (exact structure)

### 3.1 Page layout (top to bottom)

#### Section 1 — Page header
- Title: **Devices**
- Subtitle: “Device registry and debug management”
- Right actions:
  - **Export CSV** (respects filters)
  - **Bulk Actions** (disabled until selection)
  - **Add Test Device** (optional/dev-only; behind feature flag)

#### Section 2 — Plan usage + warnings (always visible)
Card row:
- **Devices usage**: `current / limit` + progress bar
- **Warnings:**
  - At **80%**: show a **yellow inline banner** directly below usage row: “Approaching device limit (80%). Consider upgrading.”
  - At **90%**: show an **orange/red banner**: “Critical: 90% of limit reached. New devices may be throttled.”
  - At **100%**: show **red banner** + disable “Register new devices” (if applicable) + explain behavior (throttle/drop).
Placement: banners appear **between usage row and filters** so they are seen before the table.

#### Section 3 — Aggregated cards + breakdown switcher
**KPI cards (clickable filter chips):**
- Total devices (unique)
- Active today (unique)
- Debug ON (unique)
- New last 24h (unique)
Optional (if data exists):
- Crashes last 24h (count)
- Sessions last 24h (count)

**Breakdown panel** (tabbed):
- Platform (iOS/Android/Web/Other)
- OS version distribution
- App version distribution
- Environment (prod/staging/dev)
- Region/Country (optional, if collected)

Behavior:
- Clicking a segment **adds a filter** (e.g., Platform=iOS) and scrolls to table.
- Provide “Reset breakdown filters” button next to “Clear” filters.

#### Section 4 — Filters (row)
Filters must be consistent and complete:
- Search input: placeholder “Search deviceId, userId, email, model…”
- Dropdowns:
  - Platform: All / iOS / Android / Web / Other
  - Debug: All / Debug ON / Debug OFF
  - Environment: All / prod / staging / dev (if available)
  - Time: Last seen All / 15m / 1h / 24h / 7d / 30d
  - App version (typeahead select)
  - OS version (typeahead select)
- Buttons:
  - Clear (resets all filters)
  - Save view (optional: saved filters)

#### Section 5 — Raw devices table
Table features:
- Pagination (server-side)
- Column sorting (server-side)
- Row selection for bulk actions
- Sticky header

**Recommended columns (in order):**
1. Checkbox
2. Device (deviceId + copy)
3. Platform (badge)
4. App Version
5. OS Version
6. Model
7. Environment (badge)
8. Last Seen (relative + exact on hover)
9. Debug (toggle state + who/when if available)
10. Actions (View / Debug / More)

Row click opens **Device detail drawer** (not a new route).
Actions menu includes:
- View details
- Enable/Disable Debug (with confirm + scope)
- Tag device (label)
- Block device (if supported)
- Delete device (danger confirm)
- Copy deviceId
- Copy userId (if exists)

#### Section 6 — Device detail drawer (right panel)
Tabs inside drawer:
- Overview (metadata, last seen, tags)
- Realtime (only if Debug=ON): live tail of logs/traces/sessions
- Recent sessions (last N)
- Recent logs (last N)
- Recent crashes (last N)
- Notes / Tags

Drawer includes quick toggles:
- Debug ON/OFF (with explanation + rate/retention impact)
- “Pin device” (saved list)

---

## 4) Aggregations required on Devices page (what to compute)

### 4.1 Aggregated KPIs (single query result)
- total_devices (unique deviceId) filtered by project + environment
- active_today_devices (unique deviceId seen in last 24h)
- debug_on_devices (unique deviceId where debug_enabled=true)
- new_devices_24h (unique deviceId first_seen in last 24h)

### 4.2 Breakdowns (group-bys)
- by_platform: counts per platform
- by_os_version: counts per OS version (top 8 + “Other”)
- by_app_version: counts per app version (top 8 + “Other”)
- by_environment: counts per env
Optional:
- by_country (if geoip or device locale captured)

### 4.3 Ensure filters apply consistently
All aggregations must respect:
- time range filter (where relevant)
- environment filter
- platform filter (if selected)
- app version / os version filters (if selected)

But do **not** filter aggregation KPIs by “search term” (unless you explicitly want “filtered metrics”).  
Recommended behavior:
- Show **global metrics** for current filters excluding search string.
- Search affects only the table results.

---

## 5) Raw devices list requirements (server-side)

### 5.1 Query contract
Devices list endpoint must support:
- page, pageSize
- sortBy, sortDir
- filters: platform, debug, environment, lastSeenRange, appVersion, osVersion
- search: deviceId/userId/email/model partial matching
Return:
- items[]
- total_count
- page_count
- cursor (optional)

### 5.2 Performance requirement
- Use indexed fields for filtering: (project_id, last_seen, platform, debug_enabled, app_version, os_version, environment)
- Avoid joining huge event tables for list view. Device table should be derived from **device_registry** table or a cached summary table.

---

## 6) Competitive parity: missing capabilities to add (Devices page)

Competitors (Datadog, Dynatrace, Sentry, Firebase-like tooling) typically provide:

1) **Device tagging**
- Add tags (key/value or label chips)
- Filter by tag
- Use tags for saved views

2) **Saved views**
- Saved filter presets per user/project

3) **Device health indicators**
- lastSeen + status: Online/Idle/Offline
  - Online: < 5 minutes
  - Idle: < 24 hours
  - Offline: >= 24 hours
- (Optional) last crash timestamp badge

4) **Device-level drill-in**
- One click -> drawer with last sessions/logs/crashes
- (Optional) “open in new tab” route for deep linking

5) **Realtime tail (debug ON only)**
- Polling every 2–3 seconds or websocket channel
- Only for selected device to keep cost controlled

6) **Bulk operations**
- Bulk tag
- Bulk debug enable/disable (with guard rails)
- Bulk export

---

## 7) Data model / schema checks (what may be missing)

Cursor already knows your schema. If any of these fields are missing, add them.

### 7.1 Device registry table (minimum required fields)
- device_id (string, unique per project)
- project_id
- platform (enum: ios/android/web/other)
- app_version (string)
- os_version (string)
- model (string)
- environment (string: prod/staging/dev)
- first_seen_at (timestamp)
- last_seen_at (timestamp)
- debug_enabled (bool)
- debug_enabled_at (timestamp, nullable)
- debug_enabled_by (user_id/email, nullable)
- tags (jsonb array or join table)
- user_id (nullable) + user_email (nullable)
Optional:
- country/region (derived)
- sdk_version

### 7.2 Aggregation tables (recommended for performance)
If you don’t have these, create them:
- device_daily_stats (project_id, date, platform, env, app_version, os_version, devices_unique, debug_on_unique)
Or compute on the fly with materialized views/caches.

### 7.3 Seed/demo data requirement
If you add new fields (tags, env, os/app version), also update seed scripts to populate realistic distribution:
- 60% Android, 35% iOS, 5% Web
- Mix of app versions (1.0.0–2.3.1)
- OS distribution (Android 12/13/14; iOS 16/17)
- last_seen spread (now, 1h, 1d, 7d)
- 5–10% debug enabled

---

## 8) API endpoints (reference design)

### 8.1 Aggregation summary
`GET /api/projects/:projectId/devices/summary`
Query params:
- environment
- platform
- appVersion
- osVersion
- timeRange (e.g., 24h, 7d)
Returns:
- kpis: totals
- breakdowns: by_platform, by_app_version, by_os_version, by_environment

### 8.2 Devices list
`GET /api/projects/:projectId/devices`
Query params:
- page, pageSize
- sortBy, sortDir
- search
- filters as above
Returns:
- items[] + total

### 8.3 Device detail
`GET /api/projects/:projectId/devices/:deviceId`
Returns:
- metadata + last session/crash/log pointers + tags

### 8.4 Realtime tail (debug only)
Option A (poll):
`GET /api/projects/:projectId/devices/:deviceId/tail?since=timestamp&type=logs|traces|sessions`
Option B (websocket):
`WS /ws/projects/:projectId/devices/:deviceId`

### 8.5 Actions
- `POST /devices/:deviceId/debug {enabled:true|false}`
- `POST /devices/:deviceId/tags {add:[...], remove:[...]}`
- `DELETE /devices/:deviceId`
- Bulk endpoints optional

---

## 9) UI implementation instructions for Cursor (non-negotiable)

### 9.1 Keep existing behavior
- Do not remove current endpoints or flows.
- Only refactor UI and wire to correct data sources.

### 9.2 Do not hard-code
- All KPI values, cards, breakdowns, filters must come from API.
- UI must gracefully handle empty states.

### 9.3 Consistency with global shell/theme
- Use the same top bar, left nav, spacing, typography, and component patterns as the global mockups.
- Ensure dark/light theme tokens are used; no magic colors.

### 9.4 Loading / error states
- Summary and table load independently.
- Skeletons for cards and table.
- Error banner appears inline (not a blocking toast).

### 9.5 Accessibility basics
- Focus states visible
- Keyboard navigation for filters and table
- Color contrast for badges/banners

---

## 10) Acceptance criteria (QA checklist)

1) Devices page renders with:
- Usage bar + 80/90/100% banners
- KPI cards + breakdown panel
- Filters row
- Table with pagination/sort

2) Clicking a breakdown segment applies filters and updates:
- table results
- summary KPIs (excluding search string)

3) Search affects only table (not KPIs), unless explicitly configured otherwise.

4) Row click opens device detail drawer:
- Shows metadata
- Shows last sessions/logs/crashes lists
- If debug ON, shows realtime tail updates

5) Debug toggle:
- Updates state immediately (optimistic UI with rollback)
- Shows who/when enabled if available

6) Performance:
- Table loads fast even with large datasets (server-side pagination)
- No heavy joins from events table for list view

---

## 11) Implementation sequence for Cursor (recommended)

1) **Refactor layout** to match structure (header → usage banners → summary → filters → table).
2) Add **devices summary API** (KPIs + breakdowns) and wire cards/breakdowns.
3) Expand **devices list API** (server-side filters/sort/search/pagination).
4) Add **device detail drawer** (metadata + recent lists).
5) Implement **realtime tail** (polling) for debug-enabled device.
6) Add **tags + saved views** (if not already present).
7) Add **bulk actions + export**.

---

## 12) Notes for plan caps / monetization (devices)
Devices page must clearly show plan pressure:
- Show limit at top
- Show warnings at 80/90%
- Show what upgrade unlocks (“+50k devices, longer retention, realtime tail at scale”)
This directly supports revenue from day 1.

---

## Appendix — Optional enhancements (phase 2)
- Device cohorts (groups)
- Alerting rules based on device health
- Heatmap of active devices by hour
- Device “timeline” combining session/log/crash events chronologically
