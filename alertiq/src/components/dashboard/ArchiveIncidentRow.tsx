import { motion } from "framer-motion";
import { AlertTriangle, Server, Clock, ChevronRight } from "lucide-react";
import type { Incident, IncidentDetail } from "../../data/mockData";

const severityColor: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ArchiveIncidentRow({
  incident,
  detail,
  onClick,
  index,
}: {
  incident: Incident;
  detail?: IncidentDetail;
  onClick: () => void;
  index: number;
}) {
  const dot = severityColor[incident.severity] ?? "#6B7280";
  const resolution = detail?.resolutionSummary ?? "No resolution summary recorded yet.";

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 8,
        width: "100%",
        padding: "12px 14px",
        textAlign: "left",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid var(--color-border)",
        borderLeft: `3px solid ${dot}`,
        cursor: "pointer",
        transition: "background-color 0.12s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 56 }}>
          {incident.id}
        </span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {incident.name}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", minWidth: 70 }}>
            <AlertTriangle style={{ width: 10, height: 10 }} />
            {incident.alertCount}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", minWidth: 70 }}>
            <Server style={{ width: 10, height: 10 }} />
            {incident.impactedServices}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", minWidth: 130 }}>
            <Clock style={{ width: 10, height: 10 }} />
            {formatDate(incident.timestamp)}
          </span>
          <ChevronRight style={{ width: 14, height: 14, color: "var(--color-text-muted)" }} />
        </span>
      </div>

      {/* Resolution preview */}
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.55, paddingLeft: 76 }}>
        <span style={{ fontWeight: 700, color: "var(--color-text-muted)", marginRight: 6 }}>Resolution:</span>
        {resolution}
      </div>
    </motion.button>
  );
}

