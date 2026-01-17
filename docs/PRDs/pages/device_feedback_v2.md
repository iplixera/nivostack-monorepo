# Device Management + App Shell — Refactor Feedback & PRD (v2)

Owner: Cursor (implementation)  
Label: `ui-ux`  
Scope: **App Shell**, **Devices (raw rows + aggregation)**, and the **filter/query consistency bugs** observed in testing.

---

## 0) Executive summary (what must change)

1. **One query state** must drive **everything** on Devices:
   - the usage bar,
   - plan-limit banners,
   - KPI cards,
   - facet chips (Platform/OS/App),
   - table rows + pagination,
   - export.
2. **Aggregation ≠ replacing raw rows**:
   - Aggregation is for **dashboards + summary tiles + facets**.
   - Raw rows are for **debugging and drill-down**, especially for **debug-enabled devices** (near-real-time).
   - UX must **show both** without confusing users or mixing data sources silently.
3. Fix core functional defects (filters returning 0, mismatch counts, search false “not found”, broken actions).

---

## 1) Observed issues from testing (must-fix bugs)

### 1.1 Filter & count inconsistencies
- Dashboard shows **“Debug ON = 300”**, but applying **Debug ON filter returns 0 devices**.
- Platform filter (Android/iOS) returns “**0 to 0 of 0 results**” and gets stuck.
- OS Version filter shows “**5 devices**” but the table displays a different set/count.
- App Version filter returns **all devices** (filter not applied).
- Environment filter shows wrong results.
- “Last 24 Hours” filter returns wrong results.

### 1.2 Search behavior is contradictory
- Searching a device shows the device row, but UI still shows **“Device not found”**.

### 1.3 Dropdown state is broken
- If Platform dropdown is set to **Web**, the dropdown options become **only Web**, user cannot change it unless leaving the page and returning.

### 1.4 Actions are broken
- “View Device” doesn’t work.
- “Debug” returns **internal server error**.

---

## 2) Target UX: what the Devices page must do

### 2.1 Primary intent of Devices page
Devices page is a **device registry + debugging entry point**. It must enable:
- Find a device quickly (search),
- Slice the fleet (filters/facets),
- Identify “live” or “problem” devices (seen recently / debug-enabled / crashy),
- Drill into a single device detail (timeline, logs, sessions, crashes, traces),
- Toggle debug for a device safely (with guardrails + plan checks).

### 2.2 Layout expectations (keep current design style)
Top → bottom:
1. **Plan Usage strip** (with thresholds and upgrade CTA)
2. **KPI cards** (consistent with current filters/time range)
3. **Facet chips/tabs**: Platform / OS Version / App Version (optional: Country, Model)
4. **Filter bar** (search + dropdown filters + date range + export)
5. **Device table** (raw rows) with pagination, stable sorting

---

## 3) Aggregation vs Raw-Row: non-conflicting logic (must implement)

### 3.1 Definitions
- **Raw Row Device**: one record per device (device_id). Used to list devices and debug.
- **Aggregations**: precomputed counts/metrics (per platform, OS version, app version, time window, env, debug flag).

### 3.2 Rule: Never let aggregation “replace” raw rows
- KPI cards and facets use **aggregated queries**.
- Table uses **raw device rows**.
- Both must be computed from the **same filter context** and **same time window** (except where explicitly stated).

### 3.3 Debug-enabled devices (live view)
For debug-enabled devices:
- Table can show “online/last seen now”.
- “Debug” page/stream should use **live ingestion** (latest events) and not rely on aggregated rollups.

### 3.4 UX: indicate data source without confusion
- On Devices page, show subtle status chips:
  - `Counts: Aggregated (hourly)`  
  - `Rows: Raw registry (live last_seen)`
- Do **not** provide an “Aggregated/Raw toggle” on Devices page. Devices is always raw rows + aggregated summary.

