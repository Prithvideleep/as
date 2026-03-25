import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertOctagon, Server, GitBranch, Link2, Info, CheckCircle2 } from "lucide-react";
import type { CorrelationCluster } from "../../data/mockData";

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};
const SEV_LABEL: Record<string, string> = {
  critical: "CRITICAL",
  high:     "HIGH",
  medium:   "MEDIUM",
  low:      "LOW",
};

interface Props {
  clusters: CorrelationCluster[];
  onSelect: (id: string) => void;
  mode?: "live" | "archive";
}

export default function CorrelationTile({ clusters, onSelect, mode = "live" }: Props) {
  const [expanded, setExpanded] = useState<string | null>(clusters[0]?.incidentId ?? null);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
      }}
    >
      {/* Tile header */}
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <GitBranch style={{ width: 16, height: 16, color: "var(--color-accent)", flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
            {mode === "archive"
              ? `Historical Clusters — Top ${clusters.length} Resolved`
              : `Correlation Tile — Top ${clusters.length} Alert Clusters`}
          </span>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
            {mode === "archive"
              ? "Resolved incidents from this window with related events and resolution details"
              : "AI-grouped critical & major alerts with related events and impacted services"}
          </p>
        </div>
      </div>

      {/* Cluster cards */}
      <div>
        {clusters.map((cluster, idx) => {
          const isOpen = expanded === cluster.incidentId;
          const color = SEV_COLOR[cluster.severity] ?? "#6B7280";

          return (
            <div
              key={cluster.incidentId}
              style={{
                borderBottom: idx < clusters.length - 1 ? "1px solid var(--color-border)" : "none",
                borderLeft: `3px solid ${isOpen ? color : "transparent"}`,
                transition: "border-color 0.15s",
              }}
            >
              {/* Cluster header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : cluster.incidentId)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px 14px 17px",
                  background: isOpen ? `${color}06` : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
              >
                {/* Severity badge */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    color,
                    backgroundColor: `${color}15`,
                    padding: "2px 7px",
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  {SEV_LABEL[cluster.severity] ?? cluster.severity.toUpperCase()}
                </span>

                {/* Incident name */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cluster.incidentName}
                </span>

                {/* Counts + resolved badge */}
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    flexShrink: 0,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  {cluster.resolutionSummary && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        color: "#22C55E",
                        backgroundColor: "rgba(34,197,94,0.12)",
                        padding: "2px 7px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      RESOLVED
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <AlertOctagon style={{ width: 10, height: 10 }} />
                    {cluster.relatedAlerts.length} alerts
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Server style={{ width: 10, height: 10 }} />
                    {cluster.impactedL1.length} services
                  </span>
                </span>

                <ChevronDown
                  style={{
                    width: 14,
                    height: 14,
                    color: "var(--color-text-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "0 20px 18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      {/* Related Alerts */}
                      <Section
                        icon={<AlertOctagon style={{ width: 12, height: 12, color }} />}
                        label="Related Alerts"
                        color={color}
                      >
                        {cluster.relatedAlerts.length === 0 ? (
                          <EmptyNote text="No related alert events recorded." />
                        ) : (
                          cluster.relatedAlerts.map((a, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "5px 0",
                                borderBottom: i < cluster.relatedAlerts.length - 1
                                  ? "1px dashed var(--color-border)"
                                  : "none",
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  backgroundColor: color,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ flex: 1, fontSize: 12, color: "var(--color-text-secondary)" }}>
                                {a.title}
                              </span>
                              <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>
                                {a.source} &middot; {a.timestamp}
                              </span>
                            </div>
                          ))
                        )}
                      </Section>

                      {/* Level 1 Impacted */}
                      <Section
                        icon={<Server style={{ width: 12, height: 12, color: "#F97316" }} />}
                        label="Level 1 — Directly Impacted Services"
                        color="#F97316"
                      >
                        {cluster.impactedL1.length === 0 ? (
                          <EmptyNote text="No high-severity impacted services identified." />
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                            {cluster.impactedL1.map((svc) => (
                              <span
                                key={svc.service}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "3px 10px",
                                  borderRadius: 999,
                                  backgroundColor: `${SEV_COLOR[svc.severity] ?? "#6B7280"}15`,
                                  color: SEV_COLOR[svc.severity] ?? "#6B7280",
                                  border: `1px solid ${SEV_COLOR[svc.severity] ?? "#6B7280"}30`,
                                }}
                                title={svc.impact}
                              >
                                {svc.service}
                              </span>
                            ))}
                          </div>
                        )}
                      </Section>

                      {/* Resolution (archive) or Level 2 Placeholder (live) */}
                      {cluster.resolutionSummary ? (
                        <Section
                          icon={<CheckCircle2 style={{ width: 12, height: 12, color: "#22C55E" }} />}
                          label="Resolution"
                          color="#22C55E"
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "8px 10px",
                              borderRadius: 8,
                              backgroundColor: "rgba(34,197,94,0.06)",
                              border: "1px solid rgba(34,197,94,0.2)",
                              marginTop: 4,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                              {cluster.resolutionSummary}
                            </span>
                          </div>
                        </Section>
                      ) : (
                        <Section
                          icon={<Link2 style={{ width: 12, height: 12, color: "#6B7280" }} />}
                          label="Level 2 — Downstream Dependencies"
                          color="#6B7280"
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 7,
                              padding: "8px 10px",
                              borderRadius: 8,
                              backgroundColor: "rgba(107,114,128,0.06)",
                              border: "1px dashed rgba(107,114,128,0.25)",
                              marginTop: 4,
                            }}
                          >
                            <Info style={{ width: 12, height: 12, color: "#6B7280", flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                              {cluster.impactedL2Placeholder}
                            </span>
                          </div>
                        </Section>
                      )}

                      {/* View Investigation / Resolution link */}
                      <button
                        onClick={() => onSelect(cluster.incidentId)}
                        style={{
                          alignSelf: "flex-start",
                          fontSize: 12,
                          fontWeight: 700,
                          color: mode === "archive" ? "#22C55E" : "var(--color-accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {mode === "archive" ? "View resolution details →" : "Open investigation →"}
                      </button>
                    </div>
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

// ─── Internal helpers ──────────────────────────────────────────────────────────

function Section({
  icon,
  label,
  color,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon}
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color,
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontStyle: "italic" }}>
      {text}
    </span>
  );
}
