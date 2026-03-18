export type Severity = "critical" | "high" | "medium" | "low";

export interface Incident {
  id: string;
  name: string;
  severity: Severity;
  status: "active" | "investigating" | "resolved";
  alertCount: number;
  impactedServices: number;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  type: "alert" | "change" | "anomaly";
  title: string;
  description: string;
  timestamp: string;
  source: string;
}

export interface RootCause {
  service: string;
  description: string;
  confidence: number;
}

export interface BlastRadiusItem {
  service: string;
  severity: Severity;
  impact: string;
}

export interface IncidentDetail {
  id: string;
  name: string;
  severity: Severity;
  status: "active" | "investigating" | "resolved";
  summary: string;
  rootCause: RootCause;
  timeline: TimelineEvent[];
  blastRadius: BlastRadiusItem[];
}

export type NodeType = "service" | "database" | "api" | "application" | "infrastructure" | "pipeline";
export type EdgeType = "dependency" | "data-flow" | "communication";

export interface TopologyNode {
  id: string;
  label: string;
  status: "root" | "impacted" | "healthy";
  type: NodeType;
  description: string;
}

export interface TopologyEdge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface ChatQA {
  keywords: string[];
  answer: string;
}

// ─── Incidents (executive dashboard) ───

export const incidents: Incident[] = [
  {
    id: "CL-001",
    name: "Payment Service Cascade Failure",
    severity: "critical",
    status: "active",
    alertCount: 47,
    impactedServices: 8,
    timestamp: "2026-03-17T09:14:00Z",
  },
  {
    id: "CL-002",
    name: "Auth Token Expiry Storm",
    severity: "high",
    status: "investigating",
    alertCount: 23,
    impactedServices: 5,
    timestamp: "2026-03-17T08:42:00Z",
  },
  {
    id: "CL-003",
    name: "CDN Cache Invalidation Spike",
    severity: "medium",
    status: "active",
    alertCount: 12,
    impactedServices: 3,
    timestamp: "2026-03-17T07:58:00Z",
  },
  {
    id: "CL-004",
    name: "Database Connection Pool Exhaustion",
    severity: "critical",
    status: "investigating",
    alertCount: 34,
    impactedServices: 6,
    timestamp: "2026-03-17T06:30:00Z",
  },
  {
    id: "CL-005",
    name: "DNS Resolution Latency",
    severity: "low",
    status: "resolved",
    alertCount: 5,
    impactedServices: 2,
    timestamp: "2026-03-17T05:15:00Z",
  },
];

// ─── Incident details ───

