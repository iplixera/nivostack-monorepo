# NivoStack Studio — UI/UX Agent Brief v2 (Menus, Settings, Layout Standards)

**Audience:** Implementation agent (Claude/Cursor).  
**Scope:** Global UI structure across the product, plus Project Settings and per-feature settings placement.  
**Non-scope:** Backend/schema/API naming (assume already known by the codebase).  

## 1) The problem we are solving (what must change)

The current implementation has these fundamental issues:

### A. Navigation duplication and ambiguity
- We effectively have **three navigation systems** at once:
  1) Top bar (project selector + theme + notifications + user info)
  2) Left menu (project sections + counts)
  3) User menu dropdown (subscription/billing + product settings links)
- The user menu currently contains items that feel like **product navigation**, while the left nav also contains product navigation. This creates confusion about “where settings live” and “what is global vs per-project.”

### B. Settings are scattered and mislabeled
- There is a “Project Dashboard” page that contains tabs like **Notifications / Product Features / SDK Settings / Data Cleanup / Project Settings**.
- This is **not a dashboard**. It is a **project configuration area**.
- Per-feature pages (e.g., **Devices**) also have their own “Settings” tab, but the relationship between these and project-level settings is unclear.

### C. Layout wastes space and reduces scanability
- Excess whitespace left/right/top; content column is too narrow.
- Repeated headers and banners consume vertical space.
- Settings pages present large empty areas and place primary actions far away from context.

The result: the UI feels unfinished and “template-like,” and users will not learn the product quickly.

## 2) Target information architecture (IA) and responsibilities

We need a clear separation of concerns:

### A. Account-level (User menu) — “Who am I + billing”
**User menu must only contain account-level items**, for example:
- Profile
- Subscription / Billing / Invoices
- Usage (account-wide)
- Team management (if truly account-level)
- Logout

**User menu must NOT contain navigation that belongs to a project** (e.g., “Developer Guide” is okay if global; “Project settings” and “NivoStack settings” should not be here if they are project-specific).

### B. Project-level (Left nav) — “What am I working on”
The left nav is the primary navigation for the currently selected project.

Recommended left nav groups (conceptual):
- **Overview**
  - Monitoring Dashboard (real metrics)
- **Runtime / Debug**
  - Devices
  - API Traces
  - Sessions
  - Logs
  - Crashes
  - Screen Flow
- **Content**
  - Business Configuration
  - Localization
- **APIs / Tooling**
  - API Config
  - API Mocking
  - Monitoring
  - Cost Analysis
- **Project Settings**
  - Project Settings (single entry)

Rules:
- Section headings are okay, but keep them tight.
- Counts can remain, but should be visually secondary and aligned consistently.
- The left nav should be **sticky** and optionally **collapsible** (icon-only mode) to reclaim horizontal space.

### C. Project Settings is a dedicated area
Rename the current “Project Dashboard” configuration experience to **Project Settings**.

Within **Project Settings**, keep tabs/sections like:
- Notifications
- Product Features (feature enablement)
- SDK Settings (defaults/SDK behavior)
- Data Cleanup (dangerous actions)
- Project Basics (name, API key, environment defaults, etc.)

This resolves the conceptual mismatch: users won’t confuse monitoring dashboard vs configuration.

## 3) Navigation UI rules (top bar, left nav, settings)

### A. Top bar: minimal, contextual, consistent
Top bar should contain ONLY:
- **Project selector** (left)
- **Contextual breadcrumbs** (optional) and page title (either in top bar OR in page header — not both)
- **Utility actions** (right): theme toggle, notifications icon, user menu

Hard rules:
- Do not leave large unused top-bar areas.
- Do not put project-level navigation items in the user menu.
- Avoid repeating “Project Dashboard” header in the body if the top bar already communicates location.

### B. Left nav: the main map
- Left nav is the single source of truth for project navigation.
- Active page highlight must be unambiguous.
- Grouping must reflect product mental model (observe/diagnose/configure).

### C. Settings placement strategy (avoid duplication)
We will support **two kinds** of settings:

1) **Project Settings (global to the project):**
   - Feature enablement (master toggles)
   - Default SDK behavior
   - Alerts/notifications for the project
   - Data retention/cleanup
   - Project keys, rename, delete

2) **Per-feature Settings (local to a feature):**
   - Only settings that **directly affect that feature’s data capture or presentation**.
   - Example: Devices → sampling, capture rules, debug mode policy for devices (if applicable)
   - Example: API Traces → sampling, capture request/response bodies policy (if applicable)

