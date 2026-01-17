# Cursor UI/UX + Functional Feedback (Pages 1–3)
**Pages covered:** Projects, Dashboard, Devices (App Shell context included)  
**Goal:** Remove wasted space, fix filter correctness, and enforce **Aggregated vs Raw** rules consistently (so counts + tables never contradict).

---

## 0) Non-negotiables (apply to ALL pages)

### A) Layout & spacing (current screens waste too much width/height)
**Issue:** Pages are centered/narrow with large unused left/right/top space. Tables and dashboards feel “empty”.

**Instruction to Cursor**
- Use a responsive content container: **max-width ~1440px** (or fluid on large screens), consistent padding (24–32px).
- Reduce top chrome height. The app header + page title area should be compact.
- Tables should use available width (don’t constrain them to a narrow column).
- Use a consistent **12-column layout grid** for all pages:
  1) Title + primary actions  
  2) Context bar (Project / Env / Time range / Mode)  
  3) KPIs + charts/segments + table

### B) One shared “Context Bar” model (same placement everywhere)
**Issue:** Env/Mode/Time range appear in different places; unclear what affects which widgets.

**Instruction**
- Add a compact context row under page title containing:
  - Project (chip/read-only if already selected in sidebar)
  - Environment
  - Time range
  - Mode: **Aggregated** / **Raw**
- Changing context must update:
  - visible “applied” chips
  - all data queries on that page (or clearly label what cannot be filtered)

### C) One filter engine shared everywhere (fixes your test failures)
Your reported symptoms are classic “filter state vs query mismatch”:
- Debug ON card ≠ Debug filter results  
- Platform dropdown gets stuck (only “Web” remains)  
- OS/App version counts ≠ table rows  
- Search returns device but UI says “Device not found”  
- Env / last 24h incorrect  
- View/Debug actions failing

**Instruction**
- Maintain ONE filter state object per page:
  - `searchText`
  - `platform[]`
  - `environment[]`
  - `debugState` (All / DebugOn / DebugOff)
  - `timeRange`
  - optional: `osVersion[]`, `appVersion[]`
- Dropdown options **must never collapse** to only the selected value.
- Table, KPI counts, and segments must use the **same filter state** (or explicitly show “this widget ignores search”).

### D) Aggregated vs Raw: define it once and enforce it everywhere
This is the root of many contradictions.

**Definition**
- **Aggregated (default):** snapshots (hourly/daily) used for:
  - KPI cards
  - charts
  - platform/os/app/env distributions
  - “Top issues”
- **Raw (debug):** row-level data used for:
  - device registry rows (live `last_seen`)
  - raw logs/traces/sessions rows
  - drilldown details per device/session

**UI rule**
- If a page shows both, it must label it clearly, e.g.  
  **“Counts: Aggregated (hourly) · Rows: Raw registry (live last_seen)”**
- Filters must apply to both where possible (env/platform/time range). If a filter can’t apply to aggregates (e.g., free-text search), show a tooltip:  
  **“Counts ignore search; table respects search.”**

### E) Loading/empty/error states
- Never show “Device not found” if results exist.
- If 0 rows: show empty state + “Clear filters”.
- Debug/View failures must show a toast with reason + retry.

---

## 1) Page: Projects (Projects list + App Shell)

### UI issues
1) **Dead space**
- Only 3 cards, huge empty area.
- **Fix:** responsive grid (2–4 cards per row depending on width).

2) **Context controls don’t fit this page**
- “Env: Production” doesn’t make sense here unless projects are environment-scoped.
- **Fix:** keep “Mode: Org” if needed; remove Env from Projects page unless truly relevant. Add **Search + Sort**.

3) **Usage bar is not actionable**
- “Projects Usage” should link to usage/limits.
- **Fix:** Add “View usage” + show warning thresholds (80/90/100) consistently.

### Functional expectations
- Card stats must be clearly labeled (all-time vs 24h).
- Selecting a project must update app context everywhere (sidebar selector + routing).
- Role badge (Owned/Viewer) must control actions.

