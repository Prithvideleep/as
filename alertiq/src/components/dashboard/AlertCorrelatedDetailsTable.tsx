import { useMemo, useCallback, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import type { CorrelationCluster, Incident, IncidentDetail } from "../../data/mockData";
import {
  buildCorrelatedDetailGroups,
  buildInactiveCorrelatedDetailGroups,
  flattenGroupsForCsv,
  correlatedRowsToCsv,
  getImpactedRowsForSelection,
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

const SAMPLE_SIZE = 10;

/** Deterministic shuffle from membership so the same pool doesn’t reshuffle every render. */
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

  const activeGroups = useMemo(
    () => buildCorrelatedDetailGroups(clusters, incidentsById, incidentDetails),
    [clusters, incidentsById, incidentDetails]
  );

  const inactiveGroups = useMemo(
    () => buildInactiveCorrelatedDetailGroups(incidents, incidentDetails),
    [incidents, incidentDetails]
  );

  const allGroups = useMemo(() => [...activeGroups, ...inactiveGroups], [activeGroups, inactiveGroups]);

  const groupsSignature = useMemo(() => allGroups.map((g) => g.incidentId).sort().join("|"), [allGroups]);

  const displayedGroups = useMemo(
    () => sampleRandomGroups(allGroups, SAMPLE_SIZE),
    [allGroups, groupsSignature]
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

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={LABEL}>Alert correlated details</span>
          <p style={HINT}>
            Showing a <strong style={{ color: "var(--color-text-secondary)" }}>random sample of up to {SAMPLE_SIZE}</strong>{" "}
            owner groups (refreshes when the incident set changes). Use <strong style={{ color: "var(--color-text-secondary)" }}>State</strong>{" "}
            for Active (green) vs Inactive (grey).             Expand an Active row to see <strong style={{ color: "var(--color-text-secondary)" }}>all</strong> impacted
            services from the mock blast-radius list; use{" "}
            <strong style={{ color: "var(--color-text-secondary)" }}>Open investigation</strong> or click{" "}
            <strong style={{ color: "var(--color-text-secondary)" }}>Associated Incident #</strong> to open that incident in
            Investigation. <strong style={{ color: "var(--color-text-secondary)" }}>History</strong> goes to the resolution log.
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
        {empty ? (
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
              {displayedGroups.map((group, idx) => (
                <GroupRows
                  key={group.incidentId}
                  group={group}
                  displayNo={idx + 1}
                  expanded={expanded.has(group.incidentId)}
                  onToggle={() => toggleGroup(group.incidentId)}
                  allowImpactedPicker={group.owner.state === "Active"}
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
  allowImpactedPicker,
}: {
  group: CorrelatedDetailGroup;
  displayNo: number;
  expanded: boolean;
  onToggle: () => void;
  allowImpactedPicker: boolean;
}) {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  const openInvestigation = useCallback(() => {
    setSelectedIncidentId(group.incidentId);
    navigate("/investigation");
  }, [group.incidentId, navigate, setSelectedIncidentId]);

  const { owner } = group;
  const impacted = useMemo(() => {
    if (!allowImpactedPicker) return [];
    return getImpactedRowsForSelection(group, undefined);
  }, [group, allowImpactedPicker]);

  const hasExpandable = allowImpactedPicker && impacted.length > 0;
  const actionRowCount = expanded && hasExpandable ? 1 : 0;
  const rowSpan = 1 + actionRowCount + impacted.length;

  const stateColor = owner.state === "Active" ? "#16A34A" : "var(--color-text-muted)";
  const ownerBg =
    owner.state === "Active" ? "rgba(34, 197, 94, 0.07)" : "rgba(100, 116, 139, 0.09)";

  const ownerRowStyle: CSSProperties = {
    borderBottom: "1px solid var(--color-border)",
    backgroundColor: ownerBg,
    cursor: hasExpandable ? "pointer" : "default",
  };

  const incidentButtonStyle: CSSProperties = {
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

  const commonCells = (r: CorrelatedDetailRow) => (
    <>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.service}</td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-muted)", fontWeight: 600 }}>{r.role}</td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", fontFamily: "ui-monospace, monospace" }}>
        {r.aideId}
      </td>
      <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={openInvestigation} style={incidentButtonStyle} title="Open in Investigation">
          {r.incidentId}
        </button>
      </td>
      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.changeId}</td>
      <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
        <Link to="/history" style={{ color: "#EB5928", fontWeight: 600, textDecoration: "none" }}>
          {r.historyLabel}
        </Link>
      </td>
    </>
  );

  if (!hasExpandable || !expanded) {
    return (
      <tr
        style={ownerRowStyle}
        onClick={hasExpandable ? onToggle : undefined}
        onKeyDown={
          hasExpandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle();
                }
              }
            : undefined
        }
        tabIndex={hasExpandable ? 0 : undefined}
        aria-expanded={hasExpandable ? expanded : undefined}
      >
        <td style={{ padding: "10px 12px", fontWeight: 700, verticalAlign: "middle" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {hasExpandable ? (
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
      <tr
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "rgba(15, 23, 42, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <td colSpan={6} style={{ padding: "10px 14px 10px 20px", verticalAlign: "middle" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openInvestigation();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                backgroundColor: "#EB5928",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Open investigation
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
            <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              All impacted services from blast radius (mock) are listed below.
            </span>
          </div>
        </td>
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
          <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={openInvestigation} style={incidentButtonStyle} title="Open in Investigation">
              {r.incidentId}
            </button>
          </td>
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
