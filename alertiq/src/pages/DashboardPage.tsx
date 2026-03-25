import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, AlertOctagon, Server, Search, X, RefreshCw, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  incidents,
  dashboardMetrics,
  incidentDetails,
  alertLevelSnapshot as initialSnapshot,
  correlationClusters,
} from "../data/mockData";
import type { AlertLevelSnapshot } from "../data/mockData";
import MetricCard from "../components/shared/MetricCard";
import AlertLevelBar from "../components/dashboard/AlertLevelBar";
import AlertDetailsPanel from "../components/dashboard/AlertDetailsPanel";
import CorrelationTile from "../components/dashboard/CorrelationTile";
import IncidentTile from "../components/dashboard/IncidentTile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedIncidentId, setSelectedIncidentId } = useAppContext();

  // Live — search-browse (secondary section, minimal)
  const [browseQuery, setBrowseQuery] = useState("");
  const [browseOpen, setBrowseOpen]   = useState(false);

  // Snapshot refresh (mock: just bumps lastUpdated)
  const [snapshot, setSnapshot] = useState<AlertLevelSnapshot>(initialSnapshot);
  const handleRefresh = useCallback(() => {
    setSnapshot((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
  }, []);

  const handleSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
  };

  // Browse-incidents list (filtered by query)
  const browseResults = useMemo(() => {
    const q = browseQuery.trim().toLowerCase();
    if (!q) return incidents.filter((i) => i.status !== "resolved");
    return incidents.filter(
      (i) =>
        (i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)) &&
        i.status !== "resolved"
    );
  }, [browseQuery]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page title + Refresh ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
              Alert IQ Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Real-time AI-grouped alert intelligence and cluster monitoring
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-secondary)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,89,40,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "#EB5928";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Refresh
          </button>
        </motion.div>

        {/* ── Metric cards ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
          <MetricCard title="Active Clusters"   value={dashboardMetrics.activeClusters}   icon={<Layers       style={{ width: 18, height: 18 }} />} />
          <MetricCard title="Critical Alerts"   value={dashboardMetrics.criticalAlerts}   icon={<AlertOctagon style={{ width: 18, height: 18 }} />} iconColor="var(--color-critical)" />
          <MetricCard title="Impacted Services" value={dashboardMetrics.impactedServices} icon={<Server       style={{ width: 18, height: 18 }} />} iconColor="var(--color-high)" />
        </div>

        {/* ════════════════ LIVE VIEW ══════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
            {/* ── Row 1: Alert Level + Alert Details + Incident Tile ── */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <AlertLevelBar snapshot={snapshot} onRefresh={handleRefresh} />
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
              </div>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <IncidentTile
                  incidents={incidents}
                  incidentDetails={incidentDetails}
                  onSelect={handleSelect}
                  lastUpdated={snapshot.lastUpdated}
                />
              </div>
            </div>

            {/* ── Row 2: Correlation Tile ─────────────────────── */}
            <CorrelationTile clusters={correlationClusters} onSelect={handleSelect} />

            {/* ── Row 3: Browse / Find Incident ──────────────── */}
            <div
              style={{
                backgroundColor: "var(--color-bg-card)",
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              {/* Browse header */}
              <button
                onClick={() => setBrowseOpen((v) => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Search style={{ width: 14, height: 14, color: "var(--color-text-muted)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  Browse / Find Incident
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {incidents.filter((i) => i.status !== "resolved").length} active
                </span>
                <ChevronRight
                  style={{
                    width: 14,
                    height: 14,
                    color: "var(--color-text-muted)",
                    transform: browseOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </button>

              <AnimatePresence initial={false}>
                {browseOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 18px 16px" }}>
                      {/* Search input */}
                      <div style={{ position: "relative", marginBottom: 12 }}>
                        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--color-text-muted)" }} />
                        <input
                          type="text"
                          value={browseQuery}
                          onChange={(e) => setBrowseQuery(e.target.value)}
                          placeholder="Search by service name, incident ID…"
                          style={{
                            width: "100%",
                            paddingLeft: 30,
                            paddingRight: browseQuery ? 30 : 12,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            backgroundColor: "var(--color-bg-primary)",
                            fontSize: 12,
                            color: "var(--color-text-primary)",
                            outline: "none",
                          }}
                        />
                        {browseQuery && (
                          <button
                            onClick={() => setBrowseQuery("")}
                            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}
                          >
                            <X style={{ width: 12, height: 12 }} />
                          </button>
                        )}
                      </div>

                      {/* Results list */}
                      <div style={{ borderRadius: 8, border: "1px solid var(--color-border)", overflow: "hidden" }}>
                        {browseResults.length === 0 ? (
                          <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "var(--color-text-muted)" }}>
                            No active incidents match your search
                          </div>
                        ) : (
                          browseResults.slice(0, 8).map((inc, i) => {
                            const dot = SEV_COLOR[inc.severity] ?? "#6B7280";
                            return (
                              <button
                                key={inc.id}
                                onClick={() => handleSelect(inc.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  width: "100%",
                                  padding: "9px 14px",
                                  background: selectedIncidentId === inc.id ? `${dot}08` : "transparent",
                                  border: "none",
                                  borderBottom: i < browseResults.length - 1 ? "1px solid var(--color-border)" : "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                    "var(--color-hover-bg)";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                    selectedIncidentId === inc.id ? `${dot}08` : "transparent";
                                }}
                              >
                                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 50 }}>{inc.id}</span>
                                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {inc.name}
                                </span>
                                <span style={{ fontSize: 10, color: dot, fontWeight: 700, flexShrink: 0 }}>
                                  {inc.severity.toUpperCase()}
                                </span>
                                <ChevronRight style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} />
                              </button>
                            );
                          })
                        )}
                      </div>
                      {browseResults.length > 8 && (
                        <p style={{ marginTop: 8, fontSize: 11, color: "var(--color-text-muted)", textAlign: "center" }}>
                          Showing 8 of {browseResults.length} — narrow search to find specific incidents
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

      </div>
    </div>
  );
}
