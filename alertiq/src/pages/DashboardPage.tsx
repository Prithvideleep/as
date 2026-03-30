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
  marginBottom: 6,
};

/** Match `index.css` sidebar breakpoint — sticky sidebar only when main is desktop-wide. */
const DASHBOARD_WIDE_MIN_PX = 901;
/** Offset from top of scrollport while stuck (breathing room, avoids flush edge). */
const DASHBOARD_STICKY_TOP_PX = 16;
/** Max height per sticky rail card (~½ viewport) — Impacted + Alert Level only. */
const DASHBOARD_SIDEBAR_CARD_MAX = `calc((100dvh - ${DASHBOARD_STICKY_TOP_PX}px - 56px) / 2)`;

/** Main column paints below the rail; large gap avoids ambiguity with transformed children. */
const DASHBOARD_MAIN_COLUMN_Z = 0;
const DASHBOARD_RAIL_COLUMN_Z = 10;
/** Impacted must stay above rail Alert Level and all main-column layers when stickies overlap. */
const STICKY_IMPACTED_Z = 30;
const STICKY_ALERT_LEVEL_Z = 12;

const STICKY_CARD_SHADOW =
  "0 2px 12px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.04)";

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

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

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

          {/* Time controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Quick-access interval pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "3px 4px" }}>
              <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)", marginLeft: 6, flexShrink: 0 }} />
              {([null, 15, 30, 45] as const).map((offset) => {
                const label  = offset === null ? "Live" : `–${offset}m`;
                const active = viewOffset === offset;
                return (
                  <button
                    key={String(offset)}
                    onClick={() => setViewOffset(offset)}
                    style={{
                      padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700, transition: "all 0.15s",
                      backgroundColor: active ? (offset === null ? "rgba(235,89,40,0.15)" : "rgba(99,102,241,0.15)") : "transparent",
                      color: active ? (offset === null ? "#EB5928" : "#818CF8") : "var(--color-text-muted)",
                    }}
                  >{label}</button>
                );
              })}
            </div>

            {/* Dropdown — all options including –60m */}
            <select
              value={viewOffset === null ? "live" : String(viewOffset)}
              onChange={(e) => {
                const val = e.target.value;
                setViewOffset(val === "live" ? null : (Number(val) as 15 | 30 | 45 | 60));
              }}
              style={{
                padding: "6px 10px", borderRadius: 8, border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-card)",
                color: viewOffset !== null ? "#818CF8" : "var(--color-text-secondary)",
                fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none",
              }}
            >
              <option value="live">Live</option>
              <option value="15">–15 min</option>
              <option value="30">–30 min</option>
              <option value="45">–45 min</option>
              <option value="60">–60 min</option>
            </select>

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
            Wide: Row 1 — Correlation | Alert Details (1fr 1fr); rail — Impacted, Alert Level.
            Narrow: single column — clusters, recent, impacted, alert level, find.
            ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            display: "grid",
            // minmax(0, 1fr) prevents min-content width from overflowing into the sidebar column
            gridTemplateColumns: dashboardWide ? "minmax(0, 1fr) 310px" : "minmax(0, 1fr)",
            gap: 20,
            alignItems: "start",
            position: "relative",
            zIndex: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              minWidth: 0,
              maxWidth: "100%",
              position: "relative",
              zIndex: DASHBOARD_MAIN_COLUMN_Z,
              overflowX: "clip",
              isolation: "isolate",
            }}
          >
            {dashboardWide ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 20,
                  alignItems: "stretch",
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
                  <span style={SECTION_LABEL}>Top Alert Clusters</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <CorrelationTile
                      clusters={correlationClusters}
                      onSelect={handleSelect}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
                  <span style={SECTION_LABEL}>Recent Alerts</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={SECTION_LABEL}>Top Alert Clusters</span>
                  <CorrelationTile clusters={correlationClusters} onSelect={handleSelect} />
                </div>
                <div>
                  <span style={SECTION_LABEL}>Recent Alerts</span>
                  <AlertDetailsPanel incidents={incidents} onSelect={handleSelect} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={SECTION_LABEL}>Impacted Services</span>
                  <IncidentTile {...impactedTileProps} layout="default" />
                </div>
                {alertLevelBlock}
              </>
            )}

            {allIncidentsBlock}
          </div>

          {dashboardWide && (
            <div
              style={{
                alignSelf: "stretch",
                minWidth: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "relative",
                zIndex: DASHBOARD_RAIL_COLUMN_Z,
                isolation: "isolate",
                backgroundColor: "var(--color-bg-primary)",
                boxSizing: "border-box",
                boxShadow:
                  "inset 1px 0 0 var(--color-border), -6px 0 16px rgba(15, 23, 42, 0.035)",
              }}
            >
              <div
                style={{
                  position: "sticky",
                  top: DASHBOARD_STICKY_TOP_PX,
                  alignSelf: "stretch",
                  width: "100%",
                  maxWidth: "100%",
                  zIndex: STICKY_IMPACTED_Z,
                  transition: "box-shadow 0.2s ease",
                  boxShadow: STICKY_CARD_SHADOW,
                  borderRadius: 14,
                }}
              >
                <span style={SECTION_LABEL}>Impacted Services</span>
                <IncidentTile
                  {...impactedTileProps}
                  layout="sidebar"
                  sidebarMaxHeight={DASHBOARD_SIDEBAR_CARD_MAX}
                />
              </div>
              <div
                style={{
                  position: "sticky",
                  top: DASHBOARD_STICKY_TOP_PX,
                  alignSelf: "stretch",
                  width: "100%",
                  maxWidth: "100%",
                  zIndex: STICKY_ALERT_LEVEL_Z,
                  transition: "box-shadow 0.2s ease",
                  boxShadow: STICKY_CARD_SHADOW,
                  borderRadius: 14,
                }}
              >
                <span style={SECTION_LABEL}>Alert Level</span>
                <AlertLevelBar
                  snapshot={activeSnapshot}
                  onRefresh={viewOffset === null ? handleRefresh : undefined}
                  layout="sidebar"
                  sidebarMaxHeight={DASHBOARD_SIDEBAR_CARD_MAX}
                />
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
