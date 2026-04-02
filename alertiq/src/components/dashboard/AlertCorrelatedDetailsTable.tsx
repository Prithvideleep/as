import { useMemo, useCallback, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronRight, ChevronDown } from "lucide-react";
import type { CorrelationCluster, Incident, IncidentDetail } from "../../data/mockData";
import {
  buildCorrelatedDetailGroups,
  flattenGroupsForCsv,
  correlatedRowsToCsv,
  type CorrelatedDetailGroup,
  type CorrelatedDetailRow,
} from "./buildCorrelatedDetailsRows";

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  display: "block",
  marginBottom: 6,
};

const HINT: React.CSSProperties = {
  fontSize: 11,
  color: "var(--color-text-muted)",
  marginBottom: 10,
  lineHeight: 1.45,
};

const COLS = [
  "No.",
  "State",
  "Alert name",
  "Start time",
  "Service info",
  "Owner or Impacted",
  "App name / AIDE ID",
  "Associated Incident #",
  "Associated Change #",
  "History",
] as const;

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

  const groups = useMemo(
    () => buildCorrelatedDetailGroups(clusters, incidentsById, incidentDetails),
    [clusters, incidentsById, incidentDetails]
  );

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
    const flat = flattenGroupsForCsv(groups);
    const csv = correlatedRowsToCsv(flat);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-correlated-details-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [groups]);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={LABEL}>Alert correlated details</span>
          <p style={HINT}>
            <strong style={{ color: "var(--color-text-secondary)" }}>Owner</strong> — service the alert belongs to.{" "}
            <strong style={{ color: "var(--color-text-secondary)" }}>Impacted</strong> — apps/services affected.{" "}
            Click an <strong style={{ color: "var(--color-text-secondary)" }}>Owner</strong> row to show or hide impacted
            lines.
          </p>
        </div>
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
      <div
        style={{
          borderRadius: 14,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          overflow: "auto",
        }}
      >
        {groups.length === 0 ? (
          <p style={{ padding: 20, margin: 0, color: "var(--color-text-muted)", fontSize: 13 }}>No correlated rows.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                {COLS.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => (
                <GroupRows
                  key={group.incidentId}
                  group={group}
                  displayNo={idx + 1}
                  expanded={expanded.has(group.incidentId)}
                  onToggle={() => toggleGroup(group.incidentId)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function GroupRows({
  group,
  displayNo,
  expanded,
  onToggle,
}: {
  group: CorrelatedDetailGroup;
  displayNo: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { owner, impacted } = group;
  const hasChildren = impacted.length > 0;
  const rowSpan = 1 + impacted.length;
  const stateColor = owner.state === "Active" ? "#16A34A" : "var(--color-text-muted)";
  const ownerBg =
    owner.state === "Active" ? "rgba(34, 197, 94, 0.07)" : "rgba(100, 116, 139, 0.09)";

  const ownerRowStyle: CSSProperties = {
    borderBottom: "1px solid var(--color-border)",
    backgroundColor: ownerBg,
    cursor: hasChildren ? "pointer" : "default",
  };

  const commonCells = (r: CorrelatedDetailRow) => (
    <>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.service}</td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-muted)", fontWeight: 600 }}>{r.role}</td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", fontFamily: "ui-monospace, monospace" }}>
        {r.aideId}
      </td>
      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.incidentId}</td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.changeId}</td>
      <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
        <Link to="/history" style={{ color: "#EB5928", fontWeight: 600, textDecoration: "none" }}>
          {r.historyLabel}
        </Link>
      </td>
    </>
  );

  if (!hasChildren || !expanded) {
    return (
      <tr
        style={ownerRowStyle}
        onClick={hasChildren ? onToggle : undefined}
        onKeyDown={
          hasChildren
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle();
                }
              }
            : undefined
        }
        tabIndex={hasChildren ? 0 : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        <td style={{ padding: "10px 12px", fontWeight: 700, verticalAlign: "middle" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {hasChildren ? (
              <span style={{ color: "var(--color-text-muted)", display: "flex" }} aria-hidden>
                {expanded ? <ChevronDown style={{ width: 15, height: 15 }} /> : <ChevronRight style={{ width: 15, height: 15 }} />}
              </span>
            ) : (
              <span style={{ display: "inline-block", width: 21 }} />
            )}
            {displayNo}
          </span>
        </td>
        <td style={{ padding: "10px 12px", fontWeight: 700, color: stateColor }}>{owner.state}</td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-primary)", maxWidth: 200 }}>{owner.alertName}</td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{owner.startTime}</td>
        {commonCells(owner)}
      </tr>
    );
  }

  return (
    <>
      <tr
        style={ownerRowStyle}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        aria-expanded
      >
        <td style={{ padding: "10px 12px", fontWeight: 700, verticalAlign: "top" }} rowSpan={rowSpan}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--color-text-muted)", display: "flex" }} aria-hidden>
              <ChevronDown style={{ width: 15, height: 15 }} />
            </span>
            {displayNo}
          </span>
        </td>
        <td style={{ padding: "10px 12px", fontWeight: 700, color: stateColor, verticalAlign: "top" }} rowSpan={rowSpan}>
          {owner.state}
        </td>
        <td
          style={{ padding: "10px 12px", color: "var(--color-text-primary)", maxWidth: 200, verticalAlign: "top" }}
          rowSpan={rowSpan}
        >
          {owner.alertName}
        </td>
        <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", verticalAlign: "top" }} rowSpan={rowSpan}>
          {owner.startTime}
        </td>
        {commonCells(owner)}
      </tr>
      {impacted.map((r) => (
        <tr
          key={r.id}
          style={{
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "rgba(15, 23, 42, 0.025)",
          }}
        >
          <td
            style={{
              padding: "10px 12px 10px 20px",
              color: "var(--color-text-secondary)",
              borderLeft: "3px solid rgba(235, 89, 40, 0.35)",
            }}
          >
            {r.service}
          </td>
          <td style={{ padding: "10px 12px", color: "var(--color-text-muted)", fontWeight: 600 }}>{r.role}</td>
          <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", fontFamily: "ui-monospace, monospace" }}>
            {r.aideId}
          </td>
          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.incidentId}</td>
          <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.changeId}</td>
          <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
            <Link to="/history" style={{ color: "#EB5928", fontWeight: 600, textDecoration: "none" }}>
              {r.historyLabel}
            </Link>
          </td>
        </tr>
      ))}
    </>
  );
}
