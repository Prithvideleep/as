import { useMemo, useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, ArrowRight, AlertOctagon, Server, Link2, Info } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import type { CorrelationCluster, Incident, IncidentDetail, BlastRadiusItem, Severity } from "../../data/mockData";
import {
  buildCorrelatedDetailGroups,
  buildInactiveCorrelatedDetailGroups,
  flattenGroupsForCsv,
  correlatedRowsToCsv,
  getImpactedRowsForSelection,
  type CorrelatedDetailGroup,
} from "./buildCorrelatedDetailsRows";

const LABEL: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  display: "block",
  marginBottom: 6,
};

const HINT: CSSProperties = {
  fontSize: 11,
  color: "var(--color-text-muted)",
  marginBottom: 10,
  lineHeight: 1.45,
};

const TH: CSSProperties = {
  padding: "10px 12px",
  fontWeight: 700,
  color: "var(--color-text-muted)",
  whiteSpace: "nowrap",
  fontSize: 11,
  textAlign: "left",
  borderBottom: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-primary)",
};

const SEV_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#22C55E",
};

const SEV_LABEL: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const SAMPLE_SIZE = 10;
/** Columns: No. … Change # + Actions */
const COL_COUNT = 9;

const DEFAULT_L2 =
  "Downstream dependency mapping requires enriched data pipeline (Phase 2).";

function sampleRandomGroups(groups: CorrelatedDetailGroup[], take: number): CorrelatedDetailGroup[] {
  if (groups.length === 0) return [];
  const arr = [...groups];
  const seedStr = arr.map((g) => g.incidentId).sort().join("\0");
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  const rnd = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(take, arr.length));
}

function resolveCardContent(
  group: CorrelatedDetailGroup,
  cluster: CorrelationCluster | undefined,
  detail: IncidentDetail | undefined,
  incident: Incident | undefined
): {
  relatedAlerts: { title: string; source: string; timestamp: string }[];
  impactedL1: BlastRadiusItem[];
  impactedL2Placeholder: string;
  severity: Severity;
  title: string;
} {
  if (cluster) {
    return {
      relatedAlerts: cluster.relatedAlerts,
      impactedL1: cluster.impactedL1,
      impactedL2Placeholder: cluster.impactedL2Placeholder,
      severity: cluster.severity,
      title: cluster.incidentName,
    };
  }
  if (detail) {
    const relatedAlerts = detail.timeline
      .filter((t) => t.type === "alert" || t.type === "anomaly")
      .slice(0, 8)
      .map((t) => ({ title: t.title, source: t.source, timestamp: t.timestamp }));
    const impactedL1 = detail.blastRadius.filter((b) => b.severity === "critical" || b.severity === "high");
    return {
      relatedAlerts,
      impactedL1,
      impactedL2Placeholder: DEFAULT_L2,
      severity: detail.severity,
      title: detail.name,
    };
  }
  return {
    relatedAlerts: [],
    impactedL1: [],
    impactedL2Placeholder: DEFAULT_L2,
    severity: (incident?.severity ?? "medium") as Severity,
    title: group.owner.alertName || "Incident",
  };
}

