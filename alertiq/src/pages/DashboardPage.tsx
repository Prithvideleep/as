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
  
  // Create an empty state for initial load (no fallback to mock data)
  const [snapshot, setSnapshot] = useState<AlertLevelSnapshot | null>(null);

  const fetchDashboardSnapshot = useCallback(async () => {
    const apiEndpoint = "dem/api/place hoder";
    console.log(`[AlertLevel API] Attempting fetch from: ${apiEndpoint}`);
    
    try {
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        console.error(`[AlertLevel API] Network response was not ok. Status: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log("[AlertLevel API] Raw data received:", rawData);
      
      // Detailed schema validation checks
      if (!rawData.levels) {
        console.warn("[AlertLevel API] Missing 'levels' object in response.");
      }
      if (!rawData.last_updated) {
        console.warn("[AlertLevel API] Missing 'last_updated' field in response.");
      }

      const mappedSnapshot: AlertLevelSnapshot = {
        lastUpdated: rawData.last_updated,
        intervalMinutes: rawData.interval_minutes,
        levels: {
          critical: rawData.levels?.critical ?? 0,
          major: rawData.levels?.major ?? 0,
          warning: rawData.levels?.warning ?? 0,
          minor: rawData.levels?.minor ?? 0,
          clear: rawData.levels?.clear ?? 0,
          error: rawData.levels?.error ?? 0
        }
      };
      
      console.log("[AlertLevel API] Successfully mapped data:", mappedSnapshot);
      setSnapshot(mappedSnapshot);
    } catch (error) {
      console.error("[AlertLevel API] Integration failed:", error);
      if (error instanceof TypeError) {
        console.error("[AlertLevel API] Possible CORS issue or Network failure.");
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardSnapshot();
    const interval = setInterval(fetchDashboardSnapshot, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardSnapshot]);

  const handleRefresh = useCallback(() => {
    setViewOffset(null);
    fetchDashboardSnapshot();
  }, [fetchDashboardSnapshot]);

  const activeSnapshot: AlertLevelSnapshot | null = useMemo(() => {
    if (viewOffset === null) return snapshot;
    // Historical data is intentionally kept as mock data for structure, 
    // but the LIVE card will be empty without a successful API call.
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
          <SelectionCriteriaBar
            optionalDate={criteriaDate}
            onOptionalDateChange={setCriteriaDate}
            timeWindowSelect={timeWindowSelect}
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