export const incidentDetails: Record<string, IncidentDetail> = {
  "CL-001": {
    id: "CL-001",
    name: "Payment Service Cascade Failure",
    severity: "critical",
    status: "active",
    summary:
      "A misconfigured rate limiter on the payment gateway caused requests to queue, leading to timeouts across downstream services. The blast radius expanded to order processing, notification, and billing services within 12 minutes.",
    rootCause: {
      service: "payment-gateway",
      description:
        "Rate limiter configuration change at 09:02 UTC reduced max concurrent requests from 500 to 50, causing immediate request queuing and cascading timeouts.",
      confidence: 94,
    },
    timeline: [
      {
        id: "t1",
        type: "change",
        title: "Config deployment on payment-gateway",
        description: "Rate limiter max_concurrent changed from 500 to 50",
        timestamp: "09:02",
        source: "ArgoCD",
      },
      {
        id: "t2",
        type: "anomaly",
        title: "Latency spike detected",
        description: "p99 latency jumped from 120ms to 4200ms",
        timestamp: "09:05",
        source: "Datadog",
      },
      {
        id: "t3",
        type: "alert",
        title: "Payment timeout errors",
        description: "Error rate exceeded 45% threshold",
        timestamp: "09:08",
        source: "PagerDuty",
      },
      {
        id: "t4",
        type: "alert",
        title: "Order service degraded",
        description: "Downstream dependency failure detected",
        timestamp: "09:11",
        source: "Prometheus",
      },
      {
        id: "t5",
        type: "anomaly",
        title: "Connection pool saturation",
        description: "Active connections hit 100% capacity",
        timestamp: "09:14",
        source: "Grafana",
      },
    ],
    blastRadius: [
      { service: "payment-gateway", severity: "critical", impact: "Root cause — request queuing" },
      { service: "order-service", severity: "critical", impact: "Timeout on payment calls" },
      { service: "billing-service", severity: "high", impact: "Invoice generation delayed" },
      { service: "notification-service", severity: "high", impact: "Email/SMS delivery stalled" },
      { service: "user-dashboard", severity: "medium", impact: "Slow page loads" },
      { service: "analytics-pipeline", severity: "medium", impact: "Event ingestion lag" },
      { service: "inventory-service", severity: "low", impact: "Stale stock counts" },
      { service: "search-service", severity: "low", impact: "Minor indexing delay" },
    ],
  },
  "CL-002": {
    id: "CL-002",
    name: "Auth Token Expiry Storm",
    severity: "high",
    status: "investigating",
    summary:
      "A batch of auth tokens issued with incorrect TTL expired simultaneously, causing a surge of re-authentication requests that overwhelmed the identity provider.",
    rootCause: {
      service: "identity-provider",
      description:
        "Token issuance bug set TTL to 30 seconds instead of 30 minutes for tokens issued between 07:00–08:00 UTC.",
      confidence: 87,
    },
    timeline: [
      {
        id: "t1",
        type: "change",
        title: "Identity service v2.4.1 deployed",
        description: "New token refresh logic introduced",
        timestamp: "07:00",
        source: "Jenkins",
      },
      {
        id: "t2",
        type: "anomaly",
        title: "Token refresh rate spike",
        description: "10x normal refresh rate observed",
        timestamp: "08:30",
        source: "Datadog",
      },
      {
        id: "t3",
        type: "alert",
        title: "Identity provider CPU at 98%",
        description: "Auto-scaling triggered but insufficient",
        timestamp: "08:35",
        source: "CloudWatch",
      },
      {
        id: "t4",
        type: "alert",
        title: "Login failures rising",
        description: "Users unable to authenticate",
        timestamp: "08:42",
        source: "PagerDuty",
      },
    ],
    blastRadius: [
      { service: "identity-provider", severity: "high", impact: "CPU saturation" },
      { service: "api-gateway", severity: "high", impact: "Auth validation failures" },
      { service: "user-dashboard", severity: "medium", impact: "Session drops" },
      { service: "mobile-api", severity: "medium", impact: "Token refresh loops" },
      { service: "admin-portal", severity: "low", impact: "Intermittent auth errors" },
    ],
  },
  "CL-003": {
    id: "CL-003",
    name: "CDN Cache Invalidation Spike",
    severity: "medium",
    status: "active",
    summary:
      "Automated content pipeline triggered mass cache invalidation across CDN edge nodes, causing temporary origin overload and increased latency for static assets.",
    rootCause: {
      service: "content-pipeline",
      description:
        "Bulk publish event invalidated 12,000 cache keys simultaneously instead of using staggered invalidation.",
      confidence: 78,
    },
    timeline: [
      {
        id: "t1",
        type: "change",
        title: "Bulk content publish triggered",
        description: "12,000 articles marked for re-publish",
        timestamp: "07:45",
        source: "CMS",
      },
      {
        id: "t2",
        type: "anomaly",
        title: "Cache hit ratio dropped to 12%",
        description: "Normal baseline is 94%",
        timestamp: "07:50",
        source: "Cloudflare",
      },
      {
        id: "t3",
        type: "alert",
        title: "Origin server load critical",
        description: "Request rate 8x normal",
        timestamp: "07:58",
        source: "Prometheus",
      },
    ],
    blastRadius: [
      { service: "content-pipeline", severity: "medium", impact: "Mass invalidation source" },
      { service: "cdn-edge", severity: "medium", impact: "Cache miss storm" },
      { service: "origin-server", severity: "high", impact: "CPU/memory overload" },
    ],
  },
  "CL-004": {
    id: "CL-004",
    name: "Database Connection Pool Exhaustion",
    severity: "critical",
    status: "investigating",
    summary:
      "A long-running query from a reporting job held connections open, exhausting the shared connection pool and blocking all transactional queries.",
    rootCause: {
      service: "reporting-service",
      description:
        "Scheduled report query missing LIMIT clause scanned 48M rows, holding 120 connections for 22 minutes.",
      confidence: 91,
    },
    timeline: [
      {
        id: "t1",
        type: "change",
        title: "Reporting cron job started",
        description: "Monthly aggregate report triggered",
        timestamp: "06:00",
        source: "Cron",
      },
      {
        id: "t2",
        type: "anomaly",
        title: "Connection pool at 95%",
        description: "Available connections dropping rapidly",
        timestamp: "06:15",
        source: "PgBouncer",
      },
      {
        id: "t3",
        type: "alert",
        title: "Connection pool exhausted",
        description: "All 200 connections in use",
        timestamp: "06:22",
        source: "Prometheus",
      },
      {
        id: "t4",
        type: "alert",
        title: "API 503 errors surging",
        description: "Services unable to acquire DB connections",
        timestamp: "06:30",
        source: "PagerDuty",
      },
    ],
    blastRadius: [
      { service: "reporting-service", severity: "critical", impact: "Long-running queries" },
      { service: "postgres-primary", severity: "critical", impact: "Pool exhaustion" },
      { service: "order-service", severity: "high", impact: "Cannot read/write orders" },
      { service: "user-service", severity: "high", impact: "Profile queries failing" },
      { service: "inventory-service", severity: "medium", impact: "Stock updates blocked" },
      { service: "search-service", severity: "low", impact: "Index refresh delayed" },
    ],
  },
  "CL-005": {
    id: "CL-005",
    name: "DNS Resolution Latency",
    severity: "low",
    status: "resolved",
    summary:
      "Upstream DNS provider experienced brief resolution latency, resolved automatically after provider-side fix.",
    rootCause: {
      service: "external-dns",
      description: "Upstream DNS provider infrastructure issue caused 200ms additional resolution latency.",
      confidence: 65,
    },
    timeline: [
      {
        id: "t1",
        type: "anomaly",
        title: "DNS lookup latency increased",
        description: "Average resolution time 350ms vs 30ms baseline",
        timestamp: "05:10",
        source: "Synthetic Monitor",
      },
      {
        id: "t2",
        type: "alert",
        title: "External health check failures",
        description: "Intermittent timeout on DNS-dependent checks",
        timestamp: "05:15",
        source: "Uptime Robot",
      },
    ],
    blastRadius: [
      { service: "external-dns", severity: "low", impact: "Resolution delays" },
      { service: "api-gateway", severity: "low", impact: "Slightly elevated latency" },
    ],
  },
};

