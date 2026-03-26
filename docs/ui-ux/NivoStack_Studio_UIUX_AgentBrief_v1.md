# NivoStack Studio — Agent Brief for UI/UX + Functional Refactor (Dashboard + Devices)
**Audience:** Claude/Cursor agent implementing the UI.  
**Scope:** Rebuild **Dashboard** and **Devices** pages (and the **global app shell**) with a consistent design system and correct *Aggregated vs Raw-row* behavior.  
**Non-scope:** Writing backend code in this document. Use existing schema/APIs and adjust as needed.

---

## 0) What “good” looks like
The current implementation is **visually inconsistent** and **functionally unreliable**. We need:

1) **One coherent app shell** (layout + tokens) used by every page (Runtime + Content + APIs + Settings).
2) **Two data modes everywhere:**
   - **Aggregated mode** = fast charts + rollups for monitoring / dashboards
   - **Raw-row mode** = per-event/per-device row data for debugging and drilldown (esp. debug-enabled devices)
3) **No broken filters, no contradictory counts.**
4) **No huge empty space**. Space must be intentionally used: charts, tables, drilldowns, or helpful states.

---

## 1) Global UI/UX standards (must apply across all pages)
### 1.1 Layout + density
- **Use a single max content width** for light theme pages: `max-width: 1240–1440px` (pick one and keep it consistent), centered.
- **Remove “dead zones”** (large blank areas). If space exists:
  - show a chart, a breakdown, or a table
  - or collapse the area (do not leave it empty)
- Use a consistent vertical rhythm:
  - Section spacing: 24–32px
  - Card internal padding: 16–20px
  - Table row height: 44–52px
- Avoid the current pattern where the **filter bar is taller than the actual content**.

### 1.2 App shell structure
**Left navigation (primary):**
- Keep it stable (no shifting widths per page).
- Use clear grouping: Runtime / Content / APIs / Settings.
- Show counts as subtle badges; do not over-emphasize.

**Top bar (secondary):** (currently wastes space)
- Left: Project selector (compact)
- Middle/Right: Environment selector, Mode selector (Agg/Raw), Theme toggle, Notifications, Profile
- Do **not** place “Copy API Key” floating in the middle of the page. Put it in:
  - Project settings header action, or
  - Project selector dropdown, or
  - a “Project actions” menu

### 1.3 Alerts / trial banners / quota banners
- Trial banner must be:
  - **Dismissible**
  - Compact (one line + CTA)
  - **Not pushing content down by a full page**
- Quota banners must show:
  - current usage, limit, and %  
  - impact (“new events will be blocked / throttled / sampled”)
  - CTA (“Upgrade plan”)
- Use three thresholds visually:
  - **80%**: warning (yellow)
  - **90%**: high warning (orange)
  - **100%**: critical (red)

### 1.4 Components + consistency
- Use **one** card style, **one** table style, **one** filter bar style across pages.
- Remove mixed “dark cards inside light pages” unless you deliberately define it as your design language. Right now it looks accidental.
- Typography:
  - Page title 24–28px
  - Section title 16–18px
  - Body 13–14px
- Buttons:
  - Primary only for the top 1–2 actions; everything else should be secondary/tertiary.
- Empty states must be purposeful:
  - explain why empty (“no data in this time range” / “filters exclude everything”)
  - include a “Reset filters” action

---

## 2) Core concept: Aggregated vs Raw-row (required behavior)
### 2.1 Definitions
**Aggregated view** = pre-aggregated rollups over time ranges (hours/days). Used for:
- charts (trend lines)
- breakdowns (platform distribution, top OS versions)
- top issues / anomaly summaries
- counts (active devices, sessions, error rate)

**Raw-row view** = individual records/events. Used for:
- real-time debugging and forensic analysis
- per device drilldown (“show me what device X did in last 10 minutes”)
- log lines, crash instances, API traces rows, session events

### 2.2 Rules (must be enforced in UI)
1) **Aggregated metrics must never be derived by “counting rows currently visible in the raw table.”**  
   They come from aggregated queries/tables.
2) Raw-row pages must always display:
   - exact filters applied
   - time range + timezone
   - data source label: “Raw events” vs “Aggregations”
3) When user clicks an aggregated chart/segment, it must **drill down**:
   - open the same page in **Raw-row** mode with filters pre-applied
   - example: “Android” segment → Raw-row mode with `platform=android`
4) “Raw (Debug)” is a *subset* of raw-row:
   - show only debug-enabled devices/events OR show an additional toggle inside raw mode:
     - Raw: all devices
     - Raw (Debug): debug-enabled devices only

---

## 3) Page 1: Dashboard (what to build)
### 3.1 Dashboard purpose
Competitor-style monitoring page. Must answer:
- What’s happening right now?
- Where are issues concentrated?
- How do I drill into raw events?

### 3.2 Dashboard layout (recommended)
**Header row**
- Page title + short description
- Right side: Mode toggle (Aggregated / Raw) + Env + Time range

