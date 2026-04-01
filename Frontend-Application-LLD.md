# AlertIQ Frontend — Application Design Document

**Product:** AlertIQ (SmartSwarm)  
**Document type:** Low-Level Design (LLD) — Presentation Layer  
**Audience:** Engineering, Product, Backend integration, QA  
**Companion:** Backend / platform LLD (`demodocument.md` — observability ingestion, enrichment, API)

---

## 1. Introduction

This document describes the **AlertIQ web client**: information architecture, primary screens, component responsibilities, and how the UI consumes data today (mock) and is intended to consume **backend APIs** when available. It complements the backend LLD by defining the **end-to-end contract from the user’s perspective** — from incident discovery on the dashboard through investigation, topology, and conversational triage.

**System context (frontend scope):**

- Single-page application (**SPA**) delivered as static assets; **React 19** + **TypeScript** + **Vite**.
- **Client-side routing** for Dashboard, Investigation, and Topology; global state for the **active incident** and **triage drawer** context.
- **Presentation-only** today: incident lists, timelines, blast radius, topology graph, and chat responses are driven by **structured mock data** (`alertiq/src/data/mockData.ts`), designed to map cleanly to future REST/GraphQL payloads from the Observability Platform API layer described in the backend LLD.

---

## 1.1 Architecture Overview

