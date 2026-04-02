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
  incidentId: string;
  owner: CorrelatedDetailRow;
  impacted: CorrelatedDetailRow[];
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

/** Shorter time for dense table (mock shows 02:20:15 style when possible) */
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

/**
 * Correlation clusters → owner row + impacted rows per cluster (data for grouped table).
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

    const impacted: CorrelatedDetailRow[] = [];
    const seen = new Set<string>([primaryService]);
    for (const br of c.impactedL1) {
      if (seen.has(br.service)) continue;
      seen.add(br.service);
      impacted.push({
        id: `${c.incidentId}-imp-${br.service}`,
        state,
        alertName: "",
        startTime: "",
        endTime: "",
        service: br.service,
        role: "Impacted",
        incidentId: ticketId,
        changeId,
        aideId: mockAideId(br.service, c.incidentId),
        historyLabel,
      });
    }

    groups.push({ incidentId: c.incidentId, owner, impacted });
  }

  return groups;
}

/** Flat list for CSV (owner then each impacted). */
export function flattenGroupsForCsv(groups: CorrelatedDetailGroup[]): CorrelatedDetailRow[] {
  const out: CorrelatedDetailRow[] = [];
  for (const g of groups) {
    out.push(g.owner);
    out.push(...g.impacted);
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
