import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, AlertOctagon, Server, Search, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents, dashboardMetrics, incidentDetails } from "../data/mockData";
import MetricCard from "../components/shared/MetricCard";
import IncidentRow from "../components/dashboard/IncidentRow";
import ArchiveIncidentRow from "../components/dashboard/ArchiveIncidentRow";

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const SEV_RANK: Record<string, number>    = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_RANK: Record<string, number> = { active: 0, investigating: 1, resolved: 2 };
const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#22C55E",
};

function sortIncidents(list: typeof incidents) {
  return [...list].sort((a, b) => {
    const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (s !== 0) return s;
    const sv = SEV_RANK[a.severity] - SEV_RANK[b.severity];
    if (sv !== 0) return sv;
    return b.alertCount - a.alertCount;
  });
}

type DashboardTab = "live" | "archive";
type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

function toISODateLocal(d: Date) {
  // YYYY-MM-DD in local time for <input type="date" />
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedIncidentId, setSelectedIncidentId } = useAppContext();

  const [tab, setTab] = useState<DashboardTab>("live");
  const [query, setQuery]             = useState("");
  const [liveSeverityFilter, setLiveSeverityFilter] = useState<SeverityFilter>("all");
  const [livePage, setLivePage] = useState(0);
  const [archiveRange, setArchiveRange] = useState<"24h" | "7d" | "30d" | "custom">("7d");
  const [archiveSeverity, setArchiveSeverity] = useState<SeverityFilter>("all");

  const [archiveCustomFrom, setArchiveCustomFrom] = useState(() =>
    toISODateLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  const [archiveCustomTo, setArchiveCustomTo] = useState(() => toISODateLocal(new Date()));

  const handleSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
  };

  const sorted = useMemo(() => sortIncidents(incidents), []);

  // Full filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((i) => {
      const matchesSeverity = liveSeverityFilter === "all" || i.severity === liveSeverityFilter;
      const matchesQuery  = !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      return matchesSeverity && matchesQuery;
    });
  }, [sorted, query, liveSeverityFilter]);

  const LIVE_PAGE_SIZE = 10;
  const liveTotalPages = Math.max(1, Math.ceil(filtered.length / LIVE_PAGE_SIZE));

  const liveStart = livePage * LIVE_PAGE_SIZE;
  const livePageItems = useMemo(() => {
    return filtered.slice(liveStart, liveStart + LIVE_PAGE_SIZE);
  }, [filtered, liveStart]);

  // Reset paging when filters/search change
  useEffect(() => {
    setLivePage(0);
  }, [query, liveSeverityFilter]);

  // Clamp if filtered list shrinks
  useEffect(() => {
    setLivePage((p) => Math.min(p, liveTotalPages - 1));
  }, [liveTotalPages]);

  // Count per status for filter chip badges
  const counts = useMemo(() => ({
    all:           incidents.length,
    active:        incidents.filter((i) => i.status === "active").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved:      incidents.filter((i) => i.status === "resolved").length,
  }), []);

  const archiveFiltered = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();

    return [...incidents]
      .filter((i) => i.status === "resolved")
      .filter((i) => {
        const ts = new Date(i.timestamp).getTime();
        if (!Number.isFinite(ts)) return true;

        if (archiveRange === "custom") {
          const fromMs = archiveCustomFrom
            ? new Date(`${archiveCustomFrom}T00:00:00`).getTime()
            : -Infinity;
          const toMs = archiveCustomTo
            ? new Date(`${archiveCustomTo}T23:59:59.999`).getTime()
            : Infinity;
          return ts >= fromMs && ts <= toMs;
        }

        const rangeMs =
          archiveRange === "24h"
            ? 24 * 60 * 60 * 1000
            : archiveRange === "7d"
              ? 7 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000;
        const cutoff = now - rangeMs;
        return ts >= cutoff;
      })
      .filter((i) => archiveSeverity === "all" || i.severity === archiveSeverity)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [archiveRange, archiveCustomFrom, archiveCustomTo, query, archiveSeverity]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page title ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
            Executive Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
            Real-time incident overview and cluster monitoring
          </p>
        </motion.div>

        {/* ── Metric cards ────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 18 }}>
          <MetricCard title="Active Clusters"   value={dashboardMetrics.activeClusters}   icon={<Layers     style={{ width: 18, height: 18 }} />} />
          <MetricCard title="Critical Alerts"   value={dashboardMetrics.criticalAlerts}   icon={<AlertOctagon style={{ width: 18, height: 18 }} />} iconColor="var(--color-critical)" />
          <MetricCard title="Impacted Services" value={dashboardMetrics.impactedServices} icon={<Server     style={{ width: 18, height: 18 }} />} iconColor="var(--color-high)" />
        </div>

        {/* ── Tabs ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {([
            { id: "live" as const, label: "Live" },
            { id: "archive" as const, label: `Archive (${counts.resolved})` },
          ]).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setQuery("");
                  setLiveSeverityFilter("all");
                  setArchiveSeverity("all");
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1px solid ${active ? "rgba(235,89,40,0.4)" : "var(--color-border)"}`,
                  backgroundColor: active ? "rgba(235,89,40,0.10)" : "var(--color-bg-card)",
                  color: active ? "#EB5928" : "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "live" && (
          <>
            {/* ── All incidents section ───────────────────────── */}
            <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>
              All Incidents
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginLeft: 8 }}>
                {filtered.length} of {incidents.length}
              </span>
            </h2>

            {/* Search */}
            <div style={{ position: "relative", flex: "0 0 auto" }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--color-text-muted)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or ID…"
                style={{ paddingLeft: 30, paddingRight: query ? 30 : 12, paddingTop: 7, paddingBottom: 7, width: 220, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", fontSize: 12, color: "var(--color-text-primary)", outline: "none" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
          </div>

          {/* Severity filter chips (same levels as Archive) */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {(
              [
                { id: "all" as const, label: "All" },
                { id: "critical" as const, label: "Critical" },
                { id: "high" as const, label: "High" },
                { id: "medium" as const, label: "Medium" },
                { id: "low" as const, label: "Low" },
              ] as const
            ).map((s) => {
              const active = liveSeverityFilter === s.id;
              const color = s.id === "all" ? "#EB5928" : SEV_COLOR[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => setLiveSeverityFilter(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`,
                    backgroundColor: active ? `${color}12` : "var(--color-bg-card)",
                    color: active ? color : "var(--color-text-muted)",
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: s.id === "all" ? "#6B7280" : color, flexShrink: 0 }} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Table header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 14px 6px 17px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-hover-bg)", borderRadius: "10px 10px 0 0" }}>
            <span style={{ width: 8, flexShrink: 0 }} />
            <span style={{ minWidth: 52 }}>ID</span>
            <span style={{ flex: 1 }}>Name</span>
            <span style={{ flexShrink: 0, minWidth: 96 }}>Status</span>
            <span style={{ flexShrink: 0, minWidth: 68 }}>Alerts</span>
            <span style={{ flexShrink: 0, minWidth: 60 }}>Services</span>
            <span style={{ flexShrink: 0, minWidth: 44 }}>Time</span>
            <span style={{ width: 13, flexShrink: 0 }} />
          </div>

          {/* Rows */}
          <div style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                  No incidents match your filter
                </div>
              ) : (
                  livePageItems.map((incident, i) => (
                  <IncidentRow
                    key={incident.id}
                    incident={incident}
                    isSelected={selectedIncidentId === incident.id}
                    onClick={() => handleSelect(incident.id)}
                      index={liveStart + i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 4px 0" }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  Page {livePage + 1} of {liveTotalPages}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setLivePage((p) => Math.max(0, p - 1))}
                    disabled={livePage <= 0}
                    style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-secondary)", cursor: livePage <= 0 ? "not-allowed" : "pointer", opacity: livePage <= 0 ? 0.6 : 1 }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setLivePage((p) => Math.min(liveTotalPages - 1, p + 1))}
                    disabled={livePage >= liveTotalPages - 1}
                    style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", color: "var(--color-text-secondary)", cursor: livePage >= liveTotalPages - 1 ? "not-allowed" : "pointer", opacity: livePage >= liveTotalPages - 1 ? 0.6 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </div>
          </>
        )}

        {tab === "archive" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>
                Incident Archive
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)", marginLeft: 8 }}>
                  {archiveFiltered.length} results
                </span>
              </h2>

              {/* Search */}
              <div style={{ position: "relative", flex: "0 0 auto" }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search resolved incidents…"
                  style={{ paddingLeft: 30, paddingRight: query ? 30 : 12, paddingTop: 7, paddingBottom: 7, width: 240, borderRadius: 8, border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-card)", fontSize: 12, color: "var(--color-text-primary)", outline: "none" }}
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Date range chips */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {([
                { id: "24h" as const, label: "Last 24h" },
                { id: "7d" as const, label: "Last 7d" },
                { id: "30d" as const, label: "Last 30d" },
                { id: "custom" as const, label: "Custom" },
              ]).map((r) => {
                const active = archiveRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setArchiveRange(r.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: `1px solid ${active ? "rgba(59,130,246,0.45)" : "var(--color-border)"}`,
                      backgroundColor: active ? "rgba(59,130,246,0.12)" : "var(--color-bg-card)",
                      color: active ? "#93C5FD" : "var(--color-text-muted)",
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      cursor: "pointer",
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Custom range */}
            {archiveRange === "custom" && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-card)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-text-muted)" }}>From</span>
                  <input
                    type="date"
                    value={archiveCustomFrom}
                    onChange={(e) => setArchiveCustomFrom(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-card)",
                      color: "var(--color-text-primary)",
                      colorScheme: "light",
                      caretColor: "var(--color-text-primary)",
                      fontSize: 12,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-text-muted)" }}>To</span>
                  <input
                    type="date"
                    value={archiveCustomTo}
                    onChange={(e) => setArchiveCustomTo(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-card)",
                      color: "var(--color-text-primary)",
                      colorScheme: "light",
                      caretColor: "var(--color-text-primary)",
                      fontSize: 12,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setArchiveCustomFrom(toISODateLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
                    setArchiveCustomTo(toISODateLocal(new Date()));
                  }}
                  style={{
                    marginLeft: "auto",
                    padding: "7px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-card)",
                    color: "var(--color-text-muted)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  title="Reset to last 7 days"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Severity chips (consistent with Live) */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {(
                [
                  { id: "all" as const, label: "All" },
                  { id: "critical" as const, label: "Critical" },
                  { id: "high" as const, label: "High" },
                  { id: "medium" as const, label: "Medium" },
                  { id: "low" as const, label: "Low" },
                ] as const
              ).map((s) => {
                const active = archiveSeverity === s.id;
                const color = s.id === "all" ? "#EB5928" : SEV_COLOR[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => setArchiveSeverity(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: `1px solid ${active ? `${color}55` : "var(--color-border)"}`,
                      backgroundColor: active ? `${color}12` : "var(--color-bg-card)",
                      color: active ? color : "var(--color-text-muted)",
                      fontSize: 12,
                      fontWeight: active ? 800 : 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: s.id === "all" ? "#6B7280" : color, flexShrink: 0 }} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Rows */}
            <div style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
              <AnimatePresence>
                {archiveFiltered.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                    No resolved incidents found in this range
                  </div>
                ) : (
                  archiveFiltered.map((incident, i) => (
                    <ArchiveIncidentRow
                      key={incident.id}
                      incident={incident}
                      detail={incidentDetails[incident.id]}
                      onClick={() => handleSelect(incident.id)}
                      index={i}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
