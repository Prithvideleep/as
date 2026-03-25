import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronRight, ChevronUp, ChevronDown as ChevronDownIcon,
  Clock, AlertOctagon, ArrowUpDown,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents, incidentDetails } from "../data/mockData";
import type { AlertLevelSnapshot, CorrelationCluster, Incident } from "../data/mockData";
import AlertLevelBar from "../components/dashboard/AlertLevelBar";
import CorrelationTile from "../components/dashboard/CorrelationTile";

// ─── Re-usable derivation helpers ────────────────────────────────────────────

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#F59E0B", low: "#22C55E",
};
const SEV_LABEL: Record<string, string> = {
  critical: "Critical", high: "High", medium: "Medium", low: "Low",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#EF4444", investigating: "#F97316", resolved: "#22C55E",
};

function buildSnapshot(windowIncidents: Incident[]): AlertLevelSnapshot {
  const mostRecent = windowIncidents
    .map((i) => new Date(i.timestamp).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  return {
    lastUpdated: mostRecent ? new Date(mostRecent).toISOString() : new Date().toISOString(),
    intervalMinutes: 0,
    levels: {
      critical: windowIncidents.filter((i) => i.severity === "critical").reduce((s, i) => s + i.alertCount, 0),
      warning:  windowIncidents.filter((i) => i.severity === "high").reduce((s, i) => s + i.alertCount, 0),
      minor:    windowIncidents.filter((i) => i.severity === "medium").reduce((s, i) => s + i.alertCount, 0),
      clear:    windowIncidents.filter((i) => i.status === "resolved").length,
      error:    0,
    },
  };
}

function buildClusters(windowIncidents: Incident[]): CorrelationCluster[] {
  const resolved = windowIncidents.filter((i) => i.status === "resolved");
  return [...resolved]
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
        impactedL2Placeholder: "",
        resolutionSummary: detail?.resolutionSummary ?? "Incident resolved — resolution notes not recorded.",
      };
    });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

