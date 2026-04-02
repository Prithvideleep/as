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
- **Client-side routing** for Home (dashboard), dedicated list pages (incidents, history, alert details, changes), incident digest, investigation, and topology; global state for the **active incident** and **triage drawer** context.
- **Presentation-only** today: incident lists, timelines, blast radius, topology graph, and chat responses are driven by **structured mock data** (`alertiq/src/data/mockData.ts`), designed to map cleanly to future REST/GraphQL payloads from the Observability Platform API layer described in the backend LLD.

---

## 1.1 Architecture Overview

| Layer | Responsibility |
|--------|----------------|
| **Shell** | `AppLayout`: persistent sidebar navigation, main content region, mobile top bar, floating entry to **Conversational Triage**. |
| **Routing** | `react-router-dom`: `/` (Home), `/incidents`, `/history`, `/alert-details`, `/incident-details`, `/changes`, `/investigation`, `/topology`; legacy `/chat` → `/?triage=1`. |
| **State** | `AppContext`: selected incident, derived incident detail, topology slice for current incident, pending chat context from Investigation. `TriageDrawerContext`: drawer open/close and cross-route triage handoff. |
| **Presentation** | Page-level composition; reusable **dashboard**, **investigation**, **topology**, and **triage** components; **Framer Motion** for transitions. |
| **Styling** | Design tokens in CSS (`--color-*`, `--page-pad`); light theme; consistent card, border, and accent (**#EB5928**). |
| **Persistence (UX)** | Legacy dashboard layout prefs (`alertiq-dashboard-layout-v1`) are **cleared on Home load** after the MVP redesign; no section swap/collapse UI on Home (Phase 2 may reintroduce prefs). |

**Intended backend integration:** Replace mock imports with API clients; preserve TypeScript interfaces (or generate types from OpenAPI) so panels continue to render **incidents**, **details**, **clusters**, and **topology** from the grouped-incident and enrichment APIs.

---

## 2. Application Shell & Global Navigation

**Screenshot (recommended):**  
`docs/screenshots/01-app-shell-sidebar.png` — full viewport showing sidebar + main area (e.g. Home selected).

- **Sidebar** (`Sidebar.tsx`): **Home**, **Incidents**, **Changes**, **Alert details**, **History**, **Investigation**, **Topology**; active route highlighting; collapsible / overlay behavior on narrow viewports (`AppLayout` + `mobile-topbar`).
- **Main:** `Outlet` renders the active page; scroll ownership per page.
- **Conversational Triage:** FAB opens **TriageDrawer**; slide-over panel hosts **ConversationalTriagePanel** (incident-scoped or general chat, history). `/chat` redirects to `/?triage=1` for bookmark compatibility.

---

## 3. Primary Screens

### 3.1 Home / Dashboard (`/` — `DashboardPage.tsx`)

**Purpose:** Mock-aligned operational overview — **selection criteria** (date, alert-level time window, scope placeholder, refresh), a **three-tile row** (alert level, trending clustered alerts, trending P1/P2 incidents), and the primary **Alert correlated details** table with CSV export.

**Screenshot (recommended):**  
`docs/screenshots/02-dashboard-home-mvp.png` — criteria bar, three tiles, correlated table (desktop width).

**Screenshot (recommended):**  
`docs/screenshots/03-dashboard-home-narrow.png` — same regions stacked / wrapped on narrow viewports (`repeat(auto-fit, minmax(240px, 1fr))` for the tile row).

**Major UI blocks:**

| Block | Behavior |
|--------|-----------|
| **Selection criteria** | `SelectionCriteriaBar`: note that criteria apply to all Home tiles; optional date; time window select drives **Alert Level** snapshot only (historical slices from `historicalAlertSnapshots`); disabled scope dropdown (Phase 2); Refresh. |
| **Alert level** | `AlertLevelBar` in a card; snapshot + refresh when Live. |
| **Trending clustered alerts** | `TrendingClustersStrip`: up to 5 clusters from `correlationClusters`; click → **Investigation** with incident context. |
| **Trending incidents (P1/P2)** | `TrendingP1P2IncidentsStrip`: critical/high open incidents, newest first; click → **`/incident-details`** with incident context. |
| **Alert correlated details** | `AlertCorrelatedDetailsTable`: rows from `buildCorrelatedDetailsRows` (clusters + incidents + `incidentDetails`); **Export CSV**; History column links to **`/history`**. |

**Moved off Home (dedicated routes):** All incidents (`/incidents`), resolution log (`/history`), alert details + level (`/alert-details`). No right rail, no dashboard detail drawer (use **`/incident-details`** for a compact digest).

---

### 3.2 All incidents (`/incidents` — `IncidentsPage.tsx`)

**Purpose:** Full `AllIncidentsPanel`; row opens **Investigation** with selected incident.

**Screenshot (recommended):**  
`docs/screenshots/04-incidents-page.png` — filters and table visible.

---

### 3.3 History (`/history` — `HistoryPage.tsx`)

**Purpose:** `ResolutionLogPanel` for resolved incidents; search and open **Investigation**.

**Screenshot (recommended):**  
`docs/screenshots/05-history-page.png` — resolution log with toolbar.

---

### 3.4 Alert details (`/alert-details` — `AlertDetailsPage.tsx`)

**Purpose:** `AlertDetailsPanel` + embedded `AlertLevelBar`; same time-window behavior as Home for the level snapshot.

**Screenshot (recommended):**  
`docs/screenshots/06-alert-details-page.png` — accordion levels + level bar.

---

### 3.5 Incident details (`/incident-details` — `IncidentDetailsPage.tsx`)

**Purpose:** Incident selector + summary, top hypothesis, impacted services list; **Open full investigation** → `/investigation`.

**Screenshot (recommended):**  
`docs/screenshots/07-incident-details-page.png` — selector + digest card.

---

### 3.6 Changes (`/changes` — `ChangesPage.tsx`)

**Purpose:** Mock table of **change**-type timeline events aggregated from `incidentDetails` (placeholder for CMDB / change correlation).

**Screenshot (recommended):**  
`docs/screenshots/08-changes-page.png` — table of change rows.

---

### 3.7 Investigation (`/investigation` — `InvestigationPage.tsx`)

**Purpose:** Deep dive for the **incident selected in context** (from Home, lists, or in-page selector): narrative summary, root causes, timeline, blast radius, historical references, and shortcuts to triage / topology.

**Screenshot (recommended):**  
`docs/screenshots/09-investigation-full.png` — full page with header, summary, root causes, timeline + blast radius grid.

**Components:**

- **IncidentHeader** / selector — ties to `AppContext.incidentData`.
- **SummaryPanel** — plain-language summary.
- **RootCausePanel** — ranked root causes.
- **Timeline** + **BlastRadiusPanel** — responsive two-column grid.
- **HistoricalRefPanel** — past incident references.
- **Discuss in Triage** — seeds triage with investigation context (`pendingChatContext`).
- **View Topology** — navigates to `/topology` with same incident context.

---

### 3.8 Topology (`/topology` — `TopologyPage.tsx`)

**Purpose:** Service dependency graph for the **current incident’s** topology slice; node selection opens a **detail panel**; root-cause services visually emphasized.

**Screenshot (recommended):**  
`docs/screenshots/10-topology-graph.png` — dark graph canvas, legend, stats bar, optional node panel open.

**Components:**

- **IncidentSelector** — switch incident context (updates topology + investigation data in context).
- **TopologyStatsBar** — high-level counts / health signals from mock topology.
- **TopologyGraph** — interactive graph (pan/zoom, node click).
- **TopologyLegend** — node/edge semantics.
- **TopologyNodePanel** — slide-in details for selected node.

---

### 3.9 Conversational Triage (overlay — `TriageDrawer` + `ConversationalTriagePanel.tsx`)

**Purpose:** Guided Q&A over general ops or **incident-scoped** mock knowledge base; session history; context handoff from Investigation.

**Screenshot (recommended):**  
`docs/screenshots/11-triage-drawer.png` — drawer open, Active Chat tab, incident selector visible.

**Notes:** Responses today map from **keyword → canned answers** (`chatResponses` in mock data). Replace with **Sage / LLM API** calls per backend AI strategy; preserve session UX and incident binding.

---

## 4. Data & Integration Map (Frontend View)

| UI surface | Current source | Future backend alignment |
|------------|----------------|---------------------------|
| Incident list / severity | `mockData.incidents` | Grouped incidents API (pagination, filters). |
| Incident detail | `incidentDetails[id]` | Incident detail / timeline / blast radius endpoints. |
| Clusters | `correlationClusters` | Correlation or AI grouping API. |
| Alert level snapshot | `alertLevelSnapshot`, historical slices | Metrics / snapshot API. |
| Correlated table rows | Derived in `buildCorrelatedDetailsRows` | Enriched correlation / CMDB / change APIs. |
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
| 1 | `01-app-shell-sidebar.png` | Sidebar + Home main |
| 2 | `02-dashboard-home-mvp.png` | Home: criteria + 3 tiles + correlated table |
| 3 | `03-dashboard-home-narrow.png` | Home on narrow viewport (wrapped tiles) |
| 4 | `04-incidents-page.png` | Incidents list page |
| 5 | `05-history-page.png` | History / resolution log |
| 6 | `06-alert-details-page.png` | Alert details page |
| 7 | `07-incident-details-page.png` | Incident details digest |
| 8 | `08-changes-page.png` | Changes table |
| 9 | `09-investigation-full.png` | Investigation page |
| 10 | `10-topology-graph.png` | Topology with graph + optional panel |
| 11 | `11-triage-drawer.png` | Triage drawer open |

---

## 7. Document Control

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-03-31 | Frontend | Initial LLD aligned with `alertiq` codebase |
| 1.1 | 2026-04-02 | Frontend | MVP Home redesign: routes, sidebar IA, screenshot checklist |

---

*This document is the frontend counterpart to the backend Observability Platform LLD: together they describe ingestion → storage → API → **AlertIQ UI** for incident operations.*
