import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  incidents,
  alertLevelSnapshot as initialSnapshot,
  historicalAlertSnapshots,
} from "../data/mockData";
import type { AlertLevelSnapshot } from "../data/mockData";
import AlertLevelBar from "../components/dashboard/AlertLevelBar";
import AlertDetailsPanel from "../components/dashboard/AlertDetailsPanel";
import BackButton from "../components/shared/BackButton";

export default function AlertDetailsPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

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

  const timeWindowNote =
    viewOffset === null
      ? "Live — header control drives the Alert Level snapshot only"
      : `Snapshot −${viewOffset} min for Alert Level; incident list stays on live data`;

  const onSelect = useCallback(
    (id: string) => {
      setSelectedIncidentId(id);
      navigate("/investigation");
    },
    [navigate, setSelectedIncidentId]
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <BackButton />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Alert details</h1>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)" }} aria-hidden />
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
        </div>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 14px 0" }}>
            <AlertDetailsPanel
              incidents={incidents}
              onSelect={onSelect}
              timeWindowNote={timeWindowNote}
              demoteLowSignalLevels
            />
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "8px 12px 12px",
              background: "linear-gradient(180deg, rgba(15,23,42,0.04) 0%, transparent 100%)",
            }}
          >
            <AlertLevelBar
              snapshot={activeSnapshot}
              onRefresh={viewOffset === null ? handleRefresh : undefined}
              demoteClearAndError
              visualization="rows"
              embedded
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
