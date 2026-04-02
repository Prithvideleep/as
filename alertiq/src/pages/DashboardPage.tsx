import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
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
import SelectionCriteriaBar from "../components/dashboard/SelectionCriteriaBar";
import TrendingClustersStrip from "../components/dashboard/TrendingClustersStrip";
import TrendingP1P2IncidentsStrip from "../components/dashboard/TrendingP1P2IncidentsStrip";
import AlertCorrelatedDetailsTable from "../components/dashboard/AlertCorrelatedDetailsTable";
import { dashTopTileColumn, dashTopTileShell } from "../components/dashboard/dashboardTopTileStyles";
import { clearLegacyDashboardLayoutPrefs } from "../lib/dashboardLayoutPrefs";

const DASH_STACK_GAP = 24;
const DASH_MAX_WIDTH_PX = 1760;

function formatDashboardClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const abs = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  const rel = diff <= 1 ? "just now" : `${diff} min ago`;
  return `${abs} · ${rel}`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  useEffect(() => {
    clearLegacyDashboardLayoutPrefs();
  }, []);

  const [criteriaDate, setCriteriaDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [viewOffset, setViewOffset] = useState<null | 15 | 30 | 45 | 60>(null);
  const [snapshot, setSnapshot] = useState<AlertLevelSnapshot>(initialSnapshot);
  const handleRefresh = useCallback(() => {
    setViewOffset(null);
    setSnapshot((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
  }, []);

  const activeSnapshot: AlertLevelSnapshot = useMemo(() => {
    if (viewOffset === null) return snapshot;
    return historicalAlertSnapshots.find((s) => s.offsetMinutes === viewOffset) ?? snapshot;
  }, [viewOffset, snapshot]);

  const goInvestigation = useCallback(
    (id: string) => {
      setSelectedIncidentId(id);
      navigate("/investigation");
    },
    [navigate, setSelectedIncidentId]
  );

  const goIncidentDetails = useCallback(
    (id: string) => {
      setSelectedIncidentId(id);
      navigate("/incident-details");
    },
    [navigate, setSelectedIncidentId]
  );

  const headerDataFreshness = useMemo(
    () => formatDashboardClock(activeSnapshot.lastUpdated),
    [activeSnapshot.lastUpdated]
  );

  const timeWindowSelect = (
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
  );

  const scopePlaceholder = (
    <select
      aria-label="Scope (placeholder)"
      disabled
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px dashed var(--color-border)",
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-text-muted)",
        fontSize: 11,
        fontWeight: 600,
        cursor: "not-allowed",
        minWidth: 140,
        opacity: 0.85,
      }}
      title="Phase 2: environment / team scope"
    >
      <option>All scopes</option>
    </select>
  );

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
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ maxWidth: DASH_MAX_WIDTH_PX, margin: "0 auto", width: "100%" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                Alert IQ Dashboard
              </h1>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                Real-time AI-grouped alert intelligence and cluster monitoring
              </p>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>
                <strong style={{ color: "var(--color-text-secondary)" }}>Data freshness (alert level):</strong>{" "}
                {headerDataFreshness}
              </p>
            </div>
          </motion.div>

          <SelectionCriteriaBar
            optionalDate={criteriaDate}
            onOptionalDateChange={setCriteriaDate}
            timeWindowSelect={timeWindowSelect}
            scopePlaceholder={scopePlaceholder}
            onRefresh={handleRefresh}
          />

          <AnimatePresence>
            {viewOffset !== null && (
              <motion.div
                key="past-banner"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  marginBottom: 16,
                  borderRadius: 10,
                  backgroundColor: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  fontSize: 12,
                  color: "#A5B4FC",
                  fontWeight: 600,
                }}
              >
                <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
                Viewing Alert Level snapshot from <strong style={{ color: "#818CF8" }}>{viewOffset} minutes ago</strong>.
                &nbsp;Other tiles reflect current live data.
                <button
                  type="button"
                  onClick={() => setViewOffset(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#818CF8",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 6,
                  }}
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
            style={{ display: "flex", flexDirection: "column", gap: DASH_STACK_GAP, minWidth: 0, paddingBottom: 24 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: DASH_STACK_GAP,
                alignItems: "stretch",
              }}
            >
              <div style={dashTopTileColumn}>
                <div style={dashTopTileShell}>
                  <AlertLevelBar
                    snapshot={activeSnapshot}
                    onRefresh={viewOffset === null ? handleRefresh : undefined}
                    demoteClearAndError={false}
                    visualization="rows"
                    embedded
                  />
                </div>
              </div>
              <TrendingClustersStrip
                clusters={correlationClusters}
                incidents={incidents}
                onSelectIncident={goInvestigation}
              />
              <TrendingP1P2IncidentsStrip incidents={incidents} onOpenIncident={goIncidentDetails} />
            </div>

            <AlertCorrelatedDetailsTable
              clusters={correlationClusters}
              incidents={incidents}
              incidentDetails={incidentDetails}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
