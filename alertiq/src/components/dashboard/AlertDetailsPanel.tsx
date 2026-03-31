import { useState, useCallback, useMemo, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Incident } from "../../data/mockData";

export type LevelKey = "critical" | "warning" | "minor" | "clear" | "error";

const LEVEL_CONFIG: {
  key: LevelKey;
  label: string;
  color: string;
  border: string;
  severities: string[];
  statusFilter?: string;
}[] = [
  {
    key: "critical",
    label: "Critical Alerts",
    color: "#EF4444",
    border: "rgba(239,68,68,0.25)",
    severities: ["critical"],
  },
  {
    key: "warning",
    label: "Warning Alerts",
    color: "#F97316",
    border: "rgba(249,115,22,0.2)",
    severities: ["high"],
  },
  {
    key: "minor",
    label: "Minor Alerts",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.2)",
    severities: ["medium"],
  },
  {
    key: "clear",
    label: "Clear Alerts",
    color: "#22C55E",
    border: "rgba(34,197,94,0.2)",
    severities: ["low"],
    statusFilter: "resolved",
  },
  {
    key: "error",
    label: "Error Alerts",
    color: "#6B7280",
    border: "rgba(107,114,128,0.18)",
    severities: [],
  },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getIncidentsForLevel(
  incidents: Incident[],
  cfg: (typeof LEVEL_CONFIG)[0],
  mode: "live" | "archive"
): Incident[] {
  if (cfg.severities.length === 0) return [];
  return incidents.filter((i) => {
    const matchesSeverity = cfg.severities.includes(i.severity);
    if (mode === "archive") {
      // In archive mode the incoming list is already pre-filtered to resolved incidents
      return matchesSeverity;
    }
    // Live mode: skip resolved, "clear" level uses statusFilter
    if (cfg.statusFilter) return matchesSeverity && i.status === cfg.statusFilter;
    return matchesSeverity && i.status !== "resolved";
  });
}

const LEVEL_PAGE_SIZE = 5;

interface Props {
  incidents: Incident[];
  onSelect: (id: string) => void;
  /** Row click opens in-dashboard preview instead of navigating when set */
  onPreviewIncident?: (id: string) => void;
  /** "live" (default) shows non-resolved; "archive" shows pre-filtered resolved window */
  mode?: "live" | "archive";
  layout?: "default" | "sidebar";
  sidebarMaxHeight?: string;
  /** Incidents per page inside each expanded level (default 5) */
  levelPageSize?: number;
  /** Hide Clear + Error rows on live dashboard (stakeholder direction). */
  demoteLowSignalLevels?: boolean;
  /** Fires when user expands/collapses a severity accordion (for Impacted Services linkage). */
  onLevelOpenChange?: (key: LevelKey | null) => void;
  /** Shown under title — e.g. global time window note */
  timeWindowNote?: string;
}

