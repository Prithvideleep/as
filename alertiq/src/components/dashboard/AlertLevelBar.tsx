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

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  const abs = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const rel = diff <= 1 ? "just now" : `${diff} min ago`;
  return `${abs} · ${rel}`;
}

interface Props {
  snapshot: AlertLevelSnapshot;
  onRefresh?: () => void;
  /** When provided (archive mode), shows period info instead of interval/updated text */
  periodLabel?: string;
  /** Number of incidents in the window (shown in archive mode subtitle) */
  windowCount?: number;
  layout?: "default" | "sidebar";
  sidebarMaxHeight?: string;
  /** Karun/Gary: demote Clear + Error on home — bars hidden (counts still in raw snapshot). */
  demoteClearAndError?: boolean;
}

export default function AlertLevelBar({
  snapshot,
  onRefresh,
  periodLabel,
  windowCount,
  layout = "default",
  sidebarMaxHeight = "calc(100dvh - 64px)",
  demoteClearAndError = true,
}: Props) {
  const isSidebar = layout === "sidebar";
  const displayLevels = demoteClearAndError
    ? LEVELS.filter((lv) => lv.key !== "clear" && lv.key !== "error")
    : LEVELS;
  const max = Math.max(
    ...displayLevels.map((lv) => snapshot.levels[lv.key]),
    1
  );

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        padding: isSidebar ? "18px 20px 14px" : "18px 20px",
        border: "1px solid var(--color-border)",
        flex: isSidebar ? "0 1 auto" : "0 1 auto",
        maxHeight: isSidebar ? sidebarMaxHeight : undefined,
        minWidth: 0,
        minHeight: isSidebar ? 0 : undefined,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header — pinned in sidebar layout */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
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
      <p style={{ flexShrink: 0, fontSize: 11, color: "var(--color-text-muted)", marginBottom: isSidebar ? 12 : 16 }}>
        {periodLabel
          ? <>Period: {periodLabel} &nbsp;·&nbsp; {windowCount ?? 0} incident{windowCount === 1 ? "" : "s"} reviewed</>
          : <>
              Interval: {snapshot.intervalMinutes} mins &nbsp;·&nbsp;{" "}
              <strong style={{ color: "var(--color-text-secondary)", fontWeight: 700 }}>Last updated</strong>{" "}
              {formatTimestamp(snapshot.lastUpdated)}
            </>
        }
      </p>

      {/* Horizontal bar rows — scrollable when sidebar + limited height */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: isSidebar ? "1 1 auto" : "0 0 auto",
          minHeight: isSidebar ? 0 : undefined,
          overflowY: isSidebar ? "auto" : "visible",
          overscrollBehavior: isSidebar ? "contain" : undefined,
          justifyContent: isSidebar ? "flex-start" : "flex-start",
        }}
      >
        {displayLevels.map((lv, idx) => {
          const val = snapshot.levels[lv.key];
          const targetPct = val === 0 ? 0 : Math.max((val / max) * 100, 3);

          return (
            <div key={lv.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Level label */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: val === 0 ? "var(--color-text-muted)" : lv.color,
                  width: 52,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {lv.label}
              </span>

              {/* Track */}
              <div
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: 6,
                  backgroundColor: "var(--color-border)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${targetPct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    borderRadius: 6,
                    backgroundColor: lv.color,
                    opacity: val === 0 ? 0.18 : 1,
                  }}
                />
              </div>

              {/* Count */}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: val === 0 ? "var(--color-text-muted)" : lv.color,
                  width: 32,
                  textAlign: "right",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