| Layer | Responsibility |
|--------|----------------|
| **Shell** | `AppLayout`: persistent sidebar navigation, main content region, mobile top bar, floating entry to **Conversational Triage**. |
| **Routing** | `react-router-dom`: `/` (Dashboard), `/investigation`, `/topology`; legacy paths redirect (`/chat` → dashboard with triage). |
| **State** | `AppContext`: selected incident, derived incident detail, topology slice for current incident, pending chat context from Investigation. `TriageDrawerContext`: drawer open/close and cross-route triage handoff. |
| **Presentation** | Page-level composition; reusable **dashboard**, **investigation**, **topology**, and **triage** components; **Framer Motion** for transitions. |
| **Styling** | Design tokens in CSS (`--color-*`, `--page-pad`); light theme; consistent card, border, and accent (**#EB5928**). |
| **Persistence (UX)** | Dashboard **layout preferences** (`localStorage`, `dashboardLayoutPrefs.ts`): column swap, section collapse, mobile section order. |

**Intended backend integration:** Replace mock imports with API clients; preserve TypeScript interfaces (or generate types from OpenAPI) so panels continue to render **incidents**, **details**, **clusters**, and **topology** from the grouped-incident and enrichment APIs.

---

## 2. Application Shell & Global Navigation

**Screenshot (recommended):**  
`docs/screenshots/01-app-shell-sidebar.png` — full viewport showing sidebar + main area (e.g. Dashboard selected).

- **Sidebar** (`Sidebar.tsx`): Dashboard, Investigation, Topology; active route highlighting; collapsible / overlay behavior on narrow viewports (`AppLayout` + `mobile-topbar`).
- **Main:** `Outlet` renders the active page; scroll ownership per page (dashboard wide layout vs full-height topology).
- **Conversational Triage:** FAB opens **TriageDrawer**; slide-over panel hosts **ConversationalTriagePanel** (incident-scoped or general chat, history). `/chat` redirects to `/?triage=1` for bookmark compatibility.

---

## 3. Primary Screens

### 3.1 Dashboard (`/` — `DashboardPage.tsx`)

**Purpose:** Operational overview — correlated clusters, alert levels, impacted services, resolution log, all incidents; supports **layout customization** and **drill-down** preview drawer.

**Screenshot (recommended):**  
`docs/screenshots/02-dashboard-wide.png` — wide layout: two-column grid (Top Alert Clusters + Recent alerts / Alert Level), right rail (Impacted Services, Resolution log), header with time window and Layout menu.

**Screenshot (recommended):**  
`docs/screenshots/03-dashboard-narrow.png` — viewport &lt; 901px: stacked sections per user order preferences.

**Major UI blocks:**

| Block | Behavior |
|--------|-----------|
| **Top Alert Clusters** | `CorrelationTile`: expandable rows, severity, affected services, investigate → Investigation route. Cluster expand syncs **Alert Details** level + row highlight (same incident). |
| **Recent alerts** | Unified card with **Alert Details** (`AlertDetailsPanel`) + **Alert Level** (`AlertLevelBar`); optional historical snapshot from header control. |
| **Impacted Services** | `IncidentTile`: services aggregated from active incidents’ blast radius; expand row lists **incidents affecting that service** only (no cross-link to correlation). |
| **Resolution log** | `ResolutionLogPanel`: search, pagination, resolved incidents. |
| **All Incidents** | `AllIncidentsPanel`: filters, sort, pagination, time range (default all time). |
| **Detail drawer** | `DashboardDetailDrawer`: quick incident read without leaving dashboard; open full Investigation. |

**Layout menu:** Swap correlation/alerts columns (wide); collapse sections; mobile stack presets — persisted locally.

---

### 3.2 Investigation (`/investigation` — `InvestigationPage.tsx`)

**Purpose:** Deep dive for the **incident selected in context** (from dashboard or in-page selector): narrative summary, root causes, timeline, blast radius, historical references, and shortcuts to triage / topology.

**Screenshot (recommended):**  
`docs/screenshots/04-investigation-full.png` — full page with header, summary, root causes, timeline + blast radius grid.

**Components:**

- **IncidentHeader** / selector — ties to `AppContext.incidentData`.
- **SummaryPanel** — plain-language summary.
- **RootCausePanel** — ranked root causes.
- **Timeline** + **BlastRadiusPanel** — responsive two-column grid.
- **HistoricalRefPanel** — past incident references.
- **Discuss in Triage** — seeds triage with investigation context (`pendingChatContext`).
- **View Topology** — navigates to `/topology` with same incident context.

---

### 3.3 Topology (`/topology` — `TopologyPage.tsx`)

**Purpose:** Service dependency graph for the **current incident’s** topology slice; node selection opens a **detail panel**; root-cause services visually emphasized.

**Screenshot (recommended):**  
`docs/screenshots/05-topology-graph.png` — dark graph canvas, legend, stats bar, optional node panel open.

**Components:**

- **IncidentSelector** — switch incident context (updates topology + investigation data in context).
- **TopologyStatsBar** — high-level counts / health signals from mock topology.
- **TopologyGraph** — interactive graph (pan/zoom, node click).
- **TopologyLegend** — node/edge semantics.
- **TopologyNodePanel** — slide-in details for selected node.

---

### 3.4 Conversational Triage (overlay — `TriageDrawer` + `ConversationalTriagePanel.tsx`)

**Purpose:** Guided Q&A over general ops or **incident-scoped** mock knowledge base; session history; context handoff from Investigation.

**Screenshot (recommended):**  
`docs/screenshots/06-triage-drawer.png` — drawer open, Active Chat tab, incident selector visible.

**Notes:** Responses today map from **keyword → canned answers** (`chatResponses` in mock data). Replace with **Sage / LLM API** calls per backend AI strategy; preserve session UX and incident binding.

---

## 4. Data & Integration Map (Frontend View)

| UI surface | Current source | Future backend alignment |
|------------|----------------|---------------------------|
| Incident list / severity | `mockData.incidents` | Grouped incidents API (pagination, filters). |
| Incident detail | `incidentDetails[id]` | Incident detail / timeline / blast radius endpoints. |
| Clusters | `correlationClusters` | Correlation or AI grouping API. |
| Alert level snapshot | `alertLevelSnapshot`, historical slices | Metrics / snapshot API. |
| Topology | `topologyForIncident` (derived in context) | Topology or graph API keyed by incident/service. |
| Chat | `chatResponses`, `suggestedQueries` | Conversational / RAG API. |

---

## 5. Non-Functional Notes

- **Accessibility:** Semantic routes, dialog roles on drawers, `aria-expanded` / labels on key controls; further audit recommended before GA.
- **Performance:** Large bundles may benefit from route-based code splitting when API layers land.
- **Security:** No secrets in client; all future auth via standard tokens / cookies as defined by platform IAM.

---

## 6. Screenshot Capture Checklist

Place images under **`docs/screenshots/`** (create folder if missing) and keep filenames stable so this doc can link to them in Confluence/PDF exports.

| # | Filename | Capture |
|---|----------|---------|
| 1 | `01-app-shell-sidebar.png` | Sidebar + Dashboard main |
| 2 | `02-dashboard-wide.png` | Full wide dashboard |
| 3 | `03-dashboard-narrow.png` | Mobile / narrow stack |
| 4 | `04-investigation-full.png` | Investigation page |
| 5 | `05-topology-graph.png` | Topology with graph + optional panel |
| 6 | `06-triage-drawer.png` | Triage drawer open |

**Optional:** `07-dashboard-layout-menu.png` (Layout dropdown open), `08-all-incidents-panel.png` (filters visible).

---

## 7. Document Control

| Version | Date | Author | Notes |
|---------|------|--------|--------|
| 1.0 | 2026-03-31 | Frontend | Initial LLD aligned with `alertiq` codebase |

---

*This document is the frontend counterpart to the backend Observability Platform LLD: together they describe ingestion → storage → API → **AlertIQ UI** for incident operations.*
