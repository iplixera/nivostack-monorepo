# NivoStack Studio – Layout & Space Utilization Restructure (Agent Brief v6)
**Target model:** Claude Code (Opus)  
**Objective:** Fix the “centered marketing page” layout problem and implement a proper full-width product console shell. Eliminate wasted whitespace, anchor sidebar to viewport, and apply consistent layout density rules across pages (Projects, Dashboard, Devices).

---

## 0) Problem Summary (What is wrong right now)
Current UI behaves like a centered marketing site:
- The **entire app shell** is inside a centered container (e.g., `mx-auto max-w-*`), causing **main content AND the left sidebar** to sit in the middle with large empty gutters.
- Data-heavy pages (Devices, Dashboard, Traces/Logs views) are visually “thin” and do not use desktop real estate effectively.
- Sidebar header (logo/app name block) consumes unnecessary vertical space.

This is unacceptable for an observability/monitoring console. We need a **full-width app shell** with **controlled content widths per page type**, not one global narrow container.

---

## 1) Core UX Principle
### Use space intelligently
- **Do not** stretch everything edge-to-edge indiscriminately.
- **Do** expand data views (tables, lists, live streams) to a wide layout to maximize scan-ability and reduce truncation.
- **Do** keep forms/settings narrower for readability.

This means **layout density must be configurable per page**, not hard-coded globally.

---

## 2) Required Layout Architecture (App Shell)
### 2.1 App shell must be full width
**Hard rule:** remove any `mx-auto / max-w-*` wrapper around the entire app layout.

**Layout skeleton**
- **Top Header**: full width, fixed height (56–64px), sticky/fixed at top
- **Sidebar**: fixed width (240–280px), sticky/fixed left, independent of page container
- **Main content**: takes remaining width, controls its own max width per page

**Recommended structure**
- `AppShell`
  - `TopHeader (sticky)`
  - `Body`
    - `Sidebar (sticky/fixed)`
    - `Main (scroll)`

**Implementation notes**
- Use CSS grid or flex:
  - Grid example: `grid-cols-[260px_1fr]`
  - Main must be `min-w-0` to prevent overflow issues with tables.
- Ensure **scrolling happens in main**, not on the whole page, unless you prefer body scroll + sticky elements (either is acceptable, but must be consistent).

### 2.2 Sidebar must not be inside the page container
**Hard rule:** the sidebar should be anchored to the left viewport edge and remain stable while main content changes width.

---

## 3) Content Width / Density Rules (Per Page Type)
Introduce a per-page layout “density” setting.

### 3.1 Density enum
Use one of these modes:
- `narrow` – settings forms
- `normal` – mixed content
- `wide` – tables, dashboards, monitoring views

### 3.2 Suggested max widths (desktop)
- `narrow`: 900–1100px
- `normal`: 1100–1300px
- `wide`: 1400–1600px (or fluid with a max)

### 3.3 Page mapping (must apply)
- **Projects page**: `normal` (cards grid benefits from width)
- **Dashboard**: `wide`
- **Devices list**: `wide`
- **Traces/Logs/Crashes/Sessions tables**: `wide`
- **Project Settings / SDK Settings / Config forms**: `narrow` or `normal`

### 3.4 Responsiveness
- < 1024px: sidebar collapses automatically, main uses near full width
- < 768px: sidebar becomes off-canvas drawer; main is 100% width

---

## 4) Sidebar UX Requirements (Space + Navigation)
### 4.1 Sidebar header must be compact
Remove the large “NivoStack” block inside the sidebar (it wastes space).

**New sidebar header should contain**
- Project name (truncated) OR small section title
- Optional environment badge
- Optional project switch control

**Branding placement**
- Put product brand (“NivoStack”) in the **Top Header**, left side.
- Sidebar is for **navigation**, not branding.

### 4.2 Sidebar width and collapse
- Default width: **260px**
- Collapsed width: **72px** (icons only)
- Must support user toggle collapse/expand
- On collapse: show tooltips for icons

### 4.3 Navigation grouping
Keep groups (Overview / Debug / Content / APIs / Settings) but:
- Make spacing tighter (reduce vertical gaps between groups)
- Ensure active item highlight is consistent and accessible
- Badge counts must use consistent style (no random pills/colors)

---

## 5) Top Header UX Rules
Top header should contain:
- Left: product brand + optionally “Projects” as breadcrumb
- Center (optional): global search (later)
- Right: theme toggle + notifications + user menu

**Hard rule:** do not add a second “top bar” inside pages. One global header only.

---

## 6) Theme & Color System Rules (Stop odd black/red usage)
You are currently mixing hard-coded black sections and aggressive red panels. Replace that with a token-driven theme.

### 6.1 No hard-coded colors
**Hard rule:** no `bg-black`, no arbitrary `#000`, no random reds. Use theme tokens.

