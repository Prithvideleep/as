import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronRight, ChevronUp, ChevronDown as ChevronDownIcon,
  Clock, AlertOctagon, ArrowUpDown, CheckCircle, Server, SlidersHorizontal,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents, incidentDetails } from "../data/mockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Cross-incident service aggregation
interface ServiceStat {
  service: string;
  incidentCount: number;
  topSeverity: string;
  hasActive: boolean;
}

function buildRecurringServices(): ServiceStat[] {
  const map = new Map<string, ServiceStat>();
  for (const inc of incidents) {
    const detail = incidentDetails[inc.id];
    if (!detail) continue;
    for (const br of detail.blastRadius) {
      const existing = map.get(br.service);
      const isActive = inc.status !== "resolved";
      if (!existing) {
        map.set(br.service, {
          service: br.service,
          incidentCount: 1,
          topSeverity: br.severity,
          hasActive: isActive,
        });
      } else {
        existing.incidentCount++;
        if (SEV_ORDER[br.severity] < SEV_ORDER[existing.topSeverity]) {
          existing.topSeverity = br.severity;
        }
        if (isActive) existing.hasActive = true;
      }
    }
  }
  return [...map.values()]
    .filter((s) => s.incidentCount > 1)
    .sort((a, b) => b.incidentCount - a.incidentCount);
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
type TimeFilter     = "all" | "15m" | "1h" | "6h" | "24h" | "7d" | "30d" | "custom";


const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  // Resolution log accordion
  const [openResolution, setOpenResolution] = useState<string | null>(null);

  // Filter panel
  const [filterOpen, setFilterOpen]           = useState(false);
  // Pending (in-panel, not yet applied)
  const [pendingSeverity, setPendingSeverity] = useState<SeverityFilter>("all");
  const [pendingStatus,   setPendingStatus]   = useState<StatusFilter>("all");
  const [pendingTime,     setPendingTime]     = useState<TimeFilter>("all");
  const [pendingFrom,     setPendingFrom]     = useState("");
  const [pendingTo,       setPendingTo]       = useState("");
  // Applied (active filters)
  const [severityFilter, setSeverity] = useState<SeverityFilter>("all");
  const [statusFilter,   setStatus]   = useState<StatusFilter>("all");
  const [timeFilter,     setTimeFilter] = useState<TimeFilter>("all");
  const [fromDate,       setFromDate]  = useState("");
  const [toDate,         setToDate]    = useState("");

  // Table state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage]       = useState(1);

  const activeFilterCount = [
    severityFilter !== "all" ? 1 : 0,
    statusFilter   !== "all" ? 1 : 0,
    timeFilter     !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function openFilterPanel() {
    setPendingSeverity(severityFilter);
    setPendingStatus(statusFilter);
    setPendingTime(timeFilter);
    setPendingFrom(fromDate);
    setPendingTo(toDate);
    setFilterOpen(true);
  }

  function applyFilters() {
    setSeverity(pendingSeverity);
    setStatus(pendingStatus);
    setTimeFilter(pendingTime);
    setFromDate(pendingFrom);
    setToDate(pendingTo);
    setPage(1);
    setFilterOpen(false);
  }

  function clearFilters() {
    setPendingSeverity("all"); setPendingStatus("all");
    setPendingTime("all"); setPendingFrom(""); setPendingTo("");
    setSeverity("all"); setStatus("all");
    setTimeFilter("all"); setFromDate(""); setToDate("");
    setPage(1);
    setFilterOpen(false);
  }

  // All incidents
  const windowIncidents = incidents;

  // Derived stats
  const resolvedIncidents = useMemo(() => incidents.filter((i) => i.status === "resolved"), []);
  const resolvedPct       = Math.round((resolvedIncidents.length / incidents.length) * 100);
  const recurringServices = useMemo(() => buildRecurringServices(), []);
  const mostImpacted      = recurringServices[0]?.service ?? "—";

  // Filtered + sorted table rows
  const tableRows = useMemo(() => {
    const q    = search.trim().toLowerCase();
    const now  = Date.now();
    const msMap: Record<string, number> = { "15m": 900000, "1h": 3600000, "6h": 21600000, "24h": 86400000, "7d": 604800000, "30d": 2592000000 };
    const fromMs = fromDate ? new Date(fromDate).getTime() : -Infinity;
    const toMs   = toDate   ? new Date(toDate).getTime()   : Infinity;

    return [...windowIncidents]
      .filter((i) => severityFilter === "all" || i.severity === severityFilter)
      .filter((i) => statusFilter   === "all" || i.status   === statusFilter)
      .filter((i) => {
        if (timeFilter === "all") return true;
        const ts = new Date(i.timestamp).getTime();
        if (timeFilter === "custom") return ts >= fromMs && ts <= toMs;
        return ts >= now - msMap[timeFilter];
      })
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
  }, [search, severityFilter, statusFilter, timeFilter, fromDate, toDate, sortKey, sortDir]);

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
          {/* ── Row 1: Outcome Summary ──────────────────────────────── */}
          <div
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              padding: "18px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 0,
            }}
          >
            {[
              {
                label: "Total Incidents",
                value: incidents.length,
                sub: "all time",
                color: "var(--color-text-primary)",
                icon: <AlertOctagon style={{ width: 14, height: 14 }} />,
              },
              {
                label: "Resolved",
                value: `${resolvedIncidents.length}`,
                sub: `${resolvedPct}% resolution rate`,
                color: "#22C55E",
                icon: <CheckCircle style={{ width: 14, height: 14 }} />,
              },
              {
                label: "Most Impacted Service",
                value: mostImpacted,
                sub: `${recurringServices[0]?.incidentCount ?? 0} incidents`,
                color: "#EB5928",
                icon: <Server style={{ width: 14, height: 14 }} />,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "8px 20px",
                  borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--color-text-muted)" }}>
                  {stat.icon}
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {stat.label}
                  </span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* ── Row 2: Recurring Services ───────────────────────────── */}
          {recurringServices.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-bg-card)",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Server style={{ width: 13, height: 13, color: "var(--color-accent)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    Recurring Services
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                  Services appearing in more than one incident — cross-incident hotspots
                </p>
              </div>
              <div>
                {recurringServices.slice(0, 8).map((svc, i) => {
                  const color = SEV_COLOR[svc.topSeverity] ?? "#6B7280";
                  return (
                    <div
                      key={svc.service}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 20px",
                        borderBottom: i < Math.min(recurringServices.length, 8) - 1 ? "1px solid var(--color-border)" : "none",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {svc.service}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)", minWidth: 80 }}>
                        ×{svc.incidentCount} incidents
                      </span>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 800, color, backgroundColor: `${color}12`,
                          padding: "2px 7px", borderRadius: 999, letterSpacing: "0.04em",
                        }}
                      >
                        {SEV_LABEL[svc.topSeverity] ?? svc.topSeverity}
                      </span>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 700,
                          color: svc.hasActive ? "#EF4444" : "#22C55E",
                          backgroundColor: svc.hasActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                          padding: "2px 7px", borderRadius: 999,
                        }}
                      >
                        {svc.hasActive ? "Active" : "All resolved"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Row 3: Resolution Log ───────────────────────────────── */}
          {resolvedIncidents.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--color-bg-card)",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <CheckCircle style={{ width: 13, height: 13, color: "#22C55E" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    Resolution Log
                  </span>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, color: "#22C55E",
                      backgroundColor: "rgba(34,197,94,0.1)", padding: "1px 7px", borderRadius: 999,
                    }}
                  >
                    {resolvedIncidents.length} resolved
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                  How each incident was resolved — actions taken and steps followed
                </p>
              </div>

              {resolvedIncidents.map((inc, i) => {
                const detail  = incidentDetails[inc.id];
                const color   = SEV_COLOR[inc.severity] ?? "#6B7280";
                const isOpen  = openResolution === inc.id;
                const isLast  = i === resolvedIncidents.length - 1;
                return (
                  <div key={inc.id} style={{ borderBottom: isLast ? "none" : "1px solid var(--color-border)" }}>
                    {/* Header row */}
                    <button
                      onClick={() => setOpenResolution(isOpen ? null : inc.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 20px",
                        background: isOpen ? `${color}06` : "none",
                        border: "none", cursor: "pointer", textAlign: "left",
                        transition: "background 0.12s",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {inc.name}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 800, color, backgroundColor: `${color}12`, padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>
                        {SEV_LABEL[inc.severity]}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock style={{ width: 9, height: 9 }} />
                        {formatTime(inc.timestamp)}
                      </span>
                      <ChevronDownIcon
                        style={{
                          width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {/* Expanded resolution notes */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              padding: "12px 20px 16px 36px",
                              backgroundColor: `${color}04`,
                              borderTop: `1px solid ${color}18`,
                            }}
                          >
                            {detail?.resolutionSummary ? (
                              <>
                                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
                                  {detail.resolutionSummary}
                                </p>
                                {detail.resolutionSteps && detail.resolutionSteps.length > 0 && (
                                  <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                                    {detail.resolutionSteps.map((step, si) => (
                                      <li key={si} style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                )}
                              </>
                            ) : (
                              <p style={{ fontSize: 12, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                                Resolution notes not recorded for this incident.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Row 4: Full incident table ──────────────────────────── */}
          <div
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              overflow: "hidden",
            }}
          >
            {/* Table toolbar */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--color-border)" }}>
              {/* Top row: title + search + filter button + count */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", flexShrink: 0 }}>
                  All Incidents
                </span>

                {/* Search */}
                <div style={{ position: "relative", flex: 1, minWidth: 140 }}>
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

                {/* Filter button */}
                <button
                  onClick={() => filterOpen ? setFilterOpen(false) : openFilterPanel()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, flexShrink: 0,
                    border: `1px solid ${activeFilterCount > 0 ? "rgba(235,89,40,0.4)" : "var(--color-border)"}`,
                    backgroundColor: activeFilterCount > 0 ? "rgba(235,89,40,0.08)" : "var(--color-bg-primary)",
                    color: activeFilterCount > 0 ? "#EB5928" : "var(--color-text-secondary)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <SlidersHorizontal style={{ width: 13, height: 13 }} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span style={{ backgroundColor: "#EB5928", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 800, padding: "0px 5px", lineHeight: "16px" }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span style={{ fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>
                  {tableRows.length} result{tableRows.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Filter panel — drops down when open */}
              <AnimatePresence initial={false}>
                {filterOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        marginTop: 12, padding: "14px 16px",
                        borderRadius: 10, border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-bg-primary)",
                        display: "flex", flexDirection: "column", gap: 14,
                      }}
                    >
                      {/* Severity */}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Severity</span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(["all", "critical", "high", "medium", "low"] as SeverityFilter[]).map((s) => {
                            const active = pendingSeverity === s;
                            const color  = s === "all" ? "#6B7280" : SEV_COLOR[s];
                            return (
                              <button key={s} onClick={() => setPendingSeverity(s)} style={{ padding: "4px 12px", borderRadius: 999, border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`, backgroundColor: active ? `${color}14` : "transparent", color: active ? color : "var(--color-text-muted)", fontSize: 11, fontWeight: active ? 800 : 600, cursor: "pointer" }}>
                                {s === "all" ? "All" : SEV_LABEL[s]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Status</span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(["all", "active", "investigating", "resolved"] as StatusFilter[]).map((s) => {
                            const active = pendingStatus === s;
                            const color  = s === "all" ? "#6B7280" : STATUS_COLOR[s];
                            return (
                              <button key={s} onClick={() => setPendingStatus(s)} style={{ padding: "4px 12px", borderRadius: 999, border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`, backgroundColor: active ? `${color}14` : "transparent", color: active ? color : "var(--color-text-muted)", fontSize: 11, fontWeight: active ? 800 : 600, cursor: "pointer", textTransform: "capitalize" }}>
                                {s === "all" ? "All" : s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time */}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>Time Range</span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          {([
                            { id: "all"    as TimeFilter, label: "All time"  },
                            { id: "15m"    as TimeFilter, label: "Last 15m"  },
                            { id: "1h"     as TimeFilter, label: "Last 1h"   },
                            { id: "6h"     as TimeFilter, label: "Last 6h"   },
                            { id: "24h"    as TimeFilter, label: "Last 24h"  },
                            { id: "7d"     as TimeFilter, label: "Last 7d"   },
                            { id: "30d"    as TimeFilter, label: "Last 30d"  },
                            { id: "custom" as TimeFilter, label: "Custom"    },
                          ]).map(({ id, label }) => {
                            const active = pendingTime === id;
                            return (
                              <button key={id} onClick={() => setPendingTime(id)} style={{ padding: "4px 12px", borderRadius: 999, border: `1px solid ${active ? "rgba(235,89,40,0.4)" : "var(--color-border)"}`, backgroundColor: active ? "rgba(235,89,40,0.10)" : "transparent", color: active ? "#EB5928" : "var(--color-text-muted)", fontSize: 11, fontWeight: active ? 800 : 600, cursor: "pointer" }}>
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {pendingTime === "custom" && (
                          <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)" }}>From</span>
                              <input type="datetime-local" value={pendingFrom} onChange={(e) => setPendingFrom(e.target.value)}
                                style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-primary)", colorScheme: "light", fontSize: 12, outline: "none" }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)" }}>To</span>
                              <input type="datetime-local" value={pendingTo} onChange={(e) => setPendingTo(e.target.value)}
                                style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-primary)", colorScheme: "light", fontSize: 12, outline: "none" }} />
                            </div>
                            <button
                              onClick={() => {
                                const now = new Date();
                                const weekAgo = new Date(now.getTime() - 7*24*60*60*1000);
                                const fmt = (d: Date) => d.toISOString().slice(0, 16);
                                setPendingFrom(fmt(weekAgo));
                                setPendingTo(fmt(now));
                              }}
                              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--color-border)", background: "none", color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Reset
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
                        <button onClick={clearFilters} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--color-border)", background: "none", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          Clear all
                        </button>
                        <button onClick={applyFilters} style={{ padding: "6px 16px", borderRadius: 8, border: "none", backgroundColor: "#EB5928", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                          Apply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
