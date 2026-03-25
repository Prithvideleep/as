import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  // Live — search-browse
  const [browseQuery, setBrowseQuery] = useState("");
  const [browsePage, setBrowsePage]   = useState(1);
  const BROWSE_PAGE_SIZE = 5;

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
            {/* ── Row 1: Left (Alert Level + Alert Details) | Right (Impacted Services) ── */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

              {/* Left column — alert severity overview */}
              <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", paddingLeft: 2 }}>
                  Alert Overview
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <AlertLevelBar snapshot={snapshot} onRefresh={handleRefresh} />
                  <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
                </div>
              </div>

              {/* Right column — service impact + search */}
              <div style={{ flex: "1.4 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", paddingLeft: 2 }}>
                  Service Impact
                </span>
                <IncidentTile
                  incidents={incidents}
                  incidentDetails={incidentDetails}
                  onSelect={handleSelect}
                  lastUpdated={snapshot.lastUpdated}
                />

                {/* Find Incident — always-visible card */}
                {(() => {
                  const totalBrowsePages = Math.max(1, Math.ceil(browseResults.length / BROWSE_PAGE_SIZE));
                  const pageRows = browseResults.slice((browsePage - 1) * BROWSE_PAGE_SIZE, browsePage * BROWSE_PAGE_SIZE);
                  return (
                    <div
                      style={{
                        backgroundColor: "var(--color-bg-card)",
                        borderRadius: 14,
                        border: "1px solid var(--color-border)",
                        overflow: "hidden",
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px", borderBottom: "1px solid var(--color-border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <Search style={{ width: 13, height: 13, color: "var(--color-accent)", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Find Incident</span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          {incidents.filter((i) => i.status !== "resolved").length} active
                        </span>
                      </div>

                      {/* Search input */}
                      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--color-border)" }}>
                        <div style={{ position: "relative" }}>
                          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "var(--color-text-muted)", pointerEvents: "none" }} />
                          <input
                            type="text"
                            value={browseQuery}
                            onChange={(e) => { setBrowseQuery(e.target.value); setBrowsePage(1); }}
                            placeholder="Search by name, ID or service…"
                            style={{
                              width: "100%",
                              paddingLeft: 30,
                              paddingRight: browseQuery ? 30 : 12,
                              paddingTop: 7,
                              paddingBottom: 7,
                              borderRadius: 8,
                              border: `1px solid ${browseQuery ? "rgba(235,89,40,0.35)" : "var(--color-border)"}`,
                              backgroundColor: "var(--color-bg-primary)",
                              fontSize: 12,
                              color: "var(--color-text-primary)",
                              outline: "none",
                              transition: "border-color 0.15s",
                            }}
                          />
                          {browseQuery && (
                            <button
                              onClick={() => { setBrowseQuery(""); setBrowsePage(1); }}
                              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}
                            >
                              <X style={{ width: 12, height: 12 }} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Results list */}
                      <div style={{ flex: 1 }}>
                        {browseResults.length === 0 ? (
                          <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "var(--color-text-muted)" }}>
                            {browseQuery ? `No incidents match "${browseQuery}"` : "No active incidents"}
                          </div>
                        ) : (
                          pageRows.map((inc, i) => {
                            const dot = SEV_COLOR[inc.severity] ?? "#6B7280";
                            return (
                              <button
                                key={inc.id}
                                onClick={() => handleSelect(inc.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                                  padding: "9px 16px",
                                  background: selectedIncidentId === inc.id ? `${dot}08` : "transparent",
                                  border: "none",
                                  borderBottom: i < pageRows.length - 1 ? "1px solid var(--color-border)" : "none",
                                  cursor: "pointer", textAlign: "left", transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = selectedIncidentId === inc.id ? `${dot}08` : "transparent"; }}
                              >
                                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 50 }}>{inc.id}</span>
                                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.name}</span>
                                <span style={{ fontSize: 10, color: dot, fontWeight: 800, flexShrink: 0, letterSpacing: "0.03em" }}>{inc.severity.toUpperCase()}</span>
                                <ChevronRight style={{ width: 11, height: 11, color: "var(--color-text-muted)", flexShrink: 0 }} />
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Footer — result count + pagination */}
                      <div style={{ borderTop: "1px solid var(--color-border)", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          {browseResults.length} result{browseResults.length === 1 ? "" : "s"}
                        </span>
                        {totalBrowsePages > 1 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button
                              onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}
                              disabled={browsePage === 1}
                              style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--color-border)", background: "none", cursor: browsePage === 1 ? "not-allowed" : "pointer", color: browsePage === 1 ? "var(--color-text-muted)" : "var(--color-text-secondary)", fontSize: 11, fontWeight: 700, opacity: browsePage === 1 ? 0.45 : 1 }}
                            >‹</button>
                            <span style={{ fontSize: 10, color: "var(--color-text-muted)", minWidth: 40, textAlign: "center" }}>
                              {browsePage} / {totalBrowsePages}
                            </span>
                            <button
                              onClick={() => setBrowsePage((p) => Math.min(totalBrowsePages, p + 1))}
                              disabled={browsePage === totalBrowsePages}
                              style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid var(--color-border)", background: "none", cursor: browsePage === totalBrowsePages ? "not-allowed" : "pointer", color: browsePage === totalBrowsePages ? "var(--color-text-muted)" : "var(--color-text-secondary)", fontSize: 11, fontWeight: 700, opacity: browsePage === totalBrowsePages ? 0.45 : 1 }}
                            >›</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* ── Row 2: Correlation Tile ─────────────────────── */}
            <CorrelationTile clusters={correlationClusters} onSelect={handleSelect} />

          </motion.div>

      </div>
    </div>
  );
}