export default function AlertDetailsPanel({
  incidents,
  onSelect,
  onPreviewIncident,
  mode = "live",
  layout = "default",
  sidebarMaxHeight = "calc(100dvh - 64px)",
  levelPageSize = LEVEL_PAGE_SIZE,
  demoteLowSignalLevels = true,
  onLevelOpenChange,
  timeWindowNote,
}: Props) {
  const visibleLevels = useMemo(
    () =>
      mode === "live" && demoteLowSignalLevels
        ? LEVEL_CONFIG.filter((c) => c.key !== "clear" && c.key !== "error")
        : LEVEL_CONFIG,
    [mode, demoteLowSignalLevels]
  );

  const [open, setOpen] = useState<LevelKey | null>(() =>
    mode === "archive" ? "clear" : "critical"
  );
  const [pageByLevel, setPageByLevel] = useState<Record<LevelKey, number>>(() =>
    Object.fromEntries(LEVEL_CONFIG.map((c) => [c.key, 1])) as Record<LevelKey, number>
  );
  const isSidebar = layout === "sidebar";

  useEffect(() => {
    if (open && !visibleLevels.some((c) => c.key === open)) {
      setOpen(visibleLevels[0]?.key ?? "critical");
    }
  }, [open, visibleLevels]);

  const setLevelPage = useCallback((key: LevelKey, page: number) => {
    setPageByLevel((prev) => ({ ...prev, [key]: page }));
  }, []);

  const toggleLevel = useCallback(
    (cfgKey: LevelKey, willOpen: boolean) => {
      if (willOpen) {
        setPageByLevel((p) => ({ ...p, [cfgKey]: 1 }));
        setOpen(cfgKey);
        onLevelOpenChange?.(cfgKey);
      } else {
        setOpen(null);
        onLevelOpenChange?.(null);
      }
    },
    [onLevelOpenChange]
  );

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        flex: isSidebar ? "0 1 auto" : "0 1 auto",
        maxHeight: isSidebar ? sidebarMaxHeight : undefined,
        minWidth: 0,
        minHeight: isSidebar ? 0 : undefined,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header — pinned in sidebar layout */}
      <div
        style={{
          flexShrink: 0,
          padding: "18px 20px 10px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
          Alert Details
        </span>
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2, lineHeight: 1.45 }}>
          {mode === "archive"
            ? "Historical breakdown by level · Click to expand"
            : timeWindowNote ?? "Uses the same time window as the header control · Click a level to expand"}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
      {visibleLevels.map((cfg) => {
        const rows = getIncidentsForLevel(incidents, cfg, mode);
        const isOpen = open === cfg.key;
        return (
          <div key={cfg.key} style={{ borderBottom: "1px solid var(--color-border)" }}>
            {/* Row header */}
            <button
              onClick={() => {
                if (isOpen) toggleLevel(cfg.key, false);
                else toggleLevel(cfg.key, true);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                background: isOpen ? `${cfg.color}08` : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: cfg.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: isOpen ? cfg.color : "var(--color-text-secondary)",
                }}
              >
                {cfg.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: rows.length > 0 ? cfg.color : "var(--color-text-muted)",
                  minWidth: 18,
                  textAlign: "right",
                }}
              >
                {rows.length}
              </span>
              <ChevronDown
                style={{
                  width: 13,
                  height: 13,
                  color: "var(--color-text-muted)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Expanded list */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {rows.length === 0 ? (
                    <div
                      style={{
                        padding: "10px 20px 12px 38px",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {mode === "archive"
                        ? "No resolved incidents at this level in the selected window"
                        : "No active incidents in this level"}
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const totalPages = Math.max(1, Math.ceil(rows.length / levelPageSize));
                        const rawPage = pageByLevel[cfg.key] ?? 1;
                        const page = Math.min(Math.max(1, rawPage), totalPages);
                        const pageRows = rows.slice((page - 1) * levelPageSize, page * levelPageSize);
                        const showPager = rows.length > levelPageSize;

                        return (
                          <>
                            <div
                              style={{
                                padding: "4px 20px 4px 36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600 }}
                              >
                                {rows.length} incident{rows.length === 1 ? "" : "s"}
                                {showPager ? ` · Page ${page} of ${totalPages}` : ""}
                              </span>
                            </div>
                            <div style={{ overflowX: "hidden" }}>
                              {pageRows.map((inc) => (
                        <button
                          key={inc.id}
                          onClick={() =>
                            onPreviewIncident ? onPreviewIncident(inc.id) : onSelect(inc.id)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "8px 20px 8px 36px",
                            background: "none",
                            border: "none",
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
                              "transparent";
                          }}
                        >
                          <AlertTriangle
                            style={{ width: 10, height: 10, color: cfg.color, flexShrink: 0 }}
                          />
                          <span
                            style={{
                              flex: 1,
                              fontSize: 12,
                              color: "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {inc.name}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              flexShrink: 0,
                            }}
                          >
                            <Clock style={{ width: 9, height: 9 }} />
                            {formatTime(inc.timestamp)}
                          </span>
                        </button>
                              ))}
                            </div>
                            {showPager && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 10,
                                  padding: "8px 20px 10px 36px",
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={page <= 1}
                                  onClick={() => setLevelPage(cfg.key, page - 1)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    border: "1px solid var(--color-border)",
                                    background:
                                      page <= 1 ? "var(--color-hover-bg)" : "var(--color-bg-card)",
                                    color: page <= 1 ? "var(--color-text-muted)" : cfg.color,
                                    cursor: page <= 1 ? "not-allowed" : "pointer",
                                    opacity: page <= 1 ? 0.6 : 1,
                                  }}
                                  aria-label="Previous page"
                                >
                                  <ChevronLeft style={{ width: 14, height: 14 }} />
                                </button>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--color-text-secondary)",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {page} / {totalPages}
                                </span>
                                <button
                                  type="button"
                                  disabled={page >= totalPages}
                                  onClick={() => setLevelPage(cfg.key, page + 1)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    border: "1px solid var(--color-border)",
                                    background:
                                      page >= totalPages
                                        ? "var(--color-hover-bg)"
                                        : "var(--color-bg-card)",
                                    color:
                                      page >= totalPages ? "var(--color-text-muted)" : cfg.color,
                                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                                    opacity: page >= totalPages ? 0.6 : 1,
                                  }}
                                  aria-label="Next page"
                                >
                                  <ChevronRight style={{ width: 14, height: 14 }} />
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      </div>
    </div>
  );
}
