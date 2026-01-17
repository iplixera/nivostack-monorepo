# NivoStack Studio — Cursor Refactor Instructions (UI/UX + Functional Behavior)
**Scope:** App Shell + Projects + Dashboard + Devices (screens shared in chat).  
**Goal:** Keep current product functions intact while refactoring UI and fixing broken behavior. No new hard-coded UI. Everything must be driven by the existing data model and query logic (Cursor already knows the schema).

---

## 1) Core Product Logic (Non‑Negotiable)
### 1.1 Raw vs Aggregated — how both must coexist
NivoStack has **two equally important experiences**:

**A) Raw (debug-first)**
- Purpose: debugging, per-device investigation, real-time-ish activity.
- UI: lists/tables of single rows (devices/logs/traces/crashes/sessions).
- Data: live row-level sources (e.g., last_seen, debug state, per-event rows).
- Latency: minimal; if delayed, show “last updated” timestamp.

**B) Aggregated (ops + dashboards)**
- Purpose: metrics, trends, health snapshots, distribution, top issues.
- UI: cards/tiles, charts, distributions, summaries.
- Data: pre-aggregated rollups (hourly/daily) are OK.
- Latency: acceptable (e.g., up to 60 minutes), but MUST be labeled.

**Rule:** Aggregated must **never replace** raw.  
**Rule:** Raw pages must remain the source of truth for “what happened” per device.  
**Rule:** Aggregation is additive: it enables dashboards and fast insights.

### 1.2 One filter contract must drive everything on a page
When a user applies filters (platform / env / debug / time range / os version / app version / search), the UI must ensure:
- Table results, card counts, and distributions **match the same filter context**.
- If aggregation cannot support a filter, the UI must **not lie**:
  - either disable that filter for aggregated widgets and show why, OR
  - compute widget counts from raw for that filter until aggregation supports it.

---

## 2) App Shell — UI/UX Expectations
### 2.1 Information architecture (consistent, predictable)
- Left nav should remain stable and represent core product areas:
  - **Overview:** Projects
  - **Project:** Dashboard, Devices, API Traces, Logs, Crashes, Sessions
  - **Config (if applicable):** Business Config, Localization, API Config, Mocking
  - **Org/Admin:** Team, Billing/Usage, Project settings (if role allows)

### 2.2 Global controls belong to the header (not scattered)
Top header should be the single place for:
- Project selector
- Environment selector (if global)
- Time range selector (if global for dashboard/analytics)
- Theme toggle (Light/Dark)
- User menu

Avoid putting “Mode / Env / Theme” in random page toolbars. Make them consistent.

### 2.3 Naming consistency
- Fix branding mismatch: “NicoStack” vs “NivoStack Studio” must be consistent across:
  - header title
  - login
  - sidebar
  - footer/help links

### 2.4 User menu grouping (reduce clutter)
Menu should be grouped (labels/sections) instead of one long list:
- **Billing:** Subscription, Billing, Invoices, Usage
- **Account:** Profile settings
- **Product:** Developer Guide, Setup Instructions
- **Admin/Team:** Team management, Workspace settings
- Logout separated at bottom

---

## 3) Projects Page — UI/UX + Functional Expectations
### 3.1 Cards must show correct, comparable metrics
Each project card should show consistent, meaningful numbers:
- Devices (active in range or total — label explicitly)
- Logs (in range)
- Traces (in range)
- Crashes (in range)
- Optional: last activity timestamp

**Rule:** If a metric is “range-based,” label it. If all-time, label it.

### 3.2 Role visibility
Badges like “Owned / Viewer” are good — keep them. Ensure access control is respected.

---

## 4) Dashboard Page — UI/UX + Functional Expectations
### 4.1 Only 2 user-facing modes
Dashboard must present only:
- **Aggregated** (default)
- **Raw** (debug)

If “Live Query” is an implementation detail, do not surface it as a third UX mode.

### 4.2 Every tile must drill down
Each tile/card must support one-click drill-down into the relevant raw page with the same filter context:
- Active Devices → Devices list (pre-filtered)
- Error Rate / API Requests → Traces list (pre-filtered)
- Top crash group → Crashes list (pre-filtered)
- Top issues list items must open the correct filtered raw page

### 4.3 Saved Views & Filters
Dashboard filters must be consistent with the product:
- Search (endpoint/screen/version/device)
- Time range
- Segment (if supported)
- More filters (platform/env/app/os etc. if supported)
- Saved Views should store the current filter state and restore it consistently.

### 4.4 Avoid placeholder-only content
If charts are placeholders, clearly mark them as “coming soon” and do not imply data is real.

---

## 5) Devices Page — UI/UX + Functional Expectations
### 5.1 Devices page structure
Keep this overall structure (it’s correct):
1) Usage bar + limit status
2) Limit warning banner (dynamic thresholds)
3) Summary cards (aggregated)
4) Distributions (aggregated)
5) Filter bar
6) Raw devices table + actions

