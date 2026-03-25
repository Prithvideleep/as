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

export interface HistoricalRef {
  id: string;
  name: string;
  date: string;
  resolution: string;
  similarity: number;
}

export interface IncidentDetail {
  id: string;
  name: string;
  severity: Severity;
  status: "active" | "investigating" | "resolved";
  summary: string;
  rootCauses: RootCause[];
  timeline: TimelineEvent[];
  blastRadius: BlastRadiusItem[];
  historicalRefs: HistoricalRef[];
  /** What was actually done to resolve (for Archive) */
  resolutionSummary?: string;
  /** Optional step list (for runbooks / future UI) */
  resolutionSteps?: string[];
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
    timestamp: "2026-03-15T05:15:00Z",
  },
  {
    id: "CL-006",
    name: "Kubernetes Node Memory Pressure",
    severity: "critical",
    status: "active",
    alertCount: 41,
    impactedServices: 9,
    timestamp: "2026-03-17T09:02:00Z",
  },
  {
    id: "CL-007",
    name: "Redis Cache Eviction Spike",
    severity: "medium",
    status: "active",
    alertCount: 18,
    impactedServices: 4,
    timestamp: "2026-03-17T08:55:00Z",
  },
  {
    id: "CL-008",
    name: "Kafka Consumer Lag — Orders Topic",
    severity: "high",
    status: "investigating",
    alertCount: 29,
    impactedServices: 6,
    timestamp: "2026-03-17T08:20:00Z",
  },
  {
    id: "CL-009",
    name: "SSL Certificate Expiry Warning",
    severity: "medium",
    status: "resolved",
    alertCount: 7,
    impactedServices: 2,
    timestamp: "2026-03-10T04:30:00Z",
  },
  {
    id: "CL-010",
    name: "Load Balancer Health Check Failures",
    severity: "critical",
    status: "active",
    alertCount: 53,
    impactedServices: 11,
    timestamp: "2026-03-17T09:20:00Z",
  },
  {
    id: "CL-011",
    name: "S3 Bucket Access Denied Errors",
    severity: "medium",
    status: "investigating",
    alertCount: 14,
    impactedServices: 3,
    timestamp: "2026-03-17T07:10:00Z",
  },
  {
    id: "CL-012",
    name: "Elasticsearch Cluster Yellow State",
    severity: "high",
    status: "investigating",
    alertCount: 22,
    impactedServices: 5,
    timestamp: "2026-03-17T06:45:00Z",
  },
  {
    id: "CL-013",
    name: "SMTP Delivery Failures",
    severity: "low",
    status: "resolved",
    alertCount: 8,
    impactedServices: 1,
    timestamp: "2026-02-25T03:50:00Z",
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
    rootCauses: [
      {
        service: "payment-gateway",
        description: "Rate limiter configuration change at 09:02 UTC reduced max concurrent requests from 500 to 50, causing immediate request queuing and cascading timeouts.",
        confidence: 94,
      },
      {
        service: "order-service",
        description: "Retry storm from order-service amplified queue depth on payment-gateway, accelerating saturation beyond what the rate limit alone would cause.",
        confidence: 61,
      },
      {
        service: "analytics-pipeline",
        description: "Analytics pipeline sending high-frequency polling requests to payment-gateway may have contributed to early queue buildup before the config change.",
        confidence: 28,
      },
    ],
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
    historicalRefs: [
      { id: "INC-2025-0441", name: "Payment Gateway Rate Limit Misconfiguration", date: "Nov 14, 2025", resolution: "Reverted rate limiter config; added pre-deployment validation gate for threshold changes.", similarity: 91 },
      { id: "INC-2025-0198", name: "Checkout Service Timeout Cascade", date: "Jun 3, 2025", resolution: "Increased downstream timeout budgets and added circuit breakers on payment-gateway callers.", similarity: 74 },
      { id: "INC-2024-1102", name: "Order Processing Backpressure Event", date: "Dec 19, 2024", resolution: "Introduced message queue buffering between order-service and payment-gateway to absorb traffic spikes.", similarity: 58 },
    ],
  },
  "CL-002": {
    id: "CL-002",
    name: "Auth Token Expiry Storm",
    severity: "high",
    status: "investigating",
    summary:
      "A batch of auth tokens issued with incorrect TTL expired simultaneously, causing a surge of re-authentication requests that overwhelmed the identity provider.",
    rootCauses: [
      {
        service: "identity-provider",
        description: "Token issuance bug in v2.4.1 set TTL to 30 seconds instead of 30 minutes for tokens issued between 07:00–08:00 UTC.",
        confidence: 87,
      },
      {
        service: "mobile-api",
        description: "Mobile clients lack exponential back-off on token refresh failures, causing synchronised retry storms that amplified the load on the identity provider.",
        confidence: 55,
      },
      {
        service: "api-gateway",
        description: "API gateway token validation cache was bypassed due to a recent zero-TTL cache config, forcing every request to hit the identity provider directly.",
        confidence: 40,
      },
    ],
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
    historicalRefs: [
      { id: "INC-2025-0612", name: "Auth Service Token TTL Bug — v2.2.0", date: "Dec 28, 2025", resolution: "Hotfix to token issuance logic; added integration test validating TTL values on every deploy.", similarity: 88 },
      { id: "INC-2025-0307", name: "Identity Provider CPU Saturation", date: "Aug 11, 2025", resolution: "Scaled identity provider horizontally; introduced request queuing to prevent CPU spikes.", similarity: 62 },
    ],
  },
  "CL-003": {
    id: "CL-003",
    name: "CDN Cache Invalidation Spike",
    severity: "medium",
    status: "active",
    summary:
      "Automated content pipeline triggered mass cache invalidation across CDN edge nodes, causing temporary origin overload and increased latency for static assets.",
    rootCauses: [
      {
        service: "content-pipeline",
        description: "Bulk publish event invalidated 12,000 cache keys simultaneously instead of using staggered invalidation, overwhelming CDN edge nodes.",
        confidence: 78,
      },
      {
        service: "cdn-edge",
        description: "CDN edge nodes lack a rate limit on incoming invalidation requests, allowing the full batch to propagate instantly.",
        confidence: 52,
      },
      {
        service: "origin-server",
        description: "Origin server had no request coalescing configured, causing each unique URL miss to result in a separate upstream fetch.",
        confidence: 33,
      },
    ],
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
    historicalRefs: [
      { id: "INC-2025-0509", name: "CMS Bulk Publish CDN Overload", date: "Oct 22, 2025", resolution: "Implemented staggered cache invalidation with max 200 keys/minute throttle in content pipeline.", similarity: 83 },
      { id: "INC-2024-0874", name: "Origin Server Cache Miss Storm", date: "Mar 5, 2024", resolution: "Enabled request coalescing on origin server; added CDN warmup script for bulk publishes.", similarity: 67 },
    ],
  },
  "CL-004": {
    id: "CL-004",
    name: "Database Connection Pool Exhaustion",
    severity: "critical",
    status: "investigating",
    summary:
      "A long-running query from a reporting job held connections open, exhausting the shared connection pool and blocking all transactional queries.",
    rootCauses: [
      {
        service: "reporting-service",
        description: "Scheduled report query missing a LIMIT clause performed a full table scan of 48M rows, holding 120 DB connections open for 22 minutes.",
        confidence: 91,
      },
      {
        service: "postgres-primary",
        description: "Connection pool size of 200 is undersized for the combined peak load of reporting, order, user, and inventory services running concurrently.",
        confidence: 67,
      },
      {
        service: "order-service",
        description: "Order service connection lease duration is not bounded, meaning stalled connections are not released until query timeout (90s), delaying pool recovery.",
        confidence: 44,
      },
    ],
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
    historicalRefs: [
      { id: "INC-2025-0728", name: "Reporting Job DB Connection Leak", date: "Jan 17, 2025", resolution: "Added LIMIT clause enforcement lint rule to CI; set 30s statement timeout on reporting role.", similarity: 89 },
      { id: "INC-2024-1201", name: "Connection Pool Starvation — Black Friday", date: "Nov 29, 2024", resolution: "Increased pool to 400; segregated reporting traffic to a dedicated read replica.", similarity: 76 },
      { id: "INC-2024-0531", name: "Postgres Primary Overload", date: "May 31, 2024", resolution: "Implemented PgBouncer transaction-mode pooling to reduce effective connection overhead.", similarity: 60 },
    ],
  },
  "CL-005": {
    id: "CL-005",
    name: "DNS Resolution Latency",
    severity: "low",
    status: "resolved",
    summary:
      "Upstream DNS provider experienced brief resolution latency, resolved automatically after provider-side fix.",
    rootCauses: [
      {
        service: "external-dns",
        description: "Upstream DNS provider infrastructure issue caused 200ms additional resolution latency on all external hostname lookups.",
        confidence: 65,
      },
      {
        service: "api-gateway",
        description: "API gateway performs DNS lookups without local caching, making it sensitive to any upstream DNS latency rather than absorbing brief fluctuations.",
        confidence: 38,
      },
    ],
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
    historicalRefs: [
      { id: "INC-2025-0112", name: "DNS Provider Outage — Route53 Partial Degradation", date: "Mar 3, 2025", resolution: "Switched to secondary DNS provider as fallback; added DNS health check to monitoring dashboard.", similarity: 72 },
    ],
    resolutionSummary: "Switched API gateway DNS resolution to use a secondary resolver during the provider incident and enabled DNS caching (60s) on the gateway. Added a 30-minute early warning alert for DNS latency.",
    resolutionSteps: [
      "Enabled fallback DNS resolver for external lookups",
      "Set API gateway DNS cache TTL to 60s",
      "Added DNS latency SLO alerting and runbook link",
    ],
  },
  "CL-006": {
    id: "CL-006", name: "Kubernetes Node Memory Pressure", severity: "critical", status: "active",
    summary: "Three Kubernetes worker nodes hit memory limits simultaneously after a misconfigured HPA scaled a memory-hungry service to 40 replicas. Pod evictions cascaded across the cluster, impacting 9 downstream services.",
    rootCauses: [
      { service: "hpa-controller", description: "Horizontal Pod Autoscaler target was set to CPU utilisation but the workload is memory-bound, causing it to scale aggressively without relieving actual resource pressure.", confidence: 88 },
      { service: "memory-service", description: "Newly deployed v3.1 of the data-processing service has a memory leak that doubles RSS every 15 minutes under load.", confidence: 72 },
      { service: "cluster-autoscaler", description: "Cluster autoscaler did not provision new nodes fast enough to absorb the burst, leading to node pressure before capacity was available.", confidence: 45 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "data-processor v3.1 deployed", description: "New release with updated caching layer", timestamp: "08:30", source: "ArgoCD" },
      { id: "t2", type: "anomaly", title: "HPA scaled to 40 replicas", description: "Replicas grew from 5 to 40 in 8 minutes", timestamp: "08:48", source: "Kubernetes" },
      { id: "t3", type: "alert", title: "Node memory pressure detected", description: "3 worker nodes hit MemoryPressure taint", timestamp: "09:02", source: "Prometheus" },
      { id: "t4", type: "alert", title: "Pod evictions started", description: "OOMKilled events on 12 pods", timestamp: "09:06", source: "PagerDuty" },
    ],
    blastRadius: [
      { service: "data-processor", severity: "critical", impact: "Root cause — memory leak" },
      { service: "api-server", severity: "critical", impact: "Requests queued due to evicted pods" },
      { service: "worker-node-01", severity: "critical", impact: "MemoryPressure — scheduling blocked" },
      { service: "order-service", severity: "high", impact: "Pods evicted, reduced capacity" },
      { service: "user-service", severity: "high", impact: "Intermittent 503s" },
      { service: "notification-service", severity: "medium", impact: "Delayed message dispatch" },
      { service: "analytics-pipeline", severity: "medium", impact: "Backpressure on event ingestion" },
      { service: "search-service", severity: "low", impact: "Index refresh paused" },
      { service: "audit-logger", severity: "low", impact: "Log shipping lag" },
    ],
    historicalRefs: [
      { id: "INC-2025-0834", name: "HPA Misconfiguration Memory Spike", date: "Feb 2, 2026", resolution: "Added memory-based HPA metric alongside CPU; set max replicas cap to 15.", similarity: 84 },
      { id: "INC-2025-0601", name: "Memory Leak in Batch Processor v2.8", date: "Nov 5, 2025", resolution: "Rolled back to v2.7; added memory leak detection to CI pipeline.", similarity: 69 },
    ],
  },
  "CL-007": {
    id: "CL-007", name: "Redis Cache Eviction Spike", severity: "medium", status: "active",
    summary: "Redis maxmemory limit was reached after a traffic spike caused the cache to fill faster than TTLs could expire items. Eviction policy set to allkeys-lru began aggressively evicting hot keys, causing cache miss storms downstream.",
    rootCauses: [
      { service: "redis-primary", description: "maxmemory set to 4GB is insufficient for current traffic volume; eviction policy is expelling hot keys that are immediately re-requested.", confidence: 82 },
      { service: "session-service", description: "Session objects grew from 2KB to 18KB after a recent update, consuming 9x more cache space per user session.", confidence: 67 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "session-service v1.9.2 deployed", description: "New session payload includes full user preference object", timestamp: "07:30", source: "Jenkins" },
      { id: "t2", type: "anomaly", title: "Redis memory at 94%", description: "Memory climbing at 200MB/min", timestamp: "08:45", source: "Datadog" },
      { id: "t3", type: "alert", title: "Cache eviction rate critical", description: "10,000 evictions/sec — 50x normal baseline", timestamp: "08:55", source: "Prometheus" },
    ],
    blastRadius: [
      { service: "redis-primary", severity: "medium", impact: "Root cause — eviction storm" },
      { service: "session-service", severity: "medium", impact: "Session lookups causing cache misses" },
      { service: "api-gateway", severity: "medium", impact: "Increased latency on authenticated requests" },
      { service: "user-dashboard", severity: "low", impact: "Slower page loads for logged-in users" },
    ],
    historicalRefs: [
      { id: "INC-2025-0412", name: "Redis OOM During Flash Sale", date: "Sep 18, 2025", resolution: "Increased maxmemory to 8GB; implemented Redis Cluster for horizontal scaling.", similarity: 76 },
    ],
  },
  "CL-008": {
    id: "CL-008", name: "Kafka Consumer Lag — Orders Topic", severity: "high", status: "investigating",
    summary: "Consumer group for the orders processing topic fell behind by 2.4 million messages after a consumer pod restart loop caused by an uncaught deserialization exception. Messages are accumulating faster than they are being processed.",
    rootCauses: [
      { service: "order-consumer", description: "A new message schema introduced in v2.3.0 is not backward compatible. Consumers on v2.2.x throw a deserialization exception and restart, never committing offsets.", confidence: 91 },
      { service: "schema-registry", description: "Schema compatibility mode was set to NONE instead of BACKWARD, allowing a breaking schema change to be published without validation.", confidence: 78 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "order-producer v2.3.0 deployed", description: "New order event schema with additional required fields", timestamp: "07:00", source: "ArgoCD" },
      { id: "t2", type: "anomaly", title: "Consumer restart loop detected", description: "order-consumer restarting every 45 seconds", timestamp: "07:15", source: "Kubernetes" },
      { id: "t3", type: "alert", title: "Consumer lag exceeds 500K messages", description: "Lag growing at 80K messages/minute", timestamp: "08:20", source: "Grafana" },
    ],
    blastRadius: [
      { service: "order-consumer", severity: "high", impact: "Continuous restart loop — not processing" },
      { service: "order-service", severity: "high", impact: "Order state updates delayed" },
      { service: "inventory-service", severity: "medium", impact: "Stock reservation events queued" },
      { service: "notification-service", severity: "medium", impact: "Order confirmation emails delayed" },
      { service: "billing-service", severity: "low", impact: "Invoice generation behind schedule" },
      { service: "analytics-pipeline", severity: "low", impact: "Order metrics lag" },
    ],
    historicalRefs: [
      { id: "INC-2025-0719", name: "Kafka Schema Incompatibility — Payments Topic", date: "Jan 8, 2026", resolution: "Set schema registry to BACKWARD compatibility; added consumer version checks to deployment pipeline.", similarity: 89 },
    ],
  },
  "CL-009": {
    id: "CL-009", name: "SSL Certificate Expiry Warning", severity: "medium", status: "resolved",
    summary: "API gateway SSL certificate was 7 days from expiry. Auto-renewal via cert-manager failed due to an expired Let's Encrypt ACME token. Certificate was manually renewed and rotation completed without downtime.",
    rootCauses: [
      { service: "cert-manager", description: "ACME account token used by cert-manager expired. Renewal requests were silently failing for 30 days with no alerting configured.", confidence: 95 },
    ],
    timeline: [
      { id: "t1", type: "anomaly", title: "Certificate expiry warning triggered", description: "7 days until API gateway cert expires", timestamp: "03:00", source: "cert-manager" },
      { id: "t2", type: "alert", title: "Auto-renewal failure detected", description: "cert-manager ACME challenge failed — token expired", timestamp: "03:15", source: "PagerDuty" },
      { id: "t3", type: "change", title: "Manual certificate renewal completed", description: "New cert issued and deployed to API gateway", timestamp: "04:30", source: "Ops Team" },
    ],
    blastRadius: [
      { service: "api-gateway", severity: "medium", impact: "SSL cert near expiry — would cause browser warnings" },
      { service: "mobile-api", severity: "medium", impact: "Mobile clients would reject expired cert" },
    ],
    historicalRefs: [
      { id: "INC-2025-0203", name: "Production Cert Expiry Outage", date: "Apr 14, 2025", resolution: "Implemented 30-day expiry alerting; automated ACME token rotation.", similarity: 71 },
    ],
    resolutionSummary: "Manually renewed the API gateway certificate, rotated the ACME account token for cert-manager, and added expiry/failure alerts so renewals can’t silently fail again.",
    resolutionSteps: [
      "Issued and deployed a renewed certificate for api-gateway",
      "Rotated cert-manager ACME token and verified challenge flow",
      "Added alerts for renewal failures and 30/14/7-day expiry",
    ],
  },
  "CL-010": {
    id: "CL-010", name: "Load Balancer Health Check Failures", severity: "critical", status: "active",
    summary: "Production load balancer removed 7 of 10 backend instances from rotation after health checks began failing following a misconfigured readiness probe update. Live traffic is concentrated on 3 remaining instances causing severe overload.",
    rootCauses: [
      { service: "readiness-probe", description: "Readiness probe path was changed from /health to /healthz in the deployment manifest but the load balancer health check still points to /health, returning 404 and marking instances unhealthy.", confidence: 96 },
      { service: "load-balancer", description: "Load balancer has no minimum healthy instances threshold — it continued removing instances until only 3 remained, far below safe operating capacity.", confidence: 58 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "Deployment manifest updated", description: "Readiness probe path changed to /healthz", timestamp: "08:50", source: "ArgoCD" },
      { id: "t2", type: "anomaly", title: "Health check failures on 7 instances", description: "LB marking instances unhealthy — /health returning 404", timestamp: "09:05", source: "AWS CloudWatch" },
      { id: "t3", type: "alert", title: "Traffic concentrated on 3 instances", description: "Remaining instances at 340% normal load", timestamp: "09:20", source: "PagerDuty" },
    ],
    blastRadius: [
      { service: "load-balancer", severity: "critical", impact: "7/10 instances removed from rotation" },
      { service: "api-server", severity: "critical", impact: "3x overloaded — p99 latency at 12s" },
      { service: "user-dashboard", severity: "critical", impact: "Timeout errors for most users" },
      { service: "mobile-api", severity: "high", impact: "API requests timing out" },
      { service: "order-service", severity: "high", impact: "Order placement failures" },
      { service: "payment-gateway", severity: "high", impact: "Payment requests failing" },
      { service: "billing-service", severity: "medium", impact: "Invoice generation delayed" },
      { service: "notification-service", severity: "medium", impact: "Dispatch queue growing" },
      { service: "search-service", severity: "low", impact: "Slow search results" },
      { service: "analytics-pipeline", severity: "low", impact: "Event ingestion lag" },
      { service: "audit-logger", severity: "low", impact: "Log shipping behind" },
    ],
    historicalRefs: [
      { id: "INC-2026-0031", name: "Health Check Misconfiguration — Staging", date: "Jan 29, 2026", resolution: "Added LB health check path to deployment checklist; implemented minimum healthy threshold of 6/10.", similarity: 92 },
      { id: "INC-2025-0911", name: "Backend Pool Drain During Deployment", date: "Oct 3, 2025", resolution: "Blue/green deployment strategy adopted to prevent live traffic disruption during config changes.", similarity: 67 },
    ],
  },
  "CL-011": {
    id: "CL-011", name: "S3 Bucket Access Denied Errors", severity: "medium", status: "investigating",
    summary: "IAM role rotation for the media-upload service assigned an incorrect policy that removed s3:PutObject and s3:GetObject permissions. User file uploads and media retrieval are failing across affected services.",
    rootCauses: [
      { service: "iam-role-media-upload", description: "Automated IAM role rotation applied a baseline policy template that does not include S3 bucket-specific permissions. The previous role had a custom inline policy that was not carried over.", confidence: 89 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "IAM role rotation executed", description: "media-upload-role replaced with new rotation", timestamp: "06:30", source: "AWS Config" },
      { id: "t2", type: "anomaly", title: "S3 access denied errors detected", description: "AccessDenied on PutObject and GetObject calls", timestamp: "07:00", source: "CloudTrail" },
      { id: "t3", type: "alert", title: "Upload failure rate at 100%", description: "All media upload attempts failing", timestamp: "07:10", source: "Datadog" },
    ],
    blastRadius: [
      { service: "media-upload-service", severity: "medium", impact: "Root cause — IAM permissions missing" },
      { service: "user-dashboard", severity: "medium", impact: "Profile photo uploads failing" },
      { service: "content-pipeline", severity: "low", impact: "Asset publishing blocked" },
    ],
    historicalRefs: [
      { id: "INC-2025-0518", name: "IAM Role Rotation Broke RDS Access", date: "Oct 30, 2025", resolution: "Implemented policy diff validation step in IAM rotation automation.", similarity: 81 },
    ],
  },
  "CL-012": {
    id: "CL-012", name: "Elasticsearch Cluster Yellow State", severity: "high", status: "investigating",
    summary: "Elasticsearch cluster entered yellow state after one data node ran out of disk space and was removed from the cluster. Replica shards are unassigned. Primary shards are intact but the cluster lacks redundancy.",
    rootCauses: [
      { service: "es-data-node-03", description: "Data node disk reached 95% threshold. Elasticsearch's flood-stage watermark triggered, blocking all write operations on the node and causing it to be excluded from shard allocation.", confidence: 93 },
      { service: "index-lifecycle-policy", description: "ILM policy for log indices was paused 3 weeks ago during maintenance and never re-enabled. Old indices accumulated without rolling over, consuming 340GB of avoidable disk space.", confidence: 71 },
    ],
    timeline: [
      { id: "t1", type: "anomaly", title: "es-data-node-03 disk at 87%", description: "Disk usage growing at 2GB/hour", timestamp: "05:00", source: "Datadog" },
      { id: "t2", type: "alert", title: "Flood-stage watermark reached", description: "Node disk at 95% — write block applied", timestamp: "06:45", source: "Elasticsearch" },
      { id: "t3", type: "alert", title: "Cluster state: YELLOW", description: "Replica shards unassigned on 14 indices", timestamp: "06:50", source: "PagerDuty" },
    ],
    blastRadius: [
      { service: "es-data-node-03", severity: "high", impact: "Root cause — disk full, write blocked" },
      { service: "search-service", severity: "high", impact: "Search queries hitting degraded cluster" },
      { service: "log-aggregator", severity: "medium", impact: "Log write operations partially blocked" },
      { service: "analytics-pipeline", severity: "medium", impact: "Analytics index writes failing" },
      { service: "audit-logger", severity: "low", impact: "Audit log ingestion delayed" },
    ],
    historicalRefs: [
      { id: "INC-2025-0627", name: "Elasticsearch RED State — Shard Loss", date: "Dec 11, 2025", resolution: "Re-enabled ILM; added 80% disk alert with 48h lead time; expanded node storage to 2TB.", similarity: 77 },
    ],
  },
  "CL-013": {
    id: "CL-013", name: "SMTP Delivery Failures", severity: "low", status: "resolved",
    summary: "Transactional email delivery failed for 2 hours after the SendGrid API key was rotated without updating the application secret. Notification service fell back to retry queue; all queued emails delivered after the key was updated.",
    rootCauses: [
      { service: "notification-service", description: "SendGrid API key was rotated in the secrets manager but the notification service reads the key at startup only, not dynamically. A restart was required to pick up the new key.", confidence: 97 },
    ],
    timeline: [
      { id: "t1", type: "change", title: "SendGrid API key rotated", description: "Scheduled 90-day key rotation executed", timestamp: "02:00", source: "Secrets Manager" },
      { id: "t2", type: "anomaly", title: "Email delivery failures detected", description: "SendGrid returning 401 Unauthorized", timestamp: "02:05", source: "Datadog" },
      { id: "t3", type: "change", title: "notification-service restarted", description: "Service reloaded with new API key", timestamp: "03:45", source: "Ops Team" },
      { id: "t4", type: "alert", title: "Retry queue drained", description: "All 847 queued emails delivered successfully", timestamp: "03:50", source: "SendGrid" },
    ],
    blastRadius: [
      { service: "notification-service", severity: "low", impact: "Root cause — stale API key in memory" },
      { service: "user-dashboard", severity: "low", impact: "Email confirmations delayed 2 hours" },
    ],
    historicalRefs: [
      { id: "INC-2025-0315", name: "Twilio Token Rotation Broke SMS", date: "Jul 22, 2025", resolution: "All third-party credentials migrated to dynamic secret injection; services updated to reload secrets without restart.", similarity: 85 },
    ],
    resolutionSummary: "Updated the SendGrid API key secret and restarted notification-service to reload credentials. Implemented dynamic secret reload to avoid restarts for future rotations.",
    resolutionSteps: [
      "Updated SendGrid API key in secrets manager",
      "Restarted notification-service to reload the key",
      "Added health check for email provider auth failures",
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
  "CL-006": {
    nodes: [
      { id: "hpa-controller",   label: "HPA Controller",   status: "root",     type: "infrastructure", description: "Kubernetes HPA misconfigured with CPU metric on memory-bound workload." },
      { id: "data-processor",   label: "Data Processor",   status: "root",     type: "service",        description: "v3.1 contains a memory leak that grows RSS under load." },
      { id: "api-server",       label: "API Server",       status: "impacted", type: "api",            description: "Requests queued as pods evicted." },
      { id: "order-service",    label: "Order Service",    status: "impacted", type: "service",        description: "Pods evicted — reduced capacity." },
      { id: "user-service",     label: "User Service",     status: "impacted", type: "service",        description: "Intermittent 503s." },
      { id: "notification-svc", label: "Notification Svc", status: "impacted", type: "service",        description: "Delayed message dispatch." },
      { id: "search-service",   label: "Search Service",   status: "healthy",  type: "service",        description: "Index refresh paused but service healthy." },
    ],
    edges: [
      { source: "hpa-controller", target: "data-processor", type: "communication", label: "Scale command" },
      { source: "data-processor", target: "api-server",     type: "dependency",    label: "REST API" },
      { source: "api-server",     target: "order-service",  type: "dependency",    label: "REST API" },
      { source: "api-server",     target: "user-service",   type: "dependency",    label: "REST API" },
      { source: "order-service",  target: "notification-svc", type: "data-flow",   label: "Events" },
    ],
  },
  "CL-007": {
    nodes: [
      { id: "redis-primary",  label: "Redis Primary",  status: "root",     type: "database",     description: "maxmemory limit reached; eviction storm." },
      { id: "session-service",label: "Session Service", status: "impacted", type: "service",      description: "Session objects 9x larger after v1.9.2." },
      { id: "api-gateway",    label: "API Gateway",    status: "impacted", type: "api",           description: "Latency on authenticated requests." },
      { id: "user-dashboard", label: "User Dashboard", status: "healthy",  type: "application",   description: "Slower loads — not failing." },
    ],
    edges: [
      { source: "session-service", target: "redis-primary",  type: "dependency", label: "Cache read/write" },
      { source: "api-gateway",     target: "session-service", type: "dependency", label: "Session validation" },
      { source: "user-dashboard",  target: "api-gateway",     type: "dependency", label: "HTTPS" },
    ],
  },
  "CL-008": {
    nodes: [
      { id: "schema-registry",    label: "Schema Registry",    status: "root",     type: "service",   description: "Compatibility mode set to NONE — allowed breaking schema." },
      { id: "order-producer",     label: "Order Producer",     status: "impacted", type: "service",   description: "Publishing v2.3.0 schema incompatible with consumers." },
      { id: "order-consumer",     label: "Order Consumer",     status: "impacted", type: "service",   description: "Restart loop — deserialization exception." },
      { id: "inventory-service",  label: "Inventory Service",  status: "impacted", type: "service",   description: "Stock reservations queued." },
      { id: "notification-svc",   label: "Notification Svc",   status: "healthy",  type: "service",   description: "Not yet affected." },
    ],
    edges: [
      { source: "order-producer",    target: "schema-registry",   type: "communication", label: "Schema check" },
      { source: "order-producer",    target: "order-consumer",    type: "data-flow",     label: "Kafka topic" },
      { source: "order-consumer",    target: "inventory-service", type: "dependency",    label: "REST API" },
      { source: "order-consumer",    target: "notification-svc",  type: "data-flow",     label: "Events" },
    ],
  },
  "CL-009": {
    nodes: [
      { id: "cert-manager", label: "Cert Manager",  status: "root",     type: "infrastructure", description: "ACME token expired — silent renewal failure." },
      { id: "api-gateway",  label: "API Gateway",   status: "impacted", type: "api",            description: "SSL cert 7 days from expiry." },
      { id: "mobile-api",   label: "Mobile API",    status: "healthy",  type: "api",            description: "Would be impacted on cert expiry." },
    ],
    edges: [
      { source: "cert-manager", target: "api-gateway", type: "dependency",    label: "Cert renewal" },
      { source: "mobile-api",   target: "api-gateway", type: "dependency",    label: "HTTPS" },
    ],
  },
  "CL-010": {
    nodes: [
      { id: "load-balancer",       label: "Load Balancer",       status: "root",     type: "infrastructure", description: "Removed 7/10 backends — misconfigured health check path." },
      { id: "api-server",          label: "API Server",          status: "impacted", type: "api",            description: "3 remaining instances at 340% load." },
      { id: "user-dashboard",      label: "User Dashboard",      status: "impacted", type: "application",    description: "Timeout errors for most users." },
      { id: "mobile-api",          label: "Mobile API",          status: "impacted", type: "api",            description: "Requests timing out." },
      { id: "order-service",       label: "Order Service",       status: "impacted", type: "service",        description: "Order placement failures." },
      { id: "payment-gateway",     label: "Payment Gateway",     status: "impacted", type: "service",        description: "Payment requests failing." },
      { id: "notification-svc",    label: "Notification Svc",    status: "impacted", type: "service",        description: "Dispatch queue growing." },
      { id: "search-service",      label: "Search Service",      status: "healthy",  type: "service",        description: "Degraded but not failing." },
    ],
    edges: [
      { source: "user-dashboard",  target: "load-balancer",   type: "dependency",    label: "HTTPS" },
      { source: "mobile-api",      target: "load-balancer",   type: "dependency",    label: "HTTPS" },
      { source: "load-balancer",   target: "api-server",      type: "dependency",    label: "Route" },
      { source: "api-server",      target: "order-service",   type: "dependency",    label: "REST" },
      { source: "api-server",      target: "payment-gateway", type: "dependency",    label: "REST" },
      { source: "order-service",   target: "notification-svc", type: "data-flow",    label: "Events" },
    ],
  },
  "CL-011": {
    nodes: [
      { id: "iam-role",        label: "IAM Role",           status: "root",     type: "infrastructure", description: "Rotation lost custom inline S3 policy." },
      { id: "media-upload",    label: "Media Upload Svc",   status: "impacted", type: "service",        description: "S3 PutObject/GetObject denied." },
      { id: "user-dashboard",  label: "User Dashboard",     status: "impacted", type: "application",    description: "Profile photo uploads failing." },
      { id: "content-pipeline",label: "Content Pipeline",   status: "healthy",  type: "pipeline",       description: "Asset publishing blocked." },
    ],
    edges: [
      { source: "media-upload",    target: "iam-role",         type: "dependency",    label: "Assume role" },
      { source: "user-dashboard",  target: "media-upload",     type: "dependency",    label: "Upload API" },
      { source: "content-pipeline",target: "media-upload",     type: "dependency",    label: "Asset upload" },
    ],
  },
  "CL-012": {
    nodes: [
      { id: "es-node-03",      label: "ES Data Node 03",    status: "root",     type: "database",  description: "Disk at 95% — flood-stage watermark triggered." },
      { id: "search-service",  label: "Search Service",     status: "impacted", type: "service",   description: "Queries hitting degraded cluster." },
      { id: "log-aggregator",  label: "Log Aggregator",     status: "impacted", type: "service",   description: "Log writes partially blocked." },
      { id: "analytics-pipe",  label: "Analytics Pipeline", status: "impacted", type: "pipeline",  description: "Index writes failing." },
      { id: "audit-logger",    label: "Audit Logger",       status: "healthy",  type: "service",   description: "Delayed but not failing." },
    ],
    edges: [
      { source: "search-service", target: "es-node-03",     type: "dependency", label: "Index query" },
      { source: "log-aggregator", target: "es-node-03",     type: "data-flow",  label: "Log ingest" },
      { source: "analytics-pipe", target: "es-node-03",     type: "data-flow",  label: "Index write" },
      { source: "audit-logger",   target: "log-aggregator", type: "data-flow",  label: "Log stream" },
    ],
  },
  "CL-013": {
    nodes: [
      { id: "notification-svc", label: "Notification Svc",  status: "root",    type: "service",     description: "Stale SendGrid API key in memory after rotation." },
      { id: "user-dashboard",   label: "User Dashboard",    status: "healthy", type: "application", description: "Email confirmations delayed." },
    ],
    edges: [
      { source: "user-dashboard", target: "notification-svc", type: "communication", label: "Email trigger" },
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

// ─── Alert level snapshot (derived, updated every 15 min in production) ───

export interface AlertLevelSnapshot {
  lastUpdated: string;
  intervalMinutes: number;
  levels: {
    critical: number;
    warning: number;
    minor: number;
    clear: number;
    error: number;
  };
}

export const alertLevelSnapshot: AlertLevelSnapshot = {
  lastUpdated: new Date().toISOString(),
  intervalMinutes: 15,
  levels: {
    critical: incidents
      .filter((i) => i.severity === "critical" && i.status !== "resolved")
      .reduce((s, i) => s + i.alertCount, 0),
    warning: incidents
      .filter((i) => i.severity === "high" && i.status !== "resolved")
      .reduce((s, i) => s + i.alertCount, 0),
    minor: incidents
      .filter((i) => i.severity === "medium" && i.status !== "resolved")
      .reduce((s, i) => s + i.alertCount, 0),
    clear: incidents.filter((i) => i.status === "resolved").length,
    error: 0,
  },
};

// ─── Correlation clusters (top 5 non-resolved incidents as AI-grouped clusters) ───

export interface CorrelationCluster {
  incidentId: string;
  incidentName: string;
  severity: Severity;
  relatedAlerts: { title: string; source: string; timestamp: string }[];
  impactedL1: BlastRadiusItem[];
  impactedL2Placeholder: string;
  /** When present (archive mode), shows a Resolution section instead of the L2 placeholder */
  resolutionSummary?: string;
}

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export const correlationClusters: CorrelationCluster[] = incidents
  .filter((i) => i.status !== "resolved")
  .sort((a, b) => {
    const sv = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
    return sv !== 0 ? sv : b.alertCount - a.alertCount;
  })
  .slice(0, 5)
  .map((inc) => {
    const detail = incidentDetails[inc.id];
    return {
      incidentId: inc.id,
      incidentName: inc.name,
      severity: inc.severity,
      relatedAlerts: detail
        ? detail.timeline
            .filter((t) => t.type === "alert" || t.type === "anomaly")
            .slice(0, 4)
            .map((t) => ({ title: t.title, source: t.source, timestamp: t.timestamp }))
        : [],
      impactedL1: detail
        ? detail.blastRadius.filter((b) => b.severity === "critical" || b.severity === "high")
        : [],
      impactedL2Placeholder:
        "Downstream dependency mapping requires enriched data pipeline (Phase 2).",
    };
  });

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