export default function AlertCorrelatedDetailsTable({
  clusters,
  incidents,
  incidentDetails,
}: {
  clusters: CorrelationCluster[];
  incidents: Incident[];
  incidentDetails: Record<string, IncidentDetail>;
}) {
  const incidentsById = useMemo(() => Object.fromEntries(incidents.map((i) => [i.id, i])), [incidents]);
  const clusterById = useMemo(() => Object.fromEntries(clusters.map((c) => [c.incidentId, c])), [clusters]);

  const activeGroups = useMemo(
    () => buildCorrelatedDetailGroups(clusters, incidentsById, incidentDetails),
    [clusters, incidentsById, incidentDetails]
  );

  const inactiveGroups = useMemo(
    () => buildInactiveCorrelatedDetailGroups(incidents, incidentDetails),
    [incidents, incidentDetails]
  );

  const allGroups = useMemo(() => [...activeGroups, ...inactiveGroups], [activeGroups, inactiveGroups]);

  const [includeInactiveRows, setIncludeInactiveRows] = useState(false);
  const rowPool = useMemo(
    () => (includeInactiveRows ? allGroups : activeGroups),
    [includeInactiveRows, allGroups, activeGroups]
  );
  const rowPoolSig = useMemo(() => rowPool.map((g) => g.incidentId).sort().join("|"), [rowPool]);
  const displayedGroups = useMemo(() => sampleRandomGroups(rowPool, SAMPLE_SIZE), [rowPool, rowPoolSig]);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggleGroup = useCallback((incidentKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(incidentKey)) next.delete(incidentKey);
      else next.add(incidentKey);
      return next;
    });
  }, []);

  const exportCsv = useCallback(() => {
    const activeFlat = flattenGroupsForCsv(activeGroups, {});
    const inactiveFlat = flattenGroupsForCsv(inactiveGroups, {});
    const csv = correlatedRowsToCsv([...activeFlat, ...inactiveFlat]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-correlated-details-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeGroups, inactiveGroups]);

  const empty = allGroups.length === 0;
  const noRowsInPool = !empty && rowPool.length === 0;

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={LABEL}>Alert correlated details</span>
          <p style={HINT}>
            Table view with <strong style={{ color: "var(--color-text-secondary)" }}>up to {SAMPLE_SIZE}</strong> sample groups.
            <strong style={{ color: "#16A34A" }}> Active</strong> rows use green accents;{" "}
            <strong style={{ color: "var(--color-text-muted)" }}>Inactive</strong> use grey. By default only active rows are shown;
            enable below to include inactive. Expand a row for related alerts, Level 1, blast radius, and Level 2 context.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={includeInactiveRows}
              onChange={(e) => setIncludeInactiveRows(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: "var(--color-accent)", cursor: "pointer" }}
            />
            Show inactive rows
          </label>
        <button
          type="button"
          onClick={exportCsv}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Download style={{ width: 14, height: 14 }} />
          Export
        </button>
        </div>
      </div>
      <div
        style={{
          borderRadius: 14,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          overflow: "auto",
        }}
      >
        {empty ? (
          <p style={{ padding: 20, margin: 0, color: "var(--color-text-muted)", fontSize: 13 }}>No correlated rows.</p>
        ) : noRowsInPool ? (
          <p style={{ padding: 20, margin: 0, color: "var(--color-text-muted)", fontSize: 13 }}>
            No active rows in the sample. Turn on <strong style={{ color: "var(--color-text-secondary)" }}>Show inactive rows</strong>{" "}
            to include inactive incidents.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {[
                  "No.",
                  "State",
                  "Severity",
                  "Alert name",
                  "Start time",
                  "App name / AIDE ID",
                  "Associated Incident #",
                  "Associated Change #",
                  "Actions",
                ].map((h, i) => (
                  <th key={i} style={{ ...TH, textAlign: i === COL_COUNT - 1 ? "right" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedGroups.map((group, idx) => (
                <CorrelatedDetailTableRows
                  key={group.incidentId}
                  group={group}
                  displayNo={idx + 1}
                  cluster={clusterById[group.incidentId]}
                  detail={incidentDetails[group.incidentId]}
                  incident={incidentsById[group.incidentId]}
                  expanded={expanded.has(group.incidentId)}
                  onToggle={() => toggleGroup(group.incidentId)}
                  isLast={idx === displayedGroups.length - 1}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CorrelatedDetailTableRows({
  group,
  displayNo,
  cluster,
  detail,
  incident,
  expanded,
  onToggle,
  isLast,
}: {
  group: CorrelatedDetailGroup;
  displayNo: number;
  cluster: CorrelationCluster | undefined;
  detail: IncidentDetail | undefined;
  incident: Incident | undefined;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();
  const { owner } = group;
  const isActive = owner.state === "Active";
  const stateAccent = isActive ? "#16A34A" : "#64748b";
  const stateBg = isActive ? "rgba(34, 197, 94, 0.07)" : "rgba(100, 116, 139, 0.09)";
  const stateColor = isActive ? "#16A34A" : "var(--color-text-muted)";

  const content = resolveCardContent(group, cluster, detail, incident);
  const sevColor = SEV_COLOR[content.severity] ?? "#6B7280";

  const openInvestigation = useCallback(() => {
    setSelectedIncidentId(group.incidentId);
    navigate("/investigation");
  }, [group.incidentId, navigate, setSelectedIncidentId]);

  const fullBlastServices = useMemo(() => {
    if (!isActive) return [];
    return getImpactedRowsForSelection(group, undefined).map((r) => r.service);
  }, [group, isActive]);

  const inactiveBlastTags = useMemo(() => {
    if (isActive || !detail) return [];
    return detail.blastRadius.map((b) => b.service);
  }, [detail, isActive]);

  const incidentBtn: CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    font: "inherit",
    fontWeight: 700,
    color: "#EB5928",
    cursor: "pointer",
    textDecoration: "underline",
    textAlign: "left",
  };

  const rowBgCollapsed = isActive ? "rgba(34, 197, 94, 0.04)" : "rgba(100, 116, 139, 0.05)";
  const rowStyle: CSSProperties = {
    borderBottom: expanded ? "none" : isLast ? "none" : "1px solid var(--color-border)",
    borderLeft: `3px solid ${expanded ? stateAccent : "transparent"}`,
    backgroundColor: expanded ? stateBg : rowBgCollapsed,
    cursor: "pointer",
    transition: "background-color 0.15s, border-color 0.2s",
  };

  return (
    <>
      <tr
        style={rowStyle}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        aria-expanded={expanded}
      >
        <td style={{ padding: "10px 12px", fontWeight: 700, verticalAlign: "top" }}>{displayNo}</td>
        <td style={{ padding: "10px 12px", fontWeight: 700, color: stateColor, verticalAlign: "top" }}>{owner.state}</td>
        <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: sevColor,
              backgroundColor: `${sevColor}15`,
              padding: "3px 8px",
              borderRadius: 999,
              display: "inline-block",
            }}
          >
            {SEV_LABEL[content.severity] ?? content.severity.toUpperCase()}
          </span>
        </td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-primary)", fontWeight: 600, maxWidth: 220, verticalAlign: "top" }}>
          {content.title}
        </td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", verticalAlign: "top" }}>
          {owner.startTime}
        </td>
        <td
          style={{
            padding: "10px 12px",
            color: "var(--color-text-secondary)",
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            verticalAlign: "top",
          }}
        >
          {owner.aideId}
        </td>
        <td style={{ padding: "10px 12px", verticalAlign: "top" }} onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={openInvestigation} style={incidentBtn} title="Open in Investigation">
            {owner.incidentId}
          </button>
        </td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", verticalAlign: "top" }}>{owner.changeId}</td>
        <td
          style={{ padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onToggle}
              title={expanded ? "Collapse" : "Expand"}
              style={{
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "flex",
              }}
            >
              <ChevronDown
                style={{
                  width: 16,
                  height: 16,
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                }}
              />
            </button>
            <button
              type="button"
              onClick={openInvestigation}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 8,
                border: `1px solid ${sevColor}35`,
                backgroundColor: `${sevColor}10`,
                color: sevColor,
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Investigate
              <ArrowRight style={{ width: 10, height: 10 }} />
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <tr key={`${group.incidentId}-detail`}>
            <td
              colSpan={COL_COUNT}
              style={{
                padding: 0,
                borderBottom: isLast ? "none" : "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-primary)",
                verticalAlign: "top",
                borderLeft: `3px solid ${stateAccent}`,
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  borderTop: "1px solid var(--color-border)",
                  background: `linear-gradient(180deg, ${stateAccent}0c 0%, transparent 36px)`,
                }}
              >
                <div
                  style={{
                    maxHeight: 360,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    padding: "12px 16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <ExpandedDetailBody
                    content={content}
                    sevColor={sevColor}
                    isActive={isActive}
                    fullBlastServices={fullBlastServices}
                    inactiveBlastTags={inactiveBlastTags}
                    openInvestigation={openInvestigation}
                  />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

type CardContent = ReturnType<typeof resolveCardContent>;

function ExpandedDetailBody({
  content,
  sevColor,
  isActive,
  fullBlastServices,
  inactiveBlastTags,
  openInvestigation,
}: {
  content: CardContent;
  sevColor: string;
  isActive: boolean;
  fullBlastServices: string[];
  inactiveBlastTags: string[];
  openInvestigation: () => void;
}) {
  const [showInactiveContext, setShowInactiveContext] = useState(false);
  return (
    <>
      <DetailSection
        icon={<AlertOctagon style={{ width: 12, height: 12, color: sevColor }} />}
        label="Related Alerts"
        color={sevColor}
      >
        {content.relatedAlerts.length === 0 ? (
          <EmptyNote text="No related alert events recorded." />
        ) : (
          content.relatedAlerts.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 0",
                borderBottom: i < content.relatedAlerts.length - 1 ? "1px dashed var(--color-border)" : "none",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: sevColor,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 12, color: "var(--color-text-secondary)" }}>{a.title}</span>
              <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>
                {a.source} · {a.timestamp}
              </span>
            </div>
          ))
        )}
      </DetailSection>

      <DetailSection
        icon={<Server style={{ width: 12, height: 12, color: "#F97316" }} />}
        label="Level 1 — Directly Impacted Services"
        color="#F97316"
      >
        {content.impactedL1.length === 0 ? (
          <EmptyNote text="No high-severity impacted services identified." />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {content.impactedL1.map((svc) => (
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
      </DetailSection>

      {isActive && fullBlastServices.length > 0 && (
        <DetailSection
          icon={<Server style={{ width: 12, height: 12, color: "#EB5928" }} />}
          label="Impacted services (full blast radius)"
          color="#EB5928"
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {fullBlastServices.map((svc) => (
              <span
                key={svc}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  backgroundColor: "rgba(235, 89, 40, 0.08)",
                  color: "#EB5928",
                  border: "1px solid rgba(235, 89, 40, 0.25)",
                }}
              >
                {svc}
              </span>
            ))}
          </div>
        </DetailSection>
      )}

      {!isActive && inactiveBlastTags.length > 0 && (
        <div style={{ marginTop: 2 }}>
          <button
            type="button"
            onClick={() => setShowInactiveContext((v) => !v)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 0",
            }}
          >
            {showInactiveContext ? "Hide inactive context" : "Show inactive context"}
          </button>
          {showInactiveContext && (
            <DetailSection
              icon={<Server style={{ width: 12, height: 12, color: "#64748b" }} />}
              label="Blast radius (record)"
              color="#64748b"
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {inactiveBlastTags.map((svc) => (
                  <span
                    key={svc}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      backgroundColor: "rgba(100, 116, 139, 0.1)",
                      color: "var(--color-text-secondary)",
                      border: "1px solid rgba(100, 116, 139, 0.22)",
                    }}
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}
        </div>
      )}

      <DetailSection
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
            {content.impactedL2Placeholder}
          </span>
        </div>
      </DetailSection>

      <button
        type="button"
        onClick={openInvestigation}
        style={{
          alignSelf: "flex-start",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-accent)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        Open investigation →
      </button>
    </>
  );
}

function DetailSection({
  icon,
  label,
  color,
  children,
}: {
  icon: ReactNode;
  label: string;
  color: string;
  children: ReactNode;
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
    <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontStyle: "italic" }}>{text}</span>
  );
}