// ─── Topology data per incident ───

export const topologyData: Record<string, TopologyData> = {
  "CL-001": {
    nodes: [
      { id: "payment-gateway",      label: "Payment Gateway",      status: "root",     type: "service",        description: "Core payment processing service. Handles all transaction requests from the user dashboard and downstream order flow." },
      { id: "user-dashboard",       label: "User Dashboard",       status: "impacted", type: "application",    description: "Customer-facing web application. Initiates payment and order requests on behalf of end users." },
      { id: "analytics-pipeline",   label: "Analytics Pipeline",   status: "impacted", type: "pipeline",       description: "Streams transaction events from the payment gateway for real-time reporting and analytics." },
      { id: "order-service",        label: "Order Service",        status: "impacted", type: "service",        description: "Manages order lifecycle. Depends on payment gateway confirmation before fulfilling orders." },
      { id: "billing-service",      label: "Billing Service",      status: "impacted", type: "service",        description: "Generates invoices based on confirmed payments. Blocked when payment gateway is unresponsive." },
      { id: "notification-service", label: "Notification Service", status: "impacted", type: "service",        description: "Dispatches email and SMS alerts for order and billing events. Queued messages are stalling." },
      { id: "inventory-service",    label: "Inventory Service",    status: "healthy",  type: "service",        description: "Tracks product stock levels. Receives stock reservation events from the order service." },
      { id: "search-service",       label: "Search Service",       status: "healthy",  type: "service",        description: "Product search and indexing. Consumes inventory updates but not directly in the payment path." },
    ],
    edges: [
      { source: "user-dashboard",     target: "payment-gateway",      type: "dependency",    label: "REST API" },
      { source: "user-dashboard",     target: "order-service",         type: "dependency",    label: "REST API" },
      { source: "analytics-pipeline", target: "payment-gateway",       type: "data-flow",     label: "Event stream" },
      { source: "payment-gateway",    target: "order-service",         type: "communication", label: "Webhook" },
      { source: "payment-gateway",    target: "billing-service",       type: "communication", label: "Webhook" },
      { source: "order-service",      target: "notification-service",  type: "data-flow",     label: "Message queue" },
      { source: "order-service",      target: "inventory-service",     type: "dependency",    label: "REST API" },
      { source: "billing-service",    target: "notification-service",  type: "data-flow",     label: "Message queue" },
      { source: "search-service",     target: "inventory-service",     type: "data-flow",     label: "Event stream" },
    ],
  },
  "CL-002": {
    nodes: [
      { id: "identity-provider", label: "Identity Provider", status: "root",     type: "service",     description: "Issues and validates auth tokens. Deployed v2.4.1 which introduced a TTL bug causing mass token expiry." },
      { id: "api-gateway",       label: "API Gateway",       status: "impacted", type: "api",         description: "Central API gateway that validates bearer tokens on every request. Dependent on identity-provider for token verification." },
      { id: "user-dashboard",    label: "User Dashboard",    status: "impacted", type: "application", description: "Web application. User sessions are terminating as tokens expire without valid refresh." },
      { id: "mobile-api",        label: "Mobile API",        status: "impacted", type: "api",         description: "Mobile backend API. Token refresh loops are causing excessive load on the identity provider." },
      { id: "admin-portal",      label: "Admin Portal",      status: "healthy",  type: "application", description: "Internal admin interface. Uses separate long-lived service accounts, not affected by user token TTL bug." },
    ],
    edges: [
      { source: "user-dashboard", target: "api-gateway",       type: "dependency",    label: "HTTPS" },
      { source: "mobile-api",     target: "api-gateway",       type: "dependency",    label: "HTTPS" },
      { source: "admin-portal",   target: "api-gateway",       type: "dependency",    label: "HTTPS" },
      { source: "api-gateway",    target: "identity-provider", type: "communication", label: "Token validation" },
    ],
  },
  "CL-003": {
    nodes: [
      { id: "content-pipeline", label: "Content Pipeline", status: "root",     type: "pipeline",        description: "Automated CMS publishing pipeline. Triggered bulk cache invalidation of 12,000 keys simultaneously." },
      { id: "cdn-edge",         label: "CDN Edge",         status: "impacted", type: "infrastructure",  description: "Global CDN edge network. Cache hit ratio collapsed from 94% to 12% after mass invalidation." },
      { id: "origin-server",    label: "Origin Server",   status: "impacted", type: "service",         description: "Web origin server. Receiving 8x normal request volume due to CDN cache miss storm." },
    ],
    edges: [
      { source: "content-pipeline", target: "cdn-edge",      type: "communication", label: "Cache invalidation" },
      { source: "cdn-edge",         target: "origin-server", type: "dependency",    label: "Cache miss fallback" },
    ],
  },
  "CL-004": {
    nodes: [
      { id: "reporting-service",  label: "Reporting Service",  status: "root",     type: "service",  description: "Scheduled reporting service. A runaway query without a LIMIT clause held 120 DB connections for 22 minutes." },
      { id: "postgres-primary",   label: "Postgres Primary",   status: "impacted", type: "database", description: "Shared primary database. Connection pool of 200 fully exhausted by the reporting service query." },
      { id: "order-service",      label: "Order Service",      status: "impacted", type: "service",  description: "Cannot acquire DB connections. All read/write operations are failing with 503 errors." },
      { id: "user-service",       label: "User Service",       status: "impacted", type: "service",  description: "Profile lookups and authentication queries failing due to pool exhaustion." },
      { id: "inventory-service",  label: "Inventory Service",  status: "impacted", type: "service",  description: "Stock update writes blocked. Inventory counts are becoming stale." },
      { id: "search-service",     label: "Search Service",     status: "healthy",  type: "service",  description: "Read-only search index. Using a separate read replica — not impacted by pool exhaustion on primary." },
    ],
    edges: [
      { source: "reporting-service", target: "postgres-primary",  type: "dependency", label: "SQL (no LIMIT)" },
      { source: "order-service",     target: "postgres-primary",  type: "dependency", label: "SQL read/write" },
      { source: "user-service",      target: "postgres-primary",  type: "dependency", label: "SQL read/write" },
      { source: "inventory-service", target: "postgres-primary",  type: "dependency", label: "SQL read/write" },
      { source: "search-service",    target: "postgres-primary",  type: "dependency", label: "SQL read-only" },
    ],
  },
  "CL-005": {
    nodes: [
      { id: "external-dns", label: "External DNS",  status: "root",    type: "infrastructure", description: "Upstream DNS provider experiencing infrastructure issues. Adding 200ms resolution latency." },
      { id: "api-gateway",  label: "API Gateway",   status: "healthy", type: "api",            description: "API gateway performing DNS lookups on external hostnames. Seeing slightly elevated response times." },
    ],
    edges: [
      { source: "api-gateway", target: "external-dns", type: "dependency", label: "DNS lookup" },
    ],
  },
};