Rules:
- If a setting affects multiple features, it belongs in **Project Settings**.
- If it affects only one feature and a user expects it while working in that feature, it can live inside that feature page.
- Never have the same setting in two places.

## 4) Layout standards (must be applied everywhere)

### A. Use a real content grid, stop centering a narrow column
- Use a responsive max width suited for dashboards (e.g., ~1200–1440px) and allow sections to expand.
- Reduce left/right gutters so content uses available space.

### B. Standard page header pattern
Every page must follow the same header anatomy:
1) **Title (H1)** + optional 1-line description
2) **Context chips** (Mode: Aggregated / Raw, Env, Time Range) — compact
3) **Primary actions** (right aligned): Export, Create, etc.
4) **Filters bar** — one row by default, expandable for advanced filters

Hard rules:
- No repeated titles (“Project Dashboard” inside content if it’s already shown above).
- Banners (trial/quota) must be compact and not push core content far down.

### C. Filters must not dominate the page
- Filters should never take more vertical space than the first visible results/content area.
- Prefer:
  - A compact filter row (search + 2–4 key filters)
  - “More filters” drawer/panel for advanced filters
  - “Saved views” as a secondary control

### D. Empty states must be intentional
When there is no data:
- Show a helpful empty state with:
  - Why it’s empty
  - What to do next (SDK installed? send test event?)
  - Link to setup instructions

## 5) Specific feedback on menus and settings screens (based on current screenshots)

### A. Left menu issues
- The left menu appears as a centered card with large margins; it should be a real sidebar anchored left.
- Counts are visually heavy; reduce prominence (smaller, lighter, right aligned).
- Too much whitespace below the menu; consider sticky/scrollable nav.

Required changes:
- Convert the left “menu card” into a proper sidebar.
- Add collapse behavior (optional).
- Ensure active state is clear and consistent.

### B. User menu (top-right) issues
- The dropdown includes many items that feel like product navigation.

Required changes:
- Keep user menu strictly account-level.
- If “Developer Guide” and “Setup Instructions” are global docs, keep them. Otherwise move them into **Project Settings → Setup**.

### C. Project Settings screen issues
- “Project Dashboard” title is misleading.
- Tabs are fine, but content is too sparse and visually disconnected.

Required changes:
- Rename this area to **Project Settings**.
- Keep tabs, but enforce consistent header + layout.
- Co-locate “Copy API key” inside Project Settings → Keys, and optionally provide a quick-copy in page header.
- The “Danger Zone” section is correct but should be visually separated and placed at the bottom with strong confirmation UX.

### D. Per-feature settings (Devices / API Traces / Logs / Sessions)
- Having “Device List | Settings” tabs is okay, but clarify what belongs there.

Required changes:
- Only keep feature-specific settings here.
- Anything global goes back to Project Settings.
- Ensure the Settings tab uses the same layout pattern as other pages (no giant empty margins).

## 6) Cross-cutting standards for Aggregated vs Raw (Row) views

We support two data modes everywhere:

### Aggregated mode (metrics)
- Goal: answer “What is happening?” quickly.
- Should show:
  - KPI cards (minimal)
  - 1–2 meaningful charts (trend + breakdown)
  - Top issues table (errors, worst endpoints, top devices, etc.)
- Charts must be the primary content, not placeholders.

### Raw mode (rows)
- Goal: answer “What exactly happened?”
- Should show:
  - Filter row (time range always visible)
  - Results table/list with strong density (no huge cards)
  - Drilldown details drawer/page

Rules:
- Switching mode must preserve the user’s time range and key filters.
- Aggregated is the default for “Dashboard.”
- Raw mode is the default for “Devices / Traces / Logs / Sessions / Crashes,” but each should offer an aggregated summary tab/section.

## 7) Acceptance criteria (what “done” looks like)

1) **Only one primary navigation system for project pages:** left nav.
2) **User menu is account-level only.**
3) “Project Dashboard” config area is renamed and moved to **Project Settings**.
4) Clear, non-duplicated settings structure:
   - Project Settings (global)
   - Per-feature Settings (local)
5) Layout is grid-based and uses the screen effectively; no large dead zones.
6) Filters are compact and secondary; results/insights are primary.
7) Page header pattern is consistent across all pages.

## 8) Implementation order (recommended)

1) **Refactor navigation skeleton** (top bar + left nav + user menu) and route structure.
2) Rename/move **Project Dashboard → Project Settings** and ensure tabs render under it.
3) Standardize page header + filters layout components.
4) Apply the settings placement rules to Devices/API Traces/Logs/Sessions.