type SortKey = "timestamp" | "severity" | "alertCount" | "status" | "name";
type SortDir = "asc" | "desc";
type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";
type StatusFilter   = "all" | "active" | "investigating" | "resolved";

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  // Table state
  const [search, setSearch]           = useState("");
  const [severityFilter, setSeverity] = useState<SeverityFilter>("all");
  const [statusFilter, setStatus]     = useState<StatusFilter>("all");
  const [sortKey, setSortKey]         = useState<SortKey>("timestamp");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [page, setPage]               = useState(1);

  // All incidents (no time window filter)
  const windowIncidents = incidents;

  const snapshot  = useMemo(() => buildSnapshot(windowIncidents),  []);
  const clusters  = useMemo(() => buildClusters(windowIncidents),  []);

  // Filtered + sorted table rows
  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...windowIncidents]
      .filter((i) => severityFilter === "all" || i.severity === severityFilter)
      .filter((i) => statusFilter   === "all" || i.status   === statusFilter)
      .filter((i) =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (incidentDetails[i.id]?.blastRadius ?? []).some((b) =>
          b.service.toLowerCase().includes(q)
        )
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "timestamp")  cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (sortKey === "severity")   cmp = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
        if (sortKey === "alertCount") cmp = a.alertCount - b.alertCount;
        if (sortKey === "status")     cmp = a.status.localeCompare(b.status);
        if (sortKey === "name")       cmp = a.name.localeCompare(b.name);
        return sortDir === "desc" ? -cmp : cmp;
      });
  }, [search, severityFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const pageRows   = tableRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handleSelect(id: string) {
    setSelectedIncidentId(id);
    navigate("/investigation");
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
    <div
      style={{
        padding: "var(--page-pad)",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ── Page header ──────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
          History
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
          Browse and analyse all incidents with filters, sorting and search
        </p>
      </div>

      {windowIncidents.length === 0 ? (
        <div style={{ padding: "56px 0", textAlign: "center", backgroundColor: "var(--color-bg-card)", borderRadius: 14, border: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 13 }}>
          No incidents found
        </div>
      ) : (
        <>
          {/* ── Row 1: Alert Level snapshot ────────────────────────── */}
          <AlertLevelBar
            snapshot={snapshot}
            periodLabel="All time"
            windowCount={windowIncidents.length}
          />

          {/* ── Row 2: Historical Clusters ──────────────────────────── */}
          {clusters.length > 0 && (
            <CorrelationTile
              clusters={clusters}
              onSelect={handleSelect}
              mode="archive"
            />
          )}

          {/* ── Row 3: Full incident table ──────────────────────────── */}
          <div
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              overflow: "hidden",
            }}
          >
            {/* Table toolbar */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginRight: 4 }}>
                All Incidents
              </span>

              {/* Search */}
              <div style={{ position: "relative", flex: "1 1 180px", minWidth: 140 }}>
                <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, ID, or service…"
                  style={{ width: "100%", paddingLeft: 28, paddingRight: search ? 28 : 10, paddingTop: 6, paddingBottom: 6, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-primary)", fontSize: 12, color: "var(--color-text-primary)", outline: "none" }}
                />
                {search && (
                  <button onClick={() => { setSearch(""); setPage(1); }} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                )}
              </div>

              {/* Severity chips */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(["all", "critical", "high", "medium", "low"] as SeverityFilter[]).map((s) => {
                  const active = severityFilter === s;
                  const color  = s === "all" ? "#EB5928" : SEV_COLOR[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { setSeverity(s); setPage(1); }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`,
                        backgroundColor: active ? `${color}12` : "transparent",
                        color: active ? color : "var(--color-text-muted)",
                        fontSize: 11,
                        fontWeight: active ? 800 : 600,
                        cursor: "pointer",
                      }}
                    >
                      {s === "all" ? "All" : SEV_LABEL[s]}
                    </button>
                  );
                })}
              </div>

              {/* Status chips */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(["all", "active", "investigating", "resolved"] as StatusFilter[]).map((s) => {
                  const active = statusFilter === s;
                  const color  = s === "all" ? "#6B7280" : STATUS_COLOR[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setPage(1); }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`,
                        backgroundColor: active ? `${color}12` : "transparent",
                        color: active ? color : "var(--color-text-muted)",
                        fontSize: 11,
                        fontWeight: active ? 800 : 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {s === "all" ? "All status" : s}
                    </button>
                  );
                })}
              </div>

              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>
                {tableRows.length} result{tableRows.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 90px 80px 70px 80px",
                padding: "8px 18px",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-primary)",
              }}
            >
              {([
                { key: "name"       as SortKey, label: "Incident"     },
                { key: "severity"   as SortKey, label: "Severity"     },
                { key: "status"     as SortKey, label: "Status"       },
                { key: "alertCount" as SortKey, label: "Alerts"       },
                { key: "timestamp"  as SortKey, label: "Time"         },
              ]).map((col, ci) => (
                <button
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: sortKey === col.key ? "#EB5928" : "var(--color-text-muted)",
                    padding: 0,
                    gridColumn: ci === 0 ? "2" : undefined,
                  }}
                >
                  {col.label}
                  {sortKey === col.key
                    ? sortDir === "desc"
                      ? <ChevronDownIcon style={{ width: 10, height: 10 }} />
                      : <ChevronUp style={{ width: 10, height: 10 }} />
                    : <ArrowUpDown style={{ width: 9, height: 9, opacity: 0.4 }} />
                  }
                </button>
              ))}
            </div>

            {/* Table rows */}
            <div>
              <AnimatePresence initial={false}>
                {pageRows.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                    No incidents match your filters
                  </div>
                ) : (
                  pageRows.map((inc, i) => {
                    const sevColor    = SEV_COLOR[inc.severity]    ?? "#6B7280";
                    const statusColor = STATUS_COLOR[inc.status]   ?? "#6B7280";
                    return (
                      <motion.button
                        key={inc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => handleSelect(inc.id)}
                        style={{
                          width: "100%",
                          display: "grid",
                          gridTemplateColumns: "80px 1fr 90px 80px 70px 80px",
                          alignItems: "center",
                          padding: "10px 18px",
                          border: "none",
                          borderBottom: i < pageRows.length - 1 ? "1px solid var(--color-border)" : "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.1s",
                          gap: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${sevColor}06`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                        }}
                      >
                        {/* ID */}
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                          {inc.id}
                        </span>

                        {/* Name */}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingRight: 12,
                          }}
                        >
                          {inc.name}
                        </span>

                        {/* Severity */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: sevColor,
                            backgroundColor: `${sevColor}12`,
                            padding: "2px 8px",
                            borderRadius: 999,
                            display: "inline-block",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {SEV_LABEL[inc.severity] ?? inc.severity}
                        </span>

                        {/* Status */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: statusColor,
                            backgroundColor: `${statusColor}10`,
                            padding: "2px 8px",
                            borderRadius: 999,
                            display: "inline-block",
                            textTransform: "capitalize",
                          }}
                        >
                          {inc.status}
                        </span>

                        {/* Alert count */}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--color-text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <AlertOctagon style={{ width: 10, height: 10, color: sevColor }} />
                          {inc.alertCount}
                        </span>

                        {/* Timestamp + chevron */}
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Clock style={{ width: 9, height: 9 }} />
                          {formatTime(inc.timestamp)}
                          <ChevronRight style={{ width: 11, height: 11, marginLeft: 2, flexShrink: 0 }} />
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  padding: "10px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  Page {page} of {totalPages} &nbsp;·&nbsp; {tableRows.length} incidents
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-primary)",
                      color: page === 1 ? "var(--color-text-muted)" : "var(--color-text-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    ← Prev
                  </button>

                  {/* Page number buttons */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, k) => {
                    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = startPage + k;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: `1px solid ${p === page ? "rgba(235,89,40,0.4)" : "var(--color-border)"}`,
                          backgroundColor: p === page ? "rgba(235,89,40,0.10)" : "var(--color-bg-primary)",
                          color: p === page ? "#EB5928" : "var(--color-text-muted)",
                          fontSize: 12,
                          fontWeight: p === page ? 800 : 600,
                          cursor: "pointer",
                          minWidth: 34,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-primary)",
                      color: page === totalPages ? "var(--color-text-muted)" : "var(--color-text-primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      opacity: page === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </div>
  );
}