### 5.2 Summary cards (aggregated) — required definitions
Cards must have explicit definitions and match table filters:
- **Total Devices:** all-time distinct devices
- **Active (Range):** devices with last_seen within selected range
- **Debug ON:** devices where debug is enabled (definition must match filters and be consistent across app)
- **New (Range):** devices first seen within selected range

**Rule:** Active cannot equal Total by default unless it’s truly “all-time.”

### 5.3 Distributions (aggregated)
These are required for competitor parity and fast insight:
- Platform distribution (iOS/Android/Web/Other)
- Environment distribution (Prod/Staging/Dev/Custom)
- OS version (top 5 + “View all”)
- App version (top 5 + “View all”)
- Device model (top 5 + “View all”)

Each distribution must react to the same filter context as the table.

### 5.4 Filters — must be stable and never “break” after selection
Filters present:
- Search (deviceId/userId/email/model, etc.)
- Platform dropdown
- Environment dropdown
- Debug dropdown (All / ON / OFF)
- Time range dropdown (Last 15m/1h/24h/7d/30d)
- Export CSV

**Do not mutate dropdown options** based on selection. Example bug: selecting “Web” and the dropdown becomes “Web only.” That must never happen.

### 5.5 Raw table — debug-first
Columns should remain:
- device id
- platform
- environment
- app version
- OS version
- model
- last seen
- debug state
- actions

Actions must work:
- View device (opens device details)
- Toggle Debug (must not 500)

### 5.6 Usage thresholds — required behavior and placement
Usage bar remains at top.
Banner below bar must be dynamic:
- **80%** warning (non-blocking)
- **90%** critical (strong warning)
- **100%** blocked (clearly state what is blocked)

Additionally add a small global **Usage pill** in header (click → Usage page).

---

## 6) Bug List From Testing — Required Fix Outcomes (No Code, Behavior Only)
These are the exact behaviors that must be fixed. Each item must be validated after refactor.

### 6.1 Debug count mismatch
- Dashboard shows Debug ON (e.g., 300) but Devices Debug filter returns 0.
**Expected outcome:** Debug ON count and filtered results must match the same definition and same filter context.

### 6.2 Platform filter returns empty and becomes “stuck”
- Selecting Android/iOS returns “0 to 0 of 0” and cannot recover.
- Selecting Web causes dropdown to only show Web until navigating away.
**Expected outcome:** Filter selection must update results correctly and dropdown options must remain complete and selectable.

### 6.3 OS/App version filter mismatch
- OS version filter says N devices but table differs.
- App version filter returns all devices incorrectly.
**Expected outcome:** Cards, distributions, and table must reflect the same filters. No ignored filters.

### 6.4 Search results correct but “Device not found” message shown
**Expected outcome:** “Not found” only shows when the request completes AND results are empty. Must clear on any non-empty result.

### 6.5 Environment and Last 24h filters incorrect
**Expected outcome:** Time range must consistently apply to “Active” and table rows using last_seen semantics. Environment must filter correctly and consistently.

### 6.6 View Device / Debug actions broken
- View does nothing
- Debug returns internal server error
**Expected outcome:** Both actions must work reliably. Debug should show confirmation (on enable), update UI state, and display a user-friendly error if failure occurs.

---

## 7) Competitor Parity (Devices area) — Minimum Gaps to Close
To be credible vs mainstream observability tools, Devices needs:
- stable filtering + pagination
- device details page/drawer (metadata + last activity + quick links)
- distributions (platform/env/os/app/model)
- reliable “active/new/debug enabled” counts
- export CSV that matches current filters
- clear usage limits + upgrade CTA at thresholds

If any of the above is missing in the current implementation, treat it as a required gap.

---

## 8) Development Sequencing (What to implement first)
Cursor should implement in this order to avoid rework:

1) **Fix filter state + stability** (dropdown mutation, stuck filters, not-found state)
2) **Unify metric definitions** (Total/Active/New/Debug) and ensure consistency across dashboard + devices
3) **Make actions reliable** (View device + Debug toggle; remove 500s)
4) **Usage thresholds + global usage pill** (80/90/100 behavior)
5) **Dashboard cleanup** (only Aggregated/Raw, drill-down behavior)
6) **App shell cleanup** (consistent header controls, menu grouping, naming consistency)

---

## 9) Acceptance Checklist (Quick)
Before considering Devices/Dashboard “done,” validate:
- Selecting platform/env/debug/range always returns consistent results across cards + distributions + table.
- Dropdowns never collapse to one option.
- Search never shows “not found” when a result exists.
- Debug ON counts match what the table returns when filtered.
- View Device works and shows meaningful details.
- Debug toggle works and updates UI state.
- Usage thresholds show correct messages at 80/90/100.
- Dashboard tiles drill down to raw pages with correct filters.
