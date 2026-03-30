import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, ChevronDown, Server, AlertOctagon, X } from "lucide-react";
import type { Incident, IncidentDetail, BlastRadiusItem } from "../../data/mockData";

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SEV_LABEL: Record<string, string>  = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };

interface ServiceEntry {
  service:         string;
  topSeverity:     BlastRadiusItem["severity"];
  impact:          string;
  incidentCount:   number;
  worstIncidentId: string;
  /** All incidents (sorted by severity) that reference this service */
  relatedIncidents: { id: string; name: string; severity: string; alertCount: number; timestamp: string; impact: string }[];
}

function buildImpactedServices(
  activeIncidents: Incident[],
  details: Record<string, IncidentDetail>
): ServiceEntry[] {
  const map = new Map<string, ServiceEntry>();

  for (const inc of activeIncidents) {
    const detail = details[inc.id];
    if (!detail) continue;
    for (const br of detail.blastRadius) {
      const existing = map.get(br.service);
      const ref = { id: inc.id, name: inc.name, severity: inc.severity, alertCount: inc.alertCount, timestamp: inc.timestamp, impact: br.impact };
      if (!existing) {
        map.set(br.service, {
          service: br.service,
          topSeverity: br.severity,
          impact: br.impact,
          incidentCount: 1,
          worstIncidentId: inc.id,
          relatedIncidents: [ref],
        });
      } else {
        if (SEV_ORDER[br.severity] < SEV_ORDER[existing.topSeverity]) {
          existing.topSeverity = br.severity;
          existing.impact = br.impact;
          existing.worstIncidentId = inc.id;
        }
        existing.incidentCount++;
        existing.relatedIncidents.push(ref);
      }
    }
  }

  // Sort related incidents inside each service entry by severity
  for (const entry of map.values()) {
    entry.relatedIncidents.sort((a, b) => {
      const sv = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
      return sv !== 0 ? sv : b.alertCount - a.alertCount;
    });
  }

  return [...map.values()].sort((a, b) => {
    const sv = SEV_ORDER[a.topSeverity] - SEV_ORDER[b.topSeverity];
    return sv !== 0 ? sv : b.incidentCount - a.incidentCount;
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function minutesAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff <= 0) return "just now";
  if (diff === 1) return "1 min ago";
  return `${diff} min ago`;
}

interface Props {
  incidents:       Incident[];
  incidentDetails: Record<string, IncidentDetail>;
  onSelect:        (id: string) => void;
  lastUpdated:     string;
  /** Pinned header + summary; sidebar list flows with rail scroll. */
  layout?:         "default" | "sidebar";
  /** Row highlight when linked from correlation focus (sidebar). */
  highlightedService?: string | null;
  /** When expanding a service, parent can scroll/highlight matching cluster. */
  onServiceActivate?: (service: string) => void;
}

const SVC_PAGE_SIZE = 5;

export default function IncidentTile({
  incidents,
  incidentDetails,
  onSelect,
  lastUpdated,
  layout = "default",
  highlightedService = null,
  onServiceActivate,
}: Props) {
  const isSidebar = layout === "sidebar";
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [svcPage, setSvcPage] = useState(1);
  const [sortMode, setSortMode] = useState<"severity" | "name">("severity");

  const activeIncidentCount = useMemo(
    () => incidents.filter((i) => i.status !== "resolved").length,
    [incidents]
  );

  const services = useMemo(() => {
    const active = incidents.filter((i) => i.status !== "resolved");
    const list = buildImpactedServices(active, incidentDetails);
    if (sortMode === "name") return [...list].sort((a, b) => a.service.localeCompare(b.service));
    return list;
  }, [incidents, incidentDetails, sortMode]);

  useEffect(() => {
    setSvcPage(1);
  }, [sortMode]);

  const totalSvcPages = Math.max(1, Math.ceil(services.length / SVC_PAGE_SIZE));
  const pageServices  = services.slice((svcPage - 1) * SVC_PAGE_SIZE, svcPage * SVC_PAGE_SIZE);

  const criticalCount = services.filter((s) => s.topSeverity === "critical").length;
  const highCount     = services.filter((s) => s.topSeverity === "high").length;

  function toggleService(name: string) {
    setExpandedService((prev) => (prev === name ? null : name));
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flex: isSidebar ? "0 1 auto" : 1,
        minWidth: 0,
        width: "100%",
        justifyContent: "flex-start",
        minHeight: 0,
      }}
    >
      {/* Header — always visible in sidebar layout (not inside scroll region) */}
      <div
        style={{
          flexShrink: 0,
          padding: "18px 20px 10px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Server style={{ width: 13, height: 13, color: "var(--color-accent)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>
            Impacted Services
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {expandedService && (
            <button
              onClick={() => setExpandedService(null)}
              title="Collapse"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2, color: "var(--color-text-muted)" }}
            >
              <X style={{ width: 11, height: 11 }} />
            </button>
          )}
          <span style={{ fontSize: 10, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock style={{ width: 10, height: 10 }} />
            Updated {minutesAgo(lastUpdated)}
          </span>
        </div>
      </div>

      {/* Summary chips — pinned with header when layout=sidebar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 8,
          padding: "8px 20px",
          borderBottom: "1px solid var(--color-border)",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            { label: "Critical", count: criticalCount, color: "#EF4444" },
            { label: "High",     count: highCount,     color: "#F97316" },
            { label: "Other",    count: services.length - criticalCount - highCount, color: "#6B7280" },
          ] as const
        ).map(({ label, count, color }) => (
          <span
            key={label}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: count > 0 ? color : "var(--color-text-muted)",
              backgroundColor: count > 0 ? `${color}12` : "transparent",
              border: `1px solid ${count > 0 ? `${color}30` : "var(--color-border)"}`,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {count} {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-text-muted)" }}>
          {services.length} total
        </span>
        {isSidebar && (
          <div style={{ width: "100%", display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--color-text-muted)", alignSelf: "center" }}>
              Sort
            </span>
            {(
              [
                { id: "severity" as const, label: "Severity" },
                { id: "name" as const, label: "A–Z" },
              ]
            ).map(({ id, label }) => {
              const on = sortMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSortMode(id)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: `1px solid ${on ? "rgba(235,89,40,0.45)" : "var(--color-border)"}`,
                    backgroundColor: on ? "rgba(235,89,40,0.1)" : "transparent",
                    color: on ? "#EB5928" : "var(--color-text-muted)",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
            <span
              style={{
                fontSize: 9,
                color: "var(--color-text-muted)",
                alignSelf: "center",
                marginLeft: "auto",
                fontStyle: "italic",
              }}
              title="Expand a service to jump to a matching cluster when available"
            >
              Link → clusters
            </span>
          </div>
        )}
      </div>

      {/* Service rows — sidebar: fill remaining height and scroll; default: natural height */}
      <div style={{ flex: "0 0 auto", overflow: "visible" }}>
        {pageServices.length === 0 ? (
          <div style={{ padding: "18px 16px", fontSize: 12, color: "var(--color-text-muted)", textAlign: "center" }}>
            No impacted services detected
          </div>
        ) : (
          pageServices.map((svc, i) => {
            const color     = SEV_COLOR[svc.topSeverity] ?? "#6B7280";
            const isOpen    = expandedService === svc.service;
            const isLast    = i === pageServices.length - 1;
            const isHi      = highlightedService === svc.service;

            return (
              <div
                key={svc.service}
                style={{
                  borderBottom: isLast && !isOpen ? "none" : "1px solid var(--color-border)",
                  boxShadow: isHi ? `inset 3px 0 0 ${color}` : undefined,
                  backgroundColor: isHi ? `${color}06` : undefined,
                  transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Service row header */}
                <button
                  type="button"
                  title={svc.impact}
                  onClick={() => {
                    if (!isOpen) onServiceActivate?.(svc.service);
                    toggleService(svc.service);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    background: isOpen ? `${color}08` : "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}06`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  {/* Severity dot */}
                  <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />

                  {/* Service name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 700,
                      color: isOpen ? color : "var(--color-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {svc.service}
                  </span>

                  {/* Severity badge */}
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color,
                      backgroundColor: `${color}12`,
                      padding: "2px 6px",
                      borderRadius: 999,
                      flexShrink: 0,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {SEV_LABEL[svc.topSeverity]}
                  </span>

                  {/* Incident count badge */}
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                      minWidth: 16,
                      textAlign: "right",
                    }}
                  >
                    ×{svc.incidentCount}
                  </span>

                  {/* Expand/collapse chevron — rotates like AlertDetailsPanel */}
                  <ChevronDown
                    style={{
                      width: 11,
                      height: 11,
                      color: isOpen ? color : "var(--color-text-muted)",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {/* Expanded: all related incidents */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          backgroundColor: `${color}05`,
                          borderTop: `1px solid ${color}20`,
                          borderBottom: isLast ? "none" : `1px solid var(--color-border)`,
                        }}
                      >
                        {/* Sub-header */}
                        <div style={{ padding: "6px 20px 4px 34px", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            {svc.relatedIncidents.length} incident{svc.relatedIncidents.length === 1 ? "" : "s"} affecting this service
                          </span>
                        </div>

                        {svc.relatedIncidents.map((rel, ri) => {
                          const rc = SEV_COLOR[rel.severity] ?? "#6B7280";
                          return (
                            <button
                              key={rel.id}
                              onClick={() => onSelect(rel.id)}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: "7px 20px 7px 34px",
                                background: "none",
                                border: "none",
                                borderTop: ri > 0 ? `1px dashed ${color}18` : "none",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${rc}10`;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                              }}
                            >
                              {/* Severity stripe */}
                              <span
                                style={{
                                  width: 3,
                                  alignSelf: "stretch",
                                  borderRadius: 2,
                                  backgroundColor: rc,
                                  flexShrink: 0,
                                  minHeight: 14,
                                }}
                              />

                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Incident name */}
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "var(--color-text-primary)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {rel.name}
                                </div>
                                {/* Impact note */}
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-muted)",
                                    marginTop: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {rel.impact}
                                </div>
                              </div>

                              {/* Meta */}
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 800,
                                    color: rc,
                                    backgroundColor: `${rc}12`,
                                    padding: "1px 5px",
                                    borderRadius: 999,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  {SEV_LABEL[rel.severity] ?? rel.severity}
                                </span>
                                <span style={{ fontSize: 9, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 2 }}>
                                  <AlertOctagon style={{ width: 8, height: 8 }} />
                                  {rel.alertCount} · {formatTime(rel.timestamp)}
                                </span>
                              </div>

                              <ChevronRight style={{ width: 10, height: 10, color: "var(--color-text-muted)", flexShrink: 0, alignSelf: "center" }} />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer — pagination (flex-shrink 0, sits directly under list) */}
      <div
        style={{
          flexShrink: 0,
          flex: "0 0 auto",
          borderTop: "1px solid var(--color-border)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Across {activeIncidentCount} active incident{activeIncidentCount === 1 ? "" : "s"}
        </span>
        {totalSvcPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => { setSvcPage((p) => Math.max(1, p - 1)); setExpandedService(null); }}
              disabled={svcPage === 1}
              style={{
                padding: "2px 8px", borderRadius: 6, border: "1px solid var(--color-border)",
                background: "none", cursor: svcPage === 1 ? "not-allowed" : "pointer",
                color: svcPage === 1 ? "var(--color-text-muted)" : "var(--color-text-secondary)",
                fontSize: 11, fontWeight: 700, opacity: svcPage === 1 ? 0.45 : 1,
              }}
            >‹</button>
            <span style={{ fontSize: 10, color: "var(--color-text-muted)", minWidth: 44, textAlign: "center" }}>
              {svcPage} / {totalSvcPages}
            </span>
            <button
              onClick={() => { setSvcPage((p) => Math.min(totalSvcPages, p + 1)); setExpandedService(null); }}
              disabled={svcPage === totalSvcPages}
              style={{
                padding: "2px 8px", borderRadius: 6, border: "1px solid var(--color-border)",
                background: "none", cursor: svcPage === totalSvcPages ? "not-allowed" : "pointer",
                color: svcPage === totalSvcPages ? "var(--color-text-muted)" : "var(--color-text-secondary)",
                fontSize: 11, fontWeight: 700, opacity: svcPage === totalSvcPages ? 0.45 : 1,
              }}
            >›</button>
          </div>
        )}
      </div>
    </div>
  );
}
