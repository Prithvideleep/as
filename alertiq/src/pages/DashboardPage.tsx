import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Clock } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  incidents,
  incidentDetails,
  alertLevelSnapshot as initialSnapshot,
  historicalAlertSnapshots,
  correlationClusters,
} from "../data/mockData";
import type { AlertLevelSnapshot } from "../data/mockData";
import AlertLevelBar from "../components/dashboard/AlertLevelBar";
import AlertDetailsPanel from "../components/dashboard/AlertDetailsPanel";
import ResolutionLogPanel from "../components/dashboard/ResolutionLogPanel";
import CorrelationTile from "../components/dashboard/CorrelationTile";
import IncidentTile from "../components/dashboard/IncidentTile";
import AllIncidentsPanel from "../components/dashboard/AllIncidentsPanel";

// ─── Shared style constants ────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  paddingLeft: 2,
  display: "block",
  marginBottom: 8,
};

/** Unified vertical rhythm (main lane + rail). */
const DASH_GRID_GAP = 28;
const DASH_STACK_GAP = 24;
const DASH_RAIL_WIDTH_PX = 328;

/** Match `index.css` sidebar breakpoint — sticky sidebar only when main is desktop-wide. */
const DASHBOARD_WIDE_MIN_PX = 901;
function useDashboardWideLayout() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(min-width: ${DASHBOARD_WIDE_MIN_PX}px)`).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DASHBOARD_WIDE_MIN_PX}px)`);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();
  const dashboardWide = useDashboardWideLayout();

  /** Link Impacted Services ↔ Top Alert Clusters (matching L1 service). */
  const [clusterLink, setClusterLink] = useState<{ clusterId: string; service: string } | null>(null);
  const [clusterScrollNonce, setClusterScrollNonce] = useState(0);

  const linkClusterFromService = useCallback((service: string) => {
    const c = correlationClusters.find((cl) => cl.impactedL1.some((s) => s.service === service));
    if (c) {
      setClusterLink({ clusterId: c.incidentId, service });
      setClusterScrollNonce((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    if (!clusterLink) return;
    const t = window.setTimeout(() => setClusterLink(null), 10000);
    return () => window.clearTimeout(t);
  }, [clusterLink]);

  // Time-interval selector: null = Live, 15 | 30 | 45 | 60 = past snapshot offset
  const [viewOffset, setViewOffset] = useState<null | 15 | 30 | 45 | 60>(null);

  // Snapshot refresh (mock: just bumps lastUpdated)
  const [snapshot, setSnapshot] = useState<AlertLevelSnapshot>(initialSnapshot);
  const handleRefresh = useCallback(() => {
    setViewOffset(null);
    setSnapshot((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
  }, []);

  // Active snapshot: live or historical
  const activeSnapshot: AlertLevelSnapshot = useMemo(() => {
    if (viewOffset === null) return snapshot;
    return historicalAlertSnapshots.find((s) => s.offsetMinutes === viewOffset) ?? snapshot;
  }, [viewOffset, snapshot]);

  const handleSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
  };

  const alertLevelBlock = (
    <div>
      <span style={SECTION_LABEL}>Alert Level</span>
      <AlertLevelBar
        snapshot={activeSnapshot}
        onRefresh={viewOffset === null ? handleRefresh : undefined}
      />
    </div>
  );

  const resolutionLogBlock = (
    <div>
      <span style={SECTION_LABEL}>Resolution log</span>
      <ResolutionLogPanel
        incidents={incidents}
        incidentDetails={incidentDetails}
        onSelect={handleSelect}
      />
    </div>
  );

  const allIncidentsBlock = (
    <div>
      <span style={SECTION_LABEL}>All Incidents</span>
      <AllIncidentsPanel incidents={incidents} incidentDetails={incidentDetails} onSelect={handleSelect} />
    </div>
  );

  const impactedTileProps = {
    incidents,
    incidentDetails,
    onSelect: handleSelect,
    lastUpdated: activeSnapshot.lastUpdated,
  } as const;

  const wideMainScroll: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "clip",
    paddingRight: 4,
    borderRight: "1px solid var(--color-border)",
    marginRight: 4,
    boxSizing: "border-box",
  };

  const wideRailFixed: React.CSSProperties = {
    width: DASH_RAIL_WIDTH_PX,
    flexShrink: 0,
    minHeight: 0,
    alignSelf: "stretch",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: DASH_STACK_GAP,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    backgroundColor: "var(--color-bg-primary)",
    paddingLeft: 8,
    marginLeft: -4,
    boxShadow: "-10px 0 24px rgba(15, 23, 42, 0.045)",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "var(--page-pad)",
      }}
    >
      {dashboardWide ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            gap: DASH_GRID_GAP,
            maxWidth: 1480,
            margin: "0 auto",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          <div style={wideMainScroll}>
        {/* ── Page header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
              Alert IQ Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Real-time AI-grouped alert intelligence and cluster monitoring
            </p>
          </div>

          {/* Time controls — single dropdown (Live + all snapshot offsets) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} aria-hidden />
              <select
                aria-label="Alert level time window"
                value={viewOffset === null ? "live" : String(viewOffset)}
                onChange={(e) => {
                  const val = e.target.value;
                  setViewOffset(val === "live" ? null : (Number(val) as 15 | 30 | 45 | 60));
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-card)",
                  color: viewOffset !== null ? "#818CF8" : "var(--color-text-secondary)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                  minWidth: 132,
                }}
              >
                <option value="live">Live</option>
                <option value="15">–15 min</option>
                <option value="30">–30 min</option>
                <option value="45">–45 min</option>
                <option value="60">–60 min</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
                borderRadius: 10, border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-card)", color: "var(--color-text-secondary)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,89,40,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#EB5928"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)"; }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* ── Past-snapshot banner ──────────────────────────────── */}
        <AnimatePresence>
          {viewOffset !== null && (
            <motion.div
              key="past-banner"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", marginBottom: 16,
                borderRadius: 10, backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
                fontSize: 12, color: "#A5B4FC", fontWeight: 600,
              }}
            >
              <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
              Viewing Alert Level snapshot from <strong style={{ color: "#818CF8" }}>{viewOffset} minutes ago</strong>.
              &nbsp;Other cards reflect current live data.
              <button
                onClick={() => setViewOffset(null)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#818CF8", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}
              >
                Back to Live
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════
            Wide (this branch): main column scrolls; right rail is fixed height / internal scroll.
            ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: DASH_STACK_GAP,
            minWidth: 0,
          }}
        >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: DASH_STACK_GAP,
                  alignItems: "start",
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={SECTION_LABEL}>Top Alert Clusters</span>
                  <CorrelationTile
                    clusters={correlationClusters}
                    onSelect={handleSelect}
                    highlightIncidentId={clusterLink?.clusterId ?? null}
                    scrollToIncidentId={clusterLink?.clusterId ?? null}
                    scrollRequestNonce={clusterScrollNonce}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: DASH_STACK_GAP }}>
                  <span style={SECTION_LABEL}>Recent Alerts</span>
                  <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
                  <div>
                    <span style={SECTION_LABEL}>Alert Level</span>
                    <AlertLevelBar
                      snapshot={activeSnapshot}
                      onRefresh={viewOffset === null ? handleRefresh : undefined}
                    />
                  </div>
                </div>
              </div>

            {allIncidentsBlock}
        </motion.div>
          </div>

          <aside style={wideRailFixed} aria-label="Dashboard context">
            <div style={{ flexShrink: 0, width: "100%" }}>
              <span style={SECTION_LABEL}>Impacted Services</span>
              <IncidentTile
                {...impactedTileProps}
                layout="sidebar"
                highlightedService={clusterLink?.service ?? null}
                onServiceActivate={linkClusterFromService}
              />
            </div>
            <div style={{ width: "100%", flexShrink: 0 }}>
              <span style={SECTION_LABEL}>Resolution log</span>
              <ResolutionLogPanel
                incidents={incidents}
                incidentDetails={incidentDetails}
                onSelect={handleSelect}
                layout="sidebar"
              />
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <div style={{ maxWidth: 1480, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}
            >
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Alert IQ Dashboard
                </h1>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                  Real-time AI-grouped alert intelligence and cluster monitoring
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} aria-hidden />
                  <select
                    aria-label="Alert level time window"
                    value={viewOffset === null ? "live" : String(viewOffset)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setViewOffset(val === "live" ? null : (Number(val) as 15 | 30 | 45 | 60));
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-card)",
                      color: viewOffset !== null ? "#818CF8" : "var(--color-text-secondary)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      outline: "none",
                      minWidth: 132,
                    }}
                  >
                    <option value="live">Live</option>
                    <option value="15">–15 min</option>
                    <option value="30">–30 min</option>
                    <option value="45">–45 min</option>
                    <option value="60">–60 min</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
                    borderRadius: 10, border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-card)", color: "var(--color-text-secondary)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,89,40,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#EB5928"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)"; }}
                >
                  <RefreshCw style={{ width: 13, height: 13 }} />
                  Refresh
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {viewOffset !== null && (
                <motion.div
                  key="past-banner-narrow"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", marginBottom: 16,
                    borderRadius: 10, backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
                    fontSize: 12, color: "#A5B4FC", fontWeight: 600,
                  }}
                >
                  <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
                  Viewing Alert Level snapshot from <strong style={{ color: "#818CF8" }}>{viewOffset} minutes ago</strong>.
                  &nbsp;Other cards reflect current live data.
                  <button
                    onClick={() => setViewOffset(null)}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#818CF8", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}
                  >
                    Back to Live
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: DASH_STACK_GAP }}
            >
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={SECTION_LABEL}>Top Alert Clusters</span>
                <CorrelationTile clusters={correlationClusters} onSelect={handleSelect} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: DASH_STACK_GAP }}>
                <span style={SECTION_LABEL}>Recent Alerts</span>
                <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
                {alertLevelBlock}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={SECTION_LABEL}>Impacted Services</span>
                <IncidentTile {...impactedTileProps} layout="default" />
              </div>
              {resolutionLogBlock}
              {allIncidentsBlock}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