**Acceptance**
- Page fills width, searchable, sortable, project selection always consistent.

---

## 2) Page: Dashboard (Health snapshot)

### UI issues
1) **No real dashboard content yet**
Competitors always show:
- Traffic over time + error rate over time
- Latency trends (P50/P95/P99)
- Top endpoints + top errors + top crash groups

**Fix (minimum)**
- Add **2 core charts**:
  - **Requests + Error Rate** time series
  - **Latency P50/P95/P99** time series (or histogram)

2) **Filter bar consumes too much space**
- Oversized filter row for the amount of content.
- **Fix:** compress to a single row; advanced filters in drawer/popover.

3) **Aggregated vs Raw toggle behavior unclear**
- Aggregated looks disabled while Raw(Debug) is active.
- **Fix:** default = Aggregated. Raw(Debug) only when investigating. Make it a clear segmented control.

4) **Top Issues too small**
- Needs: crashes, HTTP errors, slow endpoints. Each row must drilldown.

### Functional expectations
- Every KPI tile must drill down to the relevant raw page with filters pre-applied.
- Time range + env must affect KPIs, charts, top issues consistently.

**Acceptance**
- Dashboard is useful without touching filters; tiles match drilldown results.

---

## 3) Page: Devices (Device management)

### Your question: “Is this right UX vs competitors?”
**Answer:** Not yet. Competitors don’t necessarily add heavy charts here, but they always provide:
- strong segmentation (platform/os/app/version/model)
- powerful table controls
- consistent counts vs rows
- reliable actions (view/debug)

### What improved in your latest Devices screenshot
- The label **“Counts: Aggregated (hourly) · Rows: Raw registry (live last_seen)”** is correct direction.
- Platform + Environment distributions are good.
- Usage warning banner is visible.

### UI issues (current)
1) **KPI row is logically wrong / redundant**
- “Total Devices” equals “Active (Range)” → either aggregation wrong or label wrong.
- **Fix KPI definitions:**
  - Total devices (all-time)
  - Active devices (selected time range)
  - Debug ON devices (current)
  - New devices (selected time range)

2) **Segmentation is incomplete**
- Platform + Environment alone is not enough.
- **Add at least:**
  - OS Versions (top 5 + “view all”)
  - App Versions (top 5 + “view all”)
  - Optional: Device model distribution

3) **Filter bar vs table priority**
- Filter bar is big; table area is too small.
- **Fix:** reduce filter padding; increase table height; sticky header; virtualize if needed.

4) **Actions must be strong**
- “View” + “Debug” must always work.
- **Fix expectation:**
  - View opens details drawer/page with tabs: Info, Sessions, Logs, Traces, Crashes
  - Debug toggles debug state with confirmation + immediate feedback

### Your functional test failures (must be fixed)
- Debug ON card says value but Debug filter returns 0 devices.
- Platform filter returns 0 and dropdown gets stuck to only selected value.
- OS version count differs from table.
- App version filter returns wrong device list.
- Search returns device but shows “Device not found”.
- Env filter wrong.
- Last 24h filter wrong.
- View not working; Debug returns internal server error.

**Systematic fix instruction**
- **Table = raw registry truth.** All filters must correctly filter raw table rows.
- **Cards/segments = aggregated snapshots**, but must use the same filter dimensions (env/platform/time range) so they don’t contradict the table.
- If a snapshot can’t support a filter (e.g., free-text search), label it clearly.

**Acceptance**
- Filters never contradict UI text.
- Dropdown options never collapse.
- Clicking platform/env/os/app segments applies filters and updates chips.
- KPI + segments align with filtered table (or explicitly state what they ignore).

---

## Priority order (fastest → biggest impact)
1) **Fix filter engine correctness + dropdown “stuck” bug** (resolves most failures you saw)
2) **Fix layout container width + reduce dead space**
3) **Dashboard: add 2 core charts + drilldowns**
4) **Devices: add OS/App version segments + click-to-filter**
5) **Device View + Debug action reliability + error handling**
