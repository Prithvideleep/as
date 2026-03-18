import type { IncidentDetail } from "../../data/mockData";
import IncidentSelector from "../shared/IncidentSelector";

export default function IncidentHeader({ incident }: { incident: IncidentDetail }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          Incident
        </span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{incident.id}</span>
      </div>
      <IncidentSelector />
    </div>
  );
}
