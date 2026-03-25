import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { AlertLevelSnapshot } from "../../data/mockData";

const LEVELS: {
  key: keyof AlertLevelSnapshot["levels"];
  label: string;
  color: string;
  bg: string;
}[] = [
  { key: "critical", label: "Critical", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  { key: "warning",  label: "Warning",  color: "#F97316", bg: "rgba(249,115,22,0.12)" },
  { key: "minor",    label: "Minor",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { key: "clear",    label: "Clear",    color: "#22C55E", bg: "rgba(34,197,94,0.12)"  },
  { key: "error",    label: "Error",    color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
];

function minutesAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff <= 0) return "just now";
  if (diff === 1) return "1 min ago";
  return `${diff} min ago`;
}

interface Props {
  snapshot: AlertLevelSnapshot;
  onRefresh?: () => void;
  /** When provided (archive mode), shows period info instead of interval/updated text */
  periodLabel?: string;
  /** Number of incidents in the window (shown in archive mode subtitle) */
  windowCount?: number;
}

const MAX_BAR_PX = 72;

export default function AlertLevelBar({ snapshot, onRefresh, periodLabel, windowCount }: Props) {
  const max = Math.max(...Object.values(snapshot.levels), 1);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        padding: "18px 20px",
        border: "1px solid var(--color-border)",
        flex: 1,
        minWidth: 0,
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
          Alert Level
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              padding: 2,
              borderRadius: 6,
              transition: "color 0.15s",
            }}
            title="Refresh alert levels"
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 16 }}>
        {periodLabel
          ? <>Period: {periodLabel} &nbsp;·&nbsp; {windowCount ?? 0} incident{windowCount === 1 ? "" : "s"} reviewed</>
          : <>Interval: {snapshot.intervalMinutes} mins &nbsp;·&nbsp; Updated {minutesAgo(snapshot.lastUpdated)}</>
        }
      </p>

      {/* Column bar chart — proportional pixel heights */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: MAX_BAR_PX + 36 }}>
        {LEVELS.map((lv, idx) => {
          const val = snapshot.levels[lv.key];
          // Strictly proportional: max value gets MAX_BAR_PX, others scale linearly.
          // Zero gets a 3px stub so the slot is still visible; non-zero minimum 4px.
          const targetPx = val === 0
            ? 3
            : Math.max(Math.round((val / max) * MAX_BAR_PX), 4);

          return (
            <div
              key={lv.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                height: "100%",
              }}
            >
              {/* Count label — only show if > 0 */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: val === 0 ? "var(--color-text-muted)" : lv.color,
                  lineHeight: 1,
                  marginBottom: 2,
                  minHeight: 14,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                {val}
              </span>

              {/* Bar column */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: targetPx }}
                transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                style={{
                  width: "100%",
                  borderRadius: val === 0 ? 3 : "5px 5px 2px 2px",
                  backgroundColor: lv.color,
                  opacity: val === 0 ? 0.18 : 1,
                  flexShrink: 0,
                }}
              />

              {/* Level label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: val === 0 ? "var(--color-text-muted)" : "var(--color-text-secondary)",
                  textAlign: "center",
                  lineHeight: 1.2,
                  marginTop: 4,
                }}
              >
                {lv.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