// ─── Chat responses ───

export const chatResponses: Record<string, ChatQA[]> = {
  "CL-001": [
    {
      keywords: ["cause", "root", "why", "what happened"],
      answer:
        "The root cause is a misconfigured rate limiter on the payment-gateway service. At 09:02 UTC, a configuration deployment reduced max concurrent requests from 500 to 50, which immediately caused request queuing and cascading timeouts to downstream services. Confidence: 94%.",
    },
    {
      keywords: ["impact", "blast", "affected", "services"],
      answer:
        "8 services are impacted. The payment-gateway and order-service are critically affected. Billing and notification services have high impact with delayed processing. User dashboard and analytics pipeline show medium degradation.",
    },
    {
      keywords: ["fix", "resolve", "remediate", "action", "recommendation"],
      answer:
        "Recommended actions:\n1. Immediately revert the rate limiter config on payment-gateway to max_concurrent=500\n2. Monitor error rates for 10 minutes post-revert\n3. Drain queued requests on order-service\n4. Add config validation guardrails to prevent rate limiter values below 100",
    },
    {
      keywords: ["timeline", "sequence", "when"],
      answer:
        "Timeline of events:\n- 09:02 — Config change deployed (rate limiter reduced)\n- 09:05 — Latency spike detected (p99: 4200ms)\n- 09:08 — Payment timeout errors (45% error rate)\n- 09:11 — Order service degraded\n- 09:14 — Connection pool saturated",
    },
  ],
  "CL-002": [
    {
      keywords: ["cause", "root", "why", "what happened"],
      answer:
        "A bug in identity-provider v2.4.1 set token TTL to 30 seconds instead of 30 minutes for tokens issued between 07:00–08:00 UTC. When these tokens expired simultaneously, a re-authentication storm overwhelmed the identity provider. Confidence: 87%.",
    },
    {
      keywords: ["fix", "resolve", "remediate", "action"],
      answer:
        "Recommended actions:\n1. Roll back identity-provider to v2.4.0\n2. Force-refresh all tokens issued in the affected window\n3. Scale identity-provider horizontally to handle residual traffic\n4. Add TTL validation to token issuance pipeline",
    },
  ],
  "CL-003": [
    {
      keywords: ["cause", "root", "why"],
      answer:
        "A bulk content publish event in the CMS triggered invalidation of 12,000 cache keys simultaneously, instead of using staggered invalidation. This caused a cache miss storm on CDN edge nodes and overwhelmed the origin server. Confidence: 78%.",
    },
  ],
  "CL-004": [
    {
      keywords: ["cause", "root", "why"],
      answer:
        "A scheduled reporting query missing a LIMIT clause scanned 48 million rows, holding 120 database connections open for 22 minutes. This exhausted the shared connection pool (200 max), blocking all transactional queries. Confidence: 91%.",
    },
    {
      keywords: ["fix", "resolve", "action"],
      answer:
        "Recommended actions:\n1. Kill the long-running reporting query immediately\n2. Add query timeout limits (max 5 minutes) to the reporting service\n3. Move reporting queries to a read replica\n4. Add LIMIT clauses and pagination to all aggregate reports",
    },
  ],
  "CL-005": [
    {
      keywords: ["cause", "root", "why"],
      answer:
        "An upstream DNS provider infrastructure issue caused 200ms additional resolution latency. This was an external issue that resolved automatically after the provider applied a fix. Confidence: 65%.",
    },
  ],
};

export const suggestedQueries: Record<string, string[]> = {
  "CL-001": [
    "What caused this issue?",
    "Which services are affected?",
    "How do I fix this?",
    "Show me the timeline",
  ],
  "CL-002": [
    "What caused this issue?",
    "How do I fix this?",
  ],
  "CL-003": [
    "What caused this issue?",
  ],
  "CL-004": [
    "What caused this issue?",
    "How do I fix this?",
  ],
  "CL-005": [
    "What caused this issue?",
  ],
};

// ─── Dashboard metrics ───

export const dashboardMetrics = {
  activeClusters: incidents.filter((i) => i.status !== "resolved").length,
  criticalAlerts: incidents
    .filter((i) => i.severity === "critical")
    .reduce((sum, i) => sum + i.alertCount, 0),
  impactedServices: new Set(
    incidents
      .filter((i) => i.status !== "resolved")
      .flatMap((i) => {
        const detail = incidentDetails[i.id];
        return detail ? detail.blastRadius.map((b) => b.service) : [];
      })
  ).size,
};
