# NivoStack — UI/UX Foundation Tickets (v1)

Create GitHub issues **ticket-by-ticket** from this file.
Apply label: `ui-ux` to every ticket.

---

## Ticket 1 — Global Design System + IA Restructure (Light/Dark)
Title: [UI/UX] Global Design System + Light/Dark Themes + Layout Grid + Navigation Restructure
Labels: ui-ux, foundation, priority:P0

Objective
- Establish global design principles and a shared layout system
- Implement Light/Dark/System themes (token-based + persisted)
- Restructure navigation (IA) for clarity
- IMPORTANT: Support both Aggregated dashboards and Raw debugging without conflict

Non-negotiable product constraint (clarified)
NivoStack must support two complementary experiences:
1) Aggregated dashboards for health/trends/funnels/costs (fast, scalable)
2) Raw single-row data for debugging (especially debug-enabled devices) with near real-time updates

Dashboards MUST NOT replace raw views. Instead:
- Dashboards read from rollup/aggregate tables or materialized views
- Every dashboard tile supports drilldown to raw with filters carried over
- Debug devices get a dedicated Live Debug view that reads “recent raw”

Global Design Principles
P1 Scan-first: title+subtitle+primary CTA+quick filters visible
P2 One primary action per page
P3 Progressive disclosure: advanced behind “Advanced”
P4 State clarity: empty/loading/error/no-results/degraded
P5 Performance by design: server pagination, debounced search, virtualization, aggregates for charts

Theme System (Light + Dark + System)
- Token-based variables (bg/surface/text/muted/border/primary/status/shadows/radius)
- Toggle in topbar: Light/Dark/System
- Persist (localStorage or user profile)
- Accessible contrast

Layout Template
- Sidebar (collapsible) + Topbar (sticky) + Main content (max width 1200–1320)
- Page skeleton:
  1) Header (title/subtitle/CTA)
  2) Optional KPI strip
  3) Filter/Search row + More Filters drawer
  4) Tabs (optional)
  5) Content (table/chart/timeline)
  6) Detail drawer (optional)

Navigation Restructure (IA)
- Overview
  - Dashboard Overview
  - Dashboard Analytics
- Observe (Runtime)
  - Devices
  - Sessions & Screen Flow
  - API Traces
  - Logs
  - Crashes
- Control (App Control Plane)
  - Business Config
  - Localization
  - Builds / Versioning
- Operate (Ops & Reliability)
  - Alerts (API, Config)
  - Notifications / Webhooks
  - Monitoring / Health
- Developer
  - SDK Settings
  - API Keys & Environments
  - Mocking (TBD)
- Organization
  - Team
  - Subscription & Billing
  - Account / Profile
  - Admin (role-based)

Global Components (standardize)
- Button system (Primary/Secondary/Danger/Icon/Overflow)
- DataTable (server pagination/sort/columns/bulk/export/detail drawer)
- FilterBar (quick filters + drawer + saved views + URL state)
- Detail Drawer (Overview / Events / Raw / Metadata)
- Chart card container (consistent headers + export)

Dual-mode data UX requirements (aggregated vs raw)
- Introduce explicit “Data Mode” pill:
  - Aggregated (dashboards)
  - Raw (lists/investigations)
  - Live (debug streaming)
- Dashboard tiles must include “View raw” / “Drilldown” actions → routes to raw screens with filters
- Devices must include “Debug enabled” segmentation and “Open Live Debug”
- Live Debug must support:
  - 15m/1h/24h window
  - streaming if available, otherwise polling every 3–5s
  - tabs API/Logs/Crashes/Screen flow
  - redaction visibility + permissions for bodies

Definition of Done
- Light/Dark/System works + persisted
- New IA implemented
- Shared components exist (PageHeader, FilterBar, DataTable, DetailDrawer, KpiStrip)
- At least 2 screens migrated as proof (Devices, API Traces)
- Dashboard drilldown → raw views works
- Live Debug skeleton exists

---

## Ticket 2 — Data UX Contract: Aggregated Dashboards + Raw Debug (No Conflict)
Title: [UI/UX] Define Aggregated vs Raw vs Live UX Contract + Drilldown Rules + Live Debug Entry Points
Labels: ui-ux, data-ux, priority:P0

Goal
- Dashboards stay fast (aggregates)
- Debug stays powerful (raw)
- Switching/drilldown is consistent across modules

Requirements
- Add Data Mode labels across pages:
  - Aggregated for dashboards
  - Raw for traces/logs/devices lists
  - Live for debug streaming
- Every dashboard tile supports:
  - click: aggregated drilldown
  - “View raw”: raw table with filters prefilled
- Define default drilldown mappings:
  - Error-rate tile → API Traces: error=true + time range
  - Crash tile → Crashes: groupId + version
  - Drop-off tile → Sessions: funnel step + screenName
- Live Debug entry points:
  - Device row action: Open Live Debug
  - Alerts should link to Live Debug if device is debug-enabled

Done
- Users can reach raw from every dashboard insight
- Live Debug discoverable from Devices and Alerts

---

## Ticket 3 — Implement new Sidebar/Topbar templates
Title: [UI/UX] Implement Sidebar/Topbar templates + project switcher + responsive behavior
Labels: ui-ux, foundation, priority:P1

---

## Ticket 4 — Theme tokens + toggle (Light/Dark/System)
Title: [UI/UX] Implement theme tokens + toggle + persist selection
Labels: ui-ux, foundation, priority:P1

---

## Ticket 5 — Reusable DataTable
Title: [UI/UX] Build reusable DataTable (server pagination/sort/columns/bulk/export/detail drawer)
Labels: ui-ux, components, priority:P1

---

## Ticket 6 — Reusable FilterBar + More Filters + Saved Views
Title: [UI/UX] Build FilterBar (quick filters + drawer + saved views + URL state)
Labels: ui-ux, components, priority:P1

---

## Ticket 7 — Dashboard Overview (Aggregated)
Title: [UI/UX] Dashboard Overview redesign (aggregated KPIs, trends, drilldown to raw)
Labels: ui-ux, dashboard, priority:P1

---

## Ticket 8 — Devices redesign (Raw)
Title: [UI/UX] Devices redesign (segmentation, filters, detail drawer, debug actions)
Labels: ui-ux, runtime, priority:P1

---

## Ticket 9 — Live Debug (Live)
Title: [UI/UX] Live Debug screen (raw event feed for debug-enabled devices)
Labels: ui-ux, runtime, priority:P1

---

## Ticket 10 — API Traces redesign (Raw)
Title: [UI/UX] API Traces redesign (raw list, advanced filters, detail drawer, redaction controls)
Labels: ui-ux, runtime, priority:P1