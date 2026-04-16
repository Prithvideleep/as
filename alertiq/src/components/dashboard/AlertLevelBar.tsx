import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { AlertLevelSnapshot } from "../../data/mockData";

const LEVELS: {
  key: keyof AlertLevelSnapshot["levels"];
  label: string;
  color: string;
  /** Wide horizontal emphasis (Critical, Warning) vs narrow tower (Minor, Clear, Error) */
  band: "wide" | "narrow";
}[] = [
  { key: "critical", label: "Critical", color: "#EF4444", band: "wide" },
  { key: "major", label: "Major", color: "#F43F5E", band: "wide" },
  { key: "warning", label: "Warning", color: "#F97316", band: "wide" },
  { key: "minor", label: "Minor", color: "#F59E0B", band: "narrow" },
  { key: "clear", label: "Clear", color: "#22C55E", band: "narrow" },
  { key: "error", label: "Error", color: "#6B7280", band: "narrow" },
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
  snapshot: AlertLevelSnapshot | null;
  onRefresh?: () => void;
  /** When provided (archive mode), shows period info instead of interval/updated text */
  periodLabel?: string;
  /** Number of incidents in the window (shown in archive mode subtitle) */
  windowCount?: number;
  layout?: "default" | "sidebar";
  sidebarMaxHeight?: string;
  /** Karun/Gary: demote Clear + Error — omit those columns in column chart (or rows mode). */
  demoteClearAndError?: boolean;
  /** Nested inside a parent card — no outer border/radius */
  embedded?: boolean;
  /**
   * `columns` — wireframe-style vertical bars, label above, wide bands for Critical/Warning.
   * `rows` — classic horizontal tracks (compact footers / sidebar).
   */
  visualization?: "columns" | "rows";
  /** Min height of the bar plot area (columns mode). */
  chartMinHeight?: number;
}

export default function AlertLevelBar({
  snapshot,
  onRefresh,
  periodLabel,
  windowCount,
  layout = "default",
  sidebarMaxHeight = "calc(100dvh - 64px)",
  demoteClearAndError = true,
  embedded = false,
  visualization = "columns",
  chartMinHeight = 132,
}: Props) {
  const isSidebar = layout === "sidebar";
  const displayLevels = demoteClearAndError ? LEVELS.filter((lv) => lv.key !== "clear" && lv.key !== "error") : LEVELS;
  /** Dashboard tile: stretch rows so the card isn’t half empty white space. */
  const embeddedRowsFill = embedded && visualization === "rows" && !isSidebar;

  const outerStyle: CSSProperties = {
    backgroundColor: embedded ? "transparent" : "var(--color-bg-card)",
    borderRadius: embedded ? 0 : 14,
    padding: embedded
      ? visualization === "columns"
        ? "4px 0 0"
        : "2px 0 0"
      : isSidebar
        ? "18px 20px 14px"
        : "18px 20px",
    border: embedded ? "none" : "1px solid var(--color-border)",
    flex: embeddedRowsFill ? "1 1 auto" : isSidebar ? "0 1 auto" : "0 1 auto",
    maxHeight: isSidebar ? sidebarMaxHeight : undefined,
    minWidth: 0,
    minHeight: embeddedRowsFill || isSidebar ? 0 : undefined,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  return (
    <div style={outerStyle}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Alert level</span>
        {onRefresh && (
          <button
            type="button"
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
      <p
        style={{
          flexShrink: 0,
          fontSize: 11,
          color: "var(--color-text-muted)",
          marginBottom: embedded
            ? visualization === "columns"
              ? 10
              : 8
            : visualization === "columns"
              ? 10
              : isSidebar
                ? 12
                : 16,
        }}
      >
        {periodLabel ? (
          <>
            Period: {periodLabel} &nbsp;·&nbsp; {windowCount ?? 0} incident{windowCount === 1 ? "" : "s"} reviewed
          </>
        ) : !snapshot ? (
          <span className="pulse" style={{ opacity: 0.5 }}>Waiting for API sync...</span>
        ) : (
          <>
            Interval: {snapshot.intervalMinutes} mins &nbsp;·&nbsp;{" "}
            <strong style={{ color: "var(--color-text-secondary)", fontWeight: 700 }}>Last updated</strong>{" "}
            {formatTimestamp(snapshot.lastUpdated)}
          </>
        )}
      </p>

      {!snapshot ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: visualization === "columns" ? chartMinHeight : 100 }}>
           <div style={{ textAlign: "center", opacity: 0.4, fontSize: 11, fontWeight: 600 }}>
              <div className="pulse" style={{ marginBottom: 8 }}>API DISCONNECTED</div>
              <div style={{ fontSize: 10 }}>NO FALLBACK DATA LOADED</div>
           </div>
        </div>
      ) : visualization === "columns" ? (
        <ColumnChart
          displayLevels={displayLevels}
          snapshot={snapshot}
          max={Math.max(...displayLevels.map((lv) => snapshot.levels[lv.key]), 1)}
          chartMinHeight={chartMinHeight}
        />
      ) : (
        <RowChart
          displayLevels={displayLevels}
          snapshot={snapshot}
          max={Math.max(...displayLevels.map((lv) => snapshot.levels[lv.key]), 1)}
          isSidebar={isSidebar}
          fillVertical={embeddedRowsFill}
        />
      )}
    </div>
  );
}

function ColumnChart({
  displayLevels,
  snapshot,
  max,
  chartMinHeight,
}: {
  displayLevels: (typeof LEVELS)[number][];
  snapshot: AlertLevelSnapshot;
  max: number;
  chartMinHeight: number;
}) {
  const trackHeight = Math.max(chartMinHeight - 50, 78);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: displayLevels.map((lv) => (lv.band === "wide" ? "minmax(56px,1.35fr)" : "minmax(28px,0.65fr)")).join(" "),
        columnGap: 10,
        alignItems: "stretch",
        paddingTop: 4,
        paddingBottom: 2,
      }}
    >
      {displayLevels.map((lv, idx) => {
        const val = snapshot.levels[lv.key];
        const targetPct = val === 0 ? 0 : Math.max((val / max) * 100, 8);
        return (
          <div
            key={lv.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: val === 0 ? "var(--color-text-muted)" : "var(--color-text-secondary)",
                marginBottom: 8,
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: "100%",
              }}
            >
              {lv.label}
            </span>
            <div
              style={{
                width: "100%",
                height: trackHeight,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "stretch",
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${targetPct}%` }}
                transition={{ duration: 0.5, delay: idx * 0.07, ease: "easeOut" }}
                style={{
                  width: "100%",
                  borderRadius: lv.band === "wide" ? 6 : 5,
                  backgroundColor: lv.color,
                  opacity: val === 0 ? 0.22 : 1,
                  minHeight: val === 0 ? 3 : 5,
                  boxSizing: "border-box",
                  border: `1px solid ${lv.color}`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: val === 0 ? "var(--color-text-muted)" : lv.color,
                marginTop: 6,
                lineHeight: 1,
              }}
            >
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RowChart({
  displayLevels,
  snapshot,
  max,
  isSidebar,
  fillVertical = false,
}: {
  displayLevels: (typeof LEVELS)[number][];
  snapshot: AlertLevelSnapshot;
  max: number;
  isSidebar: boolean;
  /** Spread rows across available height (embedded dashboard tile). */
  fillVertical?: boolean;
}) {
  const barH = fillVertical ? 12 : 10;
  const flexMain = fillVertical || isSidebar ? "1 1 auto" : "0 0 auto";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: fillVertical ? 0 : 10,
        flex: flexMain,
        minHeight: fillVertical || isSidebar ? 0 : undefined,
        overflowY: isSidebar ? "auto" : "visible",
        overscrollBehavior: isSidebar ? "contain" : undefined,
        justifyContent: fillVertical ? "space-between" : "flex-start",
      }}
    >
      {displayLevels.map((lv, idx) => {
        const val = snapshot.levels[lv.key];
        const targetPct = val === 0 ? 0 : Math.max((val / max) * 100, 3);

        return (
          <div key={lv.key} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
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

            <div
              style={{
                flex: 1,
                height: barH,
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

            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: val === 0 ? "var(--color-text-muted)" : lv.color,
                minWidth: 36,
                width: 36,
                textAlign: "right",
                flexShrink: 0,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}