### 6.2 Define and use semantic tokens
Examples (names can vary, semantics must remain):
- `bg.app`
- `bg.surface`
- `bg.surfaceMuted`
- `border.default`
- `text.primary`
- `text.secondary`
- `primary`
- `danger`
- `warning`
- `success`

### 6.3 When to use “danger red”
Danger red is ONLY for:
- destructive actions (Delete)
- critical quota exceeded warnings
- irreversible actions panels

Not for:
- generic cards
- generic sections
- tabs
- filters

### 6.4 Use “neutral dark” for dense toolbars
If you need contrast (filters toolbar), use a subtle neutral surface (e.g., `surfaceMuted`), not black.

---

## 7) Functionality Rules (No hard-code; filters must work)
### 7.1 Never hard-code dropdown options
**Hard rule:** do not hardcode values like environments, event types, platforms, etc.  
All options must come from:
- API / backend enumeration endpoint, OR
- derived from existing dataset when backend support is not ready

If there is no data, show:
- empty state text: “No environments found”
- disabled control (or hidden), but never fake options

### 7.2 Dashboard filter logic (must be implemented)
#### Env filter
- Source: `environments` for the project
- Selecting env updates:
  - KPI cards
  - time series
  - top issues list
  - inspect table (if in Inspect mode)

#### Time range selector
- Selecting time range updates all aggregated widgets and the inspect stream query time window.
- Must update URL query params (deep-linking). Example:
  - `?env=production&range=24h&mode=overview`

#### Overview vs Inspect mode
- Overview: aggregated panels + charts
- Inspect: raw event stream/table
- Switching modes preserves current filters (env, range, search, type)

#### Inspect “Type” selector (Traces/Logs/Crashes/Sessions)
- Selecting type changes table columns and data source.
- Must not reset env/time unless user changes them.

### 7.3 Devices page logic
- Device list is a wide data view; must support:
  - Search (by deviceId/userId/code)
  - Platform filter
  - Debug filter
  - Category filter (if data exists)
  - Date range filter (registration date)
- “Export Devices”:
  - Must export filtered dataset, not whole dataset.
  - Provide feedback: toast “Export started” / “Export ready”.

### 7.4 Projects page logic
- Cards must reflect live counts (devices/logs/traces/crashes).
- “New Project” CTA:
  - Primary button, opens modal or navigates to create flow.
- Role tag (Owner/Viewer) must be consistent style.

---

## 8) Spacing Rules (Fix “too much space”)
### 8.1 Global spacing scale
Use a consistent spacing scale (e.g., 4/8/12/16/24/32).

### 8.2 Reduce vertical padding for console pages
- Toolbars and filter rows should be compact.
- Cards should not have excessive padding.
- Avoid large empty blocks at top of pages.

### 8.3 Layout rhythm
- Page title area: 16–24px bottom margin
- Toolbars: 12–16px padding
- Section spacing: 16–24px between major blocks

---

## 9) User Journey (What the product should feel like)
### Primary journey
1. **Projects** – see all projects, choose one, create new project
2. **Dashboard (Overview)** – understand health quickly (KPIs + trends)
3. **Dashboard (Inspect)** – drill into raw data stream (type switch: traces/logs/etc.)
4. **Devices** – inspect fleet/device metadata, filter, drill into details
5. **Settings** – configure project and SDK settings (narrow layout)

The layout must support this journey by:
- consistent navigation (sidebar anchored)
- consistent header controls
- predictable filter behavior with deep links

---

## 10) Implementation Checklist (Do in this order)
1. **Refactor AppShell layout**
   - Remove centered wrapper around shell
   - Implement full-width header + sidebar + main
2. **Implement density system**
   - `PageContainer` with `density` prop
   - Apply mapping to Projects/Dashboard/Devices/Settings
3. **Sidebar redesign**
   - Compact header
   - Collapse mode
   - Fix spacing between nav groups
4. **Theme token cleanup**
   - Remove hard-coded blacks/reds
   - Use semantic tokens for danger/warning/success
5. **Make filters actually work**
   - Environment/time range/type/search update queries and UI
   - No hard-coded dropdown values
   - Add URL query param sync
6. **Reduce whitespace**
   - Adjust margins/padding per rules above
   - Ensure tables and cards fill usable width

---

## 11) Acceptance Criteria (How we will judge success)
- Sidebar is anchored left; not centered with content.
- Dashboard and Devices use **wide** layout; tables show more columns without truncation.
- Settings pages are readable with **narrow/normal** layout.
- No odd black blocks; danger red only for destructive/critical.
- Filters (env/time/type/search) actually affect results and persist in URL.
- Dropdown options are dynamic (data-driven) and never hard-coded.
- Visual spacing feels “console-like” and efficient, not sparse.

---

## 12) Deliverables
- Updated `AppShell` + `Sidebar` + `TopHeader`
- `PageContainer` with density modes
- Updated Projects/Dashboard/Devices pages adopting density modes
- Token-based theme cleanup (no hard-coded colors)
- Working filters with URL param sync
