import type { CorrelationCluster, Incident, IncidentDetail } from "../../data/mockData";

export type CorrelatedDetailRow = {
  id: string;
  state: "Active" | "Inactive";
  alertName: string;
  startTime: string;
  endTime: string;
  service: string;
  role: "Owner" | "Impacted";
  incidentId: string;
  changeId: string;
  /** Mock app / AIDE-style identifier */
  aideId: string;
  historyLabel: string;
};

export type CorrelatedDetailGroup = {
  /** Internal id, e.g. CL-001 */
  incidentId: string;
  owner: CorrelatedDetailRow;
  /** All impacted service names (mock: blast radius + L1 — Phase 2: CMDB). */
  impactedServiceOptions: string[];
};

function formatCellTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function mockChangeId(incidentId: string): string {
  const n = incidentId.replace(/\D/g, "") || "0";
  return `CHG-${n.padStart(4, "0")}`;
}

function mockAideId(service: string, incidentId: string): string {
  const compact = service.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "APP";
  const num = incidentId.replace(/\D/g, "") || "0";
  return `${compact}${num.padStart(4, "0")}`;
}

function mockHistoryLabel(incidentId: string): string {
  const n = incidentId.replace(/\D/g, "") || "0";
  return `Alert No ${n}`;
}

function incidentTicketId(incidentId: string): string {
  const n = incidentId.replace(/\D/g, "") || "0";
  return `INC${n.padStart(4, "0")}`;
}

export function makeImpactedRows(
  internalIncidentId: string,
  owner: CorrelatedDetailRow,
  services: string[]
): CorrelatedDetailRow[] {
  return services.map((service) => ({
    id: `${internalIncidentId}-imp-${service}`,
    state: owner.state,
    alertName: "",
    startTime: "",
    endTime: "",
    service,
    role: "Impacted" as const,
    incidentId: owner.incidentId,
    changeId: owner.changeId,
    aideId: mockAideId(service, internalIncidentId),
    historyLabel: owner.historyLabel,
  }));
}

/**
 * Correlation clusters → owner + impacted service options (for dropdown / checkboxes).
 */
export function buildCorrelatedDetailGroups(
  clusters: CorrelationCluster[],
  incidentsById: Record<string, Incident>,
  detailsById: Record<string, IncidentDetail | undefined>
): CorrelatedDetailGroup[] {
  const groups: CorrelatedDetailGroup[] = [];

  for (const c of clusters) {
    const inc = incidentsById[c.incidentId];
    const detail = detailsById[c.incidentId];
    const state: "Active" | "Inactive" = inc?.status === "resolved" ? "Inactive" : "Active";
    const firstAlert = c.relatedAlerts[0];
    const alertName = firstAlert?.title ?? c.incidentName;
    const startIso = firstAlert?.timestamp ?? inc?.timestamp ?? "";
    const endIso =
      c.relatedAlerts.length > 1
        ? c.relatedAlerts[c.relatedAlerts.length - 1]!.timestamp
        : startIso;

    const primaryService =
      c.impactedL1[0]?.service ?? detail?.blastRadius[0]?.service ?? "—";

    const changeId = mockChangeId(c.incidentId);
    const ticketId = incidentTicketId(c.incidentId);
    const historyLabel = mockHistoryLabel(c.incidentId);

    const owner: CorrelatedDetailRow = {
      id: `${c.incidentId}-owner`,
      state,
      alertName,
      startTime: formatShortTime(startIso),
      endTime: formatCellTime(endIso || startIso),
      service: primaryService,
      role: "Owner",
      incidentId: ticketId,
      changeId,
      aideId: mockAideId(primaryService, c.incidentId),
      historyLabel,
    };

    const fromBlast = detail?.blastRadius.map((b) => b.service) ?? [];
    const fromL1 = c.impactedL1.map((b) => b.service);
    const impactedServiceOptions = [...new Set([...fromBlast, ...fromL1])]
      .filter((s) => s && s !== "—")
      .sort((a, b) => a.localeCompare(b));

    groups.push({
      incidentId: c.incidentId,
      owner,
      impactedServiceOptions,
    });
  }

  return groups;
}

/**
 * Resolved incidents as correlated-style owner rows only (no CMDB / impacted picker in UI).
 */
export function buildInactiveCorrelatedDetailGroups(
  incidents: Incident[],
  detailsById: Record<string, IncidentDetail | undefined>
): CorrelatedDetailGroup[] {
  const list = incidents.filter((i) => i.status === "resolved" && detailsById[i.id]);
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return list.map((inc) => {
    const detail = detailsById[inc.id]!;
    const firstAlert = detail.timeline.find((t) => t.type === "alert" || t.type === "anomaly");
    const alertName = firstAlert?.title ?? inc.name;
    const startRaw = firstAlert?.timestamp ?? inc.timestamp;
    const startIso = /^\d{4}-\d{2}-\d{2}/.test(startRaw) ? startRaw : inc.timestamp;
    const primaryService = detail.blastRadius[0]?.service ?? "—";
    const changeId = mockChangeId(inc.id);
    const ticketId = incidentTicketId(inc.id);
    const historyLabel = mockHistoryLabel(inc.id);

    const owner: CorrelatedDetailRow = {
      id: `${inc.id}-owner`,
      state: "Inactive",
      alertName,
      startTime: formatShortTime(startIso),
      endTime: formatCellTime(inc.timestamp),
      service: primaryService,
      role: "Owner",
      incidentId: ticketId,
      changeId,
      aideId: mockAideId(primaryService, inc.id),
      historyLabel,
    };

    return {
      incidentId: inc.id,
      owner,
      impactedServiceOptions: [],
    };
  });
}

function impactedServicesForGroup(g: CorrelatedDetailGroup, ownerSvc: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const s of g.impactedServiceOptions) {
    if (!s || s === "—" || s === ownerSvc) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    ordered.push(s);
  }
  return ordered;
}

/**
 * Impacted rows for a group. When `selected` is omitted, every service in `impactedServiceOptions`
 * (mock: full blast radius / CMDB list) is shown except the owner primary.
 */
export function getImpactedRowsForSelection(
  g: CorrelatedDetailGroup,
  selected: Set<string> | undefined
): CorrelatedDetailRow[] {
  const ownerSvc = g.owner.service;
  const services =
    selected === undefined
      ? impactedServicesForGroup(g, ownerSvc)
      : g.impactedServiceOptions.filter((s) => selected.has(s) && s !== ownerSvc);
  return makeImpactedRows(g.incidentId, g.owner, services);
}

export function flattenGroupsForCsv(
  groups: CorrelatedDetailGroup[],
  selectedByIncident: Record<string, Set<string>>
): CorrelatedDetailRow[] {
  const out: CorrelatedDetailRow[] = [];
  for (const g of groups) {
    out.push(g.owner);
    out.push(...getImpactedRowsForSelection(g, selectedByIncident[g.incidentId]));
  }
  return out;
}

export function correlatedRowsToCsv(rows: CorrelatedDetailRow[]): string {
  const header = [
    "No",
    "State",
    "Alert",
    "Start",
    "End",
    "Service",
    "Role",
    "AIDE ID",
    "Incident",
    "Change",
    "History",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r, i) =>
      [
        String(i + 1),
        r.state,
        csvEscape(r.alertName),
        csvEscape(r.startTime),
        csvEscape(r.endTime),
        csvEscape(r.service),
        r.role,
        csvEscape(r.aideId),
        r.incidentId,
        r.changeId,
        csvEscape(r.historyLabel),
      ].join(",")
    ),
  ];
  return lines.join("\r\n");
}

function csvEscape(s: string): string {
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