**Row A — KPI tiles (6 tiles max)**
- Active devices
- Sessions
- API requests
- Error rate
- Latency (p95)
- Cost estimate (optional, if you have it)

Each tile must support:
- **View in raw** action (pre-filtered)
- tooltip definition (what this metric means)

**Row B — Charts**
- Left (wide): “Traffic & Errors” over time (requests + errors; or error rate)
- Right (narrow): “Top issues” list
  - each item clickable → raw row view with filters

**Row C — Breakdown**
- Platform distribution (pie or bar)
- Top OS versions
- Top app versions
- Top endpoints (slow / error)

These can be collapsed under “More insights” if needed.

### 3.3 Raw-row mode inside Dashboard
If dashboard is switched to Raw mode:
- do **not** attempt to render dashboard charts from raw events
- instead show:
  - a live “recent events” table (API traces or logs) with quick filters
  - a prominent switch back to aggregated for charts

---

## 4) Page 2: Devices (what to build)
### 4.1 Devices purpose
This is a **device registry + debug control** page. Competitors typically provide:
- device inventory
- segmentation (platform/OS/app versions)
- “active recently” + retention
- ability to open a device details panel and debug

### 4.2 Devices layout (recommended)
**Header row**
- Page title + description
- Right side: time range, env, mode toggle

**Row A — KPI tiles (4 tiles)**
- Total devices (all-time)
- Active devices (time range)
- Debug ON (current)
- New devices (time range)

**Row B — Distributions (charts, not just chips)**
- Platform distribution (bar or donut)
- Environment distribution
- Top OS versions (horizontal bar)
- Top app versions (horizontal bar)

Do not show only small chips. Use the space to show insight.

**Row C — Filters (compact)**
- Search (deviceId/userId/email/model)
- Platform, Env, Debug, Time range
- “More filters” drawer for:
  - OS version, App version, Country/Locale, Brand/Model, SDK version, First seen/Last seen ranges

**Row D — Devices table**
Must include:
- Device (ID + short alias)
- Platform
- Environment
- App version
- OS version
- Model/brand
- Last seen
- Debug toggle
- Actions: View details, Open logs, Open traces, Open crashes

**Device details panel (right drawer)**
- Opens on “View” without navigation
- Shows device metadata, tags, first/last seen
- Debug controls
- Short “Recent activity” (tabs: traces/logs/crashes/sessions)

### 4.3 Devices: Raw-row vs Aggregated
- Aggregated mode drives KPI tiles + distributions.
- Table is always “device registry rows” (not event rows), but:
  - “Active” and “Last seen” must be computed consistently.
- Debug ON count must match the Debug filter results.

---

## 5) Correctness requirements (based on previous test failures)
The following MUST be fixed in the new implementation:
- Debug ON tile shows N, but “Debug ON” filter returns 0 → unacceptable.
- Platform filter “locks” to one option after selecting Web → dropdown state bug.
- Filter counts and table results mismatch (OS version says 5 devices but table differs).
- Search returns device but displays “Device not found” message simultaneously.
- Env filter and last 24h filter produce inconsistent results.
- “View” action and “Debug” action failing (no-op / 500) must be handled:
  - show error toast with clear message
  - keep UI state consistent

---

## 6) UX decisions to remove wasted space (direct response to your concern)
Yes, competitor tooling uses space well:
- dashboard = charts + issues + drilldowns
- devices = distributions + inventory + details panel
The current “cards only + huge spacing” is **not competitive**.

Adopt:
- Two-column grids where appropriate
- Collapsible “Insights” and “Advanced filters”
- Sticky filter bar (optional) to avoid scrolling back up

---

## 7) Deliverables for the agent (what to implement now)
**Phase 1 — App shell refactor**
- Implement the standardized app shell (left nav + compact top bar + consistent spacing)
- Remove floating “Copy API key” from random places

**Phase 2 — Dashboard**
- Implement Aggregated dashboard layout (KPIs + charts + top issues + breakdown)
- Implement Raw mode behavior (recent events + drilldowns)
- Ensure drilldown links set filters correctly

**Phase 3 — Devices**
- Implement distributions (charts) + device table + details drawer
- Ensure filters are stable and reversible
- Ensure counts match data

**Acceptance criteria**
- No empty “dead” areas; space is filled by meaningful content or collapsed.
- Switching modes changes what’s shown in a way that makes sense.
- Drilldowns reliably open raw-row views with correct filters.
- All filters can be changed back and do not get “stuck”.
- Counts and rows are consistent (no contradictions).

---

## 8) Notes on the provided “updated views”
Some of your recent pages (Data Cleanup, SDK Settings, Product Features, Localization Stats, Crashes skeleton, Logs/Traces, Devices) show **large empty space and inconsistent component styling**.
That is exactly what this brief is meant to correct:
- unify layout
- shrink banners
- replace large blank areas with charts or a tighter grid
- standardize filters and tables

---
