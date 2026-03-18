# SmartSwarm AlertIQ – Functional Architecture & API Flow

## 1. Overview

This document defines the functional structure of the AlertIQ frontend and how it interacts with backend APIs.

The system is designed as a **data-driven, modular UI**, where each section renders dynamically based on API responses.

---

## 2. Application Structure

The frontend is divided into 4 primary modules:

1. Executive Dashboard
2. Investigative Workspace
3. Topology View
4. Conversational Triage

Each module consumes specific backend APIs.

---

## 3. Core Data Flow

### Step 1: Fetch Incidents
API:
GET /incidents

Purpose:
- Load all active clusters/incidents

Used in:
- Executive Dashboard

---

### Step 2: Select Incident

User clicks an incident → store `incident_id`

This triggers:

GET /incident/{id}

---

### Step 3: Load Investigation Data

API:
GET /incident/{id}

Expected Response:
- timeline_events
- root_cause
- confidence_score
- blast_radius
- summary

Used in:
- Investigative Workspace

---

### Step 4: Load Topology

API:
GET /topology/{incident_id}

Expected:
- nodes (services)
- edges (dependencies)
- status (healthy/impacted/root)

Used in:
- Topology View

---

### Step 5: Chat Interaction

API:
POST /chat

Payload:
{
  "incident_id": "CL-001",
  "query": "What caused this issue?"
}

Response:
{
  "answer": "Root cause explanation..."
}

Used in:
- Conversational Triage

---

## 4. Module Functional Breakdown

---

### 4.1 Executive Dashboard

Functions:
- Display high-level metrics
- Show incident clusters

Components:
- Active Clusters Card
- Critical Alerts Card
- Impacted Services Card
- Incident List

APIs:
- GET /incidents

---

### 4.2 Investigative Workspace

Functions:
- Deep analysis of selected incident
- Correlate events and insights

Components:
- Incident Header
- Timeline
- Root Cause Panel
- Blast Radius Panel
- Summary Panel

APIs:
- GET /incident/{id}

Behavior:
- Dynamic rendering based on available fields
- Supports partial loading

---

### 4.3 Topology View

Functions:
- Visualize dependencies and impact propagation

Components:
- Graph (nodes + edges)
- Legend (status indicators)

APIs:
- GET /topology/{id}

Behavior:
- Highlight root cause node
- Highlight impacted services

---

### 4.4 Conversational Triage

Functions:
- Provide AI-driven assistance
- Enable natural language interaction

Components:
- Chat window
- Suggested queries
- Response display

APIs:
- POST /chat

Behavior:
- Context-aware responses using incident_id

---

## 5. Real-Time Updates

Mechanism:
- WebSockets or polling

Events:
- New alerts
- Updated analysis
- Incident status changes

---

## 6. State Management

Global State:
- selectedIncidentId
- incidentData
- loadingStates

Each module reacts to state changes.

---

## 7. Error Handling

Frontend must handle:
- API failure
- Empty data
- Partial data

Examples:
- “No root cause available”
- “Analysis in progress”

---

## 8. Loading Strategy

Since agents run in parallel:

UI should support:
- Incremental updates
- Skeleton loaders

Examples:
- “Analyzing root cause…”
- “Predicting impact…”

---

## 9. Scalability Considerations

- Pagination for alerts
- Lazy loading for topology
- Virtualized lists for large data

---

## 10. Summary

The frontend should:
- Be modular
- Be data-driven
- Handle async updates
- Provide clear user flow across all layers