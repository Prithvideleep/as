import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronDown, AlertOctagon, Server, GitBranch, Link2, Info, CheckCircle2, ArrowRight } from "lucide-react";
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
  style?: React.CSSProperties;
  /** Visually emphasize the cluster row (e.g. linked from Impacted Services). */
  highlightIncidentId?: string | null;
  /** When nonce changes with this id, scroll row into view and expand. */
  scrollToIncidentId?: string | null;
  scrollRequestNonce?: number;
}

export default function CorrelationTile({
  clusters,
  onSelect,
  mode = "live",
  style,
  highlightIncidentId = null,
  scrollToIncidentId = null,
  scrollRequestNonce = 0,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(clusters[0]?.incidentId ?? null);
  const lastScrollNonce = useRef(0);

  useEffect(() => {
    if (!scrollToIncidentId || scrollRequestNonce === lastScrollNonce.current) return;
    lastScrollNonce.current = scrollRequestNonce;
    setExpanded(scrollToIncidentId);
    requestAnimationFrame(() => {
      const el = document.getElementById(`cluster-anchor-${scrollToIncidentId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [scrollToIncidentId, scrollRequestNonce]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
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
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2, lineHeight: 1.45 }}>
            {mode === "archive"
              ? "Resolved clusters — key facts and resolution context"
              : "Top correlated incidents · times follow the dashboard header window"}
          </p>
        </div>
      </div>

      {/* Cluster cards — height from content; parent column scrolls (avoids nested scroll) */}
      <div style={{ flex: "0 0 auto", overflow: "visible" }}>
        <LayoutGroup>
        {clusters.map((cluster, idx) => {
          const isOpen = expanded === cluster.incidentId;
          const color = SEV_COLOR[cluster.severity] ?? "#6B7280";
          const isLinked = highlightIncidentId === cluster.incidentId;
          const topServices = cluster.impactedL1.slice(0, 3).map((s) => s.service);
          const serviceRest = cluster.impactedL1.length - topServices.length;

          return (
            <div
              key={cluster.incidentId}
              id={`cluster-anchor-${cluster.incidentId}`}
              style={{
                borderBottom: idx < clusters.length - 1 ? "1px solid var(--color-border)" : "none",
                borderLeft: `3px solid ${isOpen || isLinked ? color : "transparent"}`,
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: isLinked ? `inset 0 0 0 1px ${color}40, 0 0 0 3px ${color}18` : undefined,
                backgroundColor: isLinked ? `${color}05` : undefined,
              }}
            >
              {/* Cluster header row */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "stretch",
                  gap: 8,
                  padding: "0 10px 0 0",
                  background: isOpen ? `${color}06` : "transparent",
                  transition: "background 0.2s ease",
                }}
              >
                {/* Expand/collapse button (no nested buttons inside) */}
                <button
                  onClick={() => setExpanded(isOpen ? null : cluster.incidentId)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 6,
                    padding: "12px 6px 12px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        color,
                        backgroundColor: `${color}15`,
                        padding: "3px 8px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      {SEV_LABEL[cluster.severity] ?? cluster.severity.toUpperCase()}
                    </span>
                    {cluster.resolutionSummary && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.05em",
                          color: "#22C55E",
                          backgroundColor: "rgba(34,197,94,0.12)",
                          padding: "2px 6px",
                          borderRadius: 999,
                          flexShrink: 0,
                        }}
                      >
                        RESOLVED
                      </span>
                    )}
                    <span
                      style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.25,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minWidth: 0,
                      }}
                    >
                      {cluster.incidentName}
                    </span>
                    <ChevronDown
                      style={{
                        width: 14,
                        height: 14,
                        color: "var(--color-text-muted)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                        flexShrink: 0,
                        alignSelf: "flex-start",
                        marginTop: 3,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 6,
                      paddingLeft: 2,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)" }}>
                      Affected
                    </span>
                    {topServices.length === 0 ? (
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        No L1 services tagged
                      </span>
                    ) : (
                      <>
                        {topServices.map((name) => (
                          <span
                            key={name}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 999,
                              backgroundColor: `${color}12`,
                              color: "var(--color-text-secondary)",
                              border: `1px solid ${color}28`,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </span>
                        ))}
                        {serviceRest > 0 && (
                          <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600 }}>
                            +{serviceRest} more
                          </span>
                        )}
                      </>
                    )}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <AlertOctagon style={{ width: 10, height: 10, opacity: 0.75 }} />
                        {cluster.relatedAlerts.length}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Server style={{ width: 10, height: 10, opacity: 0.75 }} />
                        {cluster.impactedL1.length}
                      </span>
                    </span>
                  </div>
                </button>

                {/* Direct investigate / view link — separate sibling button */}
                <button
                  onClick={() => onSelect(cluster.incidentId)}
                  title={mode === "archive" ? "View resolution" : "Open investigation"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "center",
                    gap: 3,
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: `1px solid ${color}35`,
                    backgroundColor: `${color}10`,
                    color,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}10`;
                  }}
                >
                  {mode === "archive" ? "View" : "Investigate"}
                  <ArrowRight style={{ width: 9, height: 9 }} />
                </button>
              </div>

              {/* Expanded detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    layout
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.22 },
                      layout: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding: "4px 18px 16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
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
        </LayoutGroup>
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
