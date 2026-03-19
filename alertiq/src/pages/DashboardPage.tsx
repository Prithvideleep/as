import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, AlertOctagon, Server, Search, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents, dashboardMetrics } from "../data/mockData";
import MetricCard from "../components/shared/MetricCard";
import IncidentCard from "../components/dashboard/IncidentCard";
import IncidentRow from "../components/dashboard/IncidentRow";

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const SEV_RANK: Record<string, number>    = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_RANK: Record<string, number> = { active: 0, investigating: 1, resolved: 2 };

function sortIncidents(list: typeof incidents) {
  return [...list].sort((a, b) => {
    const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (s !== 0) return s;
    const sv = SEV_RANK[a.severity] - SEV_RANK[b.severity];
    if (sv !== 0) return sv;
    return b.alertCount - a.alertCount;
  });
}

type StatusFilter = "all" | "active" | "investigating" | "resolved";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all",           label: "All"           },
  { id: "active",        label: "Active"        },
  { id: "investigating", label: "Investigating" },
  { id: "resolved",      label: "Resolved"      },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedIncidentId, setSelectedIncidentId } = useAppContext();

  const [query, setQuery]             = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const handleSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
  };

  const sorted = useMemo(() => sortIncidents(incidents), []);

  // Priority spotlight: active + critical or high, max 4 cards
  const spotlight = useMemo(
    () => sorted.filter((i) => i.status === "active" && (i.severity === "critical" || i.severity === "high")).slice(0, 4),
    [sorted]
  );

  // Full filtered list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((i) => {
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      const matchesQuery  = !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [sorted, query, statusFilter]);

  // Count per status for filter chip badges
  const counts = useMemo(() => ({
    all:           incidents.length,
    active:        incidents.filter((i) => i.status === "active").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved:      incidents.filter((i) => i.status === "resolved").length,
  }), []);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <MetricCard title="Active Clusters"   value={dashboardMetrics.activeClusters}   icon={<Layers     style={{ width: 18, height: 18 }} />} />
          <MetricCard title="Critical Alerts"   value={dashboardMetrics.criticalAlerts}   icon={<AlertOctagon style={{ width: 18, height: 18 }} />} iconColor="var(--color-critical)" />
          <MetricCard title="Impacted Services" value={dashboardMetrics.impactedServices} icon={<Server     style={{ width: 18, height: 18 }} />} iconColor="var(--color-high)" />
        </div>

        {/* ── Priority spotlight ──────────────────────────── */}
        {spotlight.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 6px #EF4444", animation: "pulse-glow 2s infinite" }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Needs Attention
              </h2>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                — {spotlight.length} active critical / high severity
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(spotlight.length, 2)}, 1fr)`, gap: 12 }}>
              {spotlight.map((incident, i) => (
                <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <IncidentCard incident={incident} isSelected={selectedIncidentId === incident.id} onClick={() => handleSelect(incident.id)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

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

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: active ? 700 : 500,
                    backgroundColor: active ? "rgba(235,89,40,0.10)" : "var(--color-bg-card)",
                    border: `1px solid ${active ? "rgba(235,89,40,0.4)" : "var(--color-border)"}`,
                    color: active ? "#EB5928" : "var(--color-text-muted)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {f.label}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "0px 5px", borderRadius: 999, backgroundColor: active ? "rgba(235,89,40,0.15)" : "var(--color-hover-bg)", color: active ? "#EB5928" : "var(--color-text-muted)" }}>
                    {counts[f.id]}
                  </span>
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
                filtered.map((incident, i) => (
                  <IncidentRow
                    key={incident.id}
                    incident={incident}
                    isSelected={selectedIncidentId === incident.id}
                    onClick={() => handleSelect(incident.id)}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
