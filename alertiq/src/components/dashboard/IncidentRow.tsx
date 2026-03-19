import { motion } from "framer-motion";
import { AlertTriangle, Server, Clock, AlertCircle, Search, CheckCircle, ChevronRight } from "lucide-react";
import type { Incident } from "../../data/mockData";

const severityColor: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; bg: string }> = {
  active:        { icon: AlertCircle, color: "#EF4444", bg: "rgba(239,68,68,0.10)"  },
  investigating: { icon: Search,      color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  resolved:      { icon: CheckCircle, color: "#22C55E", bg: "rgba(34,197,94,0.10)"  },
};

interface Props {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export default function IncidentRow({ incident, isSelected, onClick, index }: Props) {
  const sc = statusConfig[incident.status] ?? statusConfig.active;
  const StatusIcon = sc.icon;
  const dot = severityColor[incident.severity];
  const time = new Date(incident.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const isResolved = incident.status === "resolved";

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 14px",
        textAlign: "left",
        background: isSelected ? "rgba(235,89,40,0.04)" : "transparent",
        border: "none",
        borderBottom: "1px solid var(--color-border)",
        borderLeft: `3px solid ${isSelected ? "#EB5928" : dot}`,
        cursor: "pointer",
        opacity: isResolved ? 0.65 : 1,
        transition: "background-color 0.12s, opacity 0.15s",
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
    >
      {/* Severity dot */}
      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot, flexShrink: 0, boxShadow: isResolved ? "none" : `0 0 5px ${dot}80` }} />

      {/* ID */}
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 52 }}>
        {incident.id}
      </span>

      {/* Name */}
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {incident.name}
      </span>

      {/* Status badge */}
      <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, backgroundColor: sc.bg, color: sc.color, flexShrink: 0, textTransform: "capitalize" }}>
        <StatusIcon style={{ width: 9, height: 9 }} />
        {incident.status}
      </span>

      {/* Stats */}
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 68 }}>
        <AlertTriangle style={{ width: 10, height: 10 }} />
        {incident.alertCount}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 60 }}>
        <Server style={{ width: 10, height: 10 }} />
        {incident.impactedServices}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0, minWidth: 44 }}>
        <Clock style={{ width: 10, height: 10 }} />
        {time}
      </span>

      <ChevronRight style={{ width: 13, height: 13, color: "var(--color-text-muted)", flexShrink: 0 }} />
    </motion.button>
  );
}
