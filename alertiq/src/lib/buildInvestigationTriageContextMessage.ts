import type { IncidentDetail } from "../data/mockData";

/** Rich context string when opening Triage from the active investigation. */
export function buildInvestigationTriageContextMessage(incident: IncidentDetail): string {
  const primary = incident.rootCauses[0];
  const impacted = incident.blastRadius
    .filter((b) => b.severity === "critical" || b.severity === "high")
    .map((b) => b.service)
    .join(", ");

  return (
    `I'm investigating incident ${incident.id}: "${incident.name}" (${incident.severity} severity, status: ${incident.status}).\n\n` +
    `Primary root cause: ${primary.service} — ${primary.description} (${primary.confidence}% confidence)\n\n` +
    `Critically/highly impacted services: ${impacted || "none identified yet"}.\n\n` +
    `Summary: ${incident.summary}\n\n` +
    `What are the recommended next steps to resolve this?`
  );
}