(Keep “Aggregated vs Raw vs Live Query” controls on **Dashboard**, not on each raw list page.)

---

## 4) Devices summary cards (competitor parity + useful aggregations)

### 4.1 KPI cards (minimum set)
Cards must be derived from the same filter context:
- **Total Devices** (in current filters; time window affects “Active”, not total registry unless filtered)
- **Active in range** (e.g., last 24h/7d)
- **Debug ON** (count devices where debug_enabled=true)
- **New devices** (first_seen within range)

### 4.2 Recommended additional cards (optional, but competitive)
- **Crashy devices** (devices with ≥1 crash in range)
- **Top app version** (most common app_version)
- **Top OS** (most common os_version)

### 4.3 Facet chips/tabs
The “Platform / OS Version / App Version” chip group must:
- Display **top 5** + “More…” (drawer) for long tails
- Each chip shows label + count
- Clicking a chip **applies a filter** and refreshes KPIs + table
- Chips are always computed from the **current query context** (time, env, debug), minus the facet dimension itself if you want true distribution (see implementation note below)

**Implementation note (standard faceting pattern)**  
When computing facet distribution for dimension `platform`, apply all filters except `platform` (so the user sees other options even if currently filtered by platform). This prevents the “only Web exists” dropdown/facet bug.

---

## 5) Filter bar: required behavior + exact semantics

### 5.1 Filters (current)
- Search: `device_id`, `user_id`, `email`, `model` (match partial)
- Platform: Android / iOS / Web / Other
- Environment: Prod / Staging / Dev / (custom)
- Debug: All / Debug ON / Debug OFF
- Time range: Last 24h / 7d / 30d / Custom
- Export CSV: exports the **current result set** (respect filters, sort)

### 5.2 Behavior rules (must)
1. Changing any filter:
   - resets pagination to page 1,
   - refreshes KPIs, facets, and table,
   - updates the URL (query params) so it’s shareable.
2. “Clear” resets all filters to default (All + last 24h for “Active” context).
3. No filter may “self-collapse” its option list to only the selected value.
4. If results exist, **never show** “Device not found”.
   - That message should appear only when result count = 0.

---

## 6) Data & API contracts (so Cursor can refactor safely)

### 6.1 Frontend state model (single source of truth)
Create a single query state object:

```ts
type DeviceQuery = {
  q?: string;
  platform?: "android"|"ios"|"web"|"other";
  env?: string;
  debug?: "all"|"on"|"off";
  timeRange?: { preset: "24h"|"7d"|"30d"|"custom"; from?: string; to?: string };
  sort?: { field: "last_seen"|"first_seen"|"app_version"|"os_version"; dir: "asc"|"desc" };
  page: number;
  pageSize: number;
};
```

All API calls accept the same query state (or a normalized subset).

### 6.2 API endpoints (recommended)
1. `GET /api/projects/:projectId/devices` → raw rows + pagination
   - returns `{ items, total, page, pageSize }`
2. `GET /api/projects/:projectId/devices/summary` → KPI cards + usage
3. `GET /api/projects/:projectId/devices/facets` → distributions for platform/os/app
4. `POST /api/projects/:projectId/devices/:deviceId/debug` → enable/disable debug (guardrails)
5. `GET /api/projects/:projectId/devices/export.csv` → streamed CSV export

### 6.3 Consistency constraint (non-negotiable)
All of (1)(2)(3) must be computed using the **same filter interpretation**:
- same `q` parsing rules
- same env mapping
- same debug mapping
- same time-window usage for “active/new” metrics

If you can’t guarantee this server-side, you will keep seeing “cards show X but table shows Y”.

---

## 7) Root cause hypotheses (why current bugs occur)

These are the typical causes that match your symptoms:

1. **Filters applied to table query only** but summary cards are fetched without filters (or with different time range).
2. **Debug ON count** is computed from aggregated device_events, but table reads device registry debug flag, and they’re not synced.
3. **Facet/dropdown options** are computed after applying the same facet filter (so it collapses to one value).
4. **Search “Device not found”** is based on a stale `total==0` flag from a previous request, not from the latest response.
5. **Dropdown “only Web”** is because you overwrite the options list with the filtered list instead of a stable enum list.
6. **View/Debug actions** fail due to:
   - wrong route params (projectId/deviceId),
   - permission checks not aligned with plan/role,
   - missing API handler.

---

## 8) Required device detail experience (to close competitor gaps)

“View Device” must route to **Device Details**:
- Header: Device ID + platform badge + env badge + debug status + last seen
- Tabs:
  1. Overview (metadata, app/os/model, first_seen/last_seen)
  2. Sessions (last N sessions)
  3. Logs (tail + filters)
  4. Crashes (groups + latest)
  5. API Traces (latest)
  6. Settings (toggle debug, tags, notes)

**Minimum competitor parity**
- Device timeline combining session/log/crash/trace markers
- Debug toggle with guardrails:
  - If plan limit reached, show modal: “Upgrade to enable debug”
  - If debug enabled, show “expires in X hours” (optional policy)

---

## 9) Plan limits + warning thresholds (80% / 90% / 100%)

### 9.1 Where to display
- On Devices page:
  - top **usage bar** (always visible)
  - below it, conditional **warning/critical banner**

### 9.2 Thresholds and copy
- 80%: Warning (yellow)
  - “You’ve used 80% of your device limit. Consider upgrading to avoid throttling.”
- 90%: High warning (orange)
  - “90% of device limit used. New devices may be throttled soon.”
- 100%: Critical (red)
  - “Device limit reached. New device registrations may be throttled or dropped. Upgrade to continue.”

### 9.3 Functional guardrails
- If limit ≥ 100%:
  - block new registrations (or throttle) based on policy
  - block debug enable if it increases cost / exceeds allowed debug devices
- All banners must link to **Subscription/Upgrade**.

---

## 10) Acceptance criteria (Cursor must meet all)

### 10.1 Functional correctness
- Debug ON card count matches Debug ON filter result count (within same query state).
- Platform filter always returns correct devices; can switch between platforms without leaving page.
- OS/App version filters change both KPIs and table consistently.
- Search never shows “Device not found” if results exist.
- Environment + time range filters return correct results.

### 10.2 UX
- Filters are stable, predictable, and shareable (URL query params).
- Dropdown option lists remain complete.
- Clear button resets state.
- Export exports what is currently visible (respect filters/sort).

### 10.3 Actions
- “View Device” navigates to Device Details.
- “Debug” works and reflects new state (optimistic UI is OK if confirmed by API).

---

## 11) Implementation steps (recommended order)

1. **Refactor query state** (single source of truth) + URL syncing.
2. **Fix API filter parity** (devices list, summary, facets).
3. Fix dropdown/facet distribution logic (no self-filtering).
4. Fix search empty-state logic (remove stale “not found” banner).
5. Implement Device Details route and page skeleton.
6. Fix debug toggle endpoint + permissions + plan guards.
7. Add export endpoint + UI.

---

## 12) Test checklist (copy/paste for QA)

- [ ] Load Devices: cards, facets, table all match totals.
- [ ] Apply Debug ON: cards + table match; chips update.
- [ ] Switch platform Android→iOS→Web: results update, dropdown options remain complete.
- [ ] OS Version filter: count matches table; clear restores.
- [ ] App Version filter: correct subset; clear restores.
- [ ] Search partial device id: correct results; no “not found” if results exist.
- [ ] Env filter: correct subset.
- [ ] Last 24h vs 7d: Active/New metrics update; table “last_seen” filter behavior is correct.
- [ ] View Device opens details.
- [ ] Toggle Debug: succeeds and reflects in table + details.
- [ ] At 80/90/100% usage thresholds: correct banners and behavior.
