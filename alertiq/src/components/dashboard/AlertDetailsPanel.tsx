import { useState } from "react";
import { ChevronDown, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Incident } from "../../data/mockData";

type LevelKey = "critical" | "warning" | "minor" | "clear" | "error";

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

interface Props {
  incidents: Incident[];
  onSelect: (id: string) => void;
  /** "live" (default) shows non-resolved; "archive" shows pre-filtered resolved window */
  mode?: "live" | "archive";
  layout?: "default" | "sidebar";
  sidebarMaxHeight?: string;
}

export default function AlertDetailsPanel({
  incidents,
  onSelect,
  mode = "live",
  layout = "default",
  sidebarMaxHeight = "calc(100dvh - 64px)",
}: Props) {
  const [open, setOpen] = useState<LevelKey | null>(mode === "archive" ? "clear" : "critical");
  const isSidebar = layout === "sidebar";

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        flex: isSidebar ? "0 1 auto" : 1,
        maxHeight: isSidebar ? sidebarMaxHeight : undefined,
        minWidth: 0,
        minHeight: 0,
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
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
          {mode === "archive"
            ? "Historical breakdown by level · Click to expand"
            : "Interval: 15 mins · Click a level to expand"}
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
      {LEVEL_CONFIG.map((cfg) => {
        const rows = getIncidentsForLevel(incidents, cfg, mode);
        const isOpen = open === cfg.key;
        return (
          <div key={cfg.key} style={{ borderBottom: "1px solid var(--color-border)" }}>
            {/* Row header */}
            <button
              onClick={() => setOpen(isOpen ? null : cfg.key)}
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
                      {rows.length > 4 && (
                        <div style={{ padding: "3px 20px 2px 36px", fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600 }}>
                          {rows.length} incidents
                        </div>
                      )}
                    <div
                      style={{
                        maxHeight: isSidebar ? undefined : rows.length > 4 ? 152 : undefined,
                        overflowY: isSidebar ? "visible" : rows.length > 4 ? "auto" : "visible",
                        overflowX: "hidden",
                      }}
                    >
                      {rows.map((inc) => (
                        <button
                          key={inc.id}
                          onClick={() => onSelect(inc.id)}
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
