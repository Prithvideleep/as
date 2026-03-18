import { motion } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";
import type { Incident } from "../../data/mockData";
import SeverityBadge from "../shared/SeverityBadge";

const severityBorder: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
  isSelected: boolean;
}

export default function IncidentCard({ incident, onClick, isSelected }: IncidentCardProps) {
  const time = new Date(incident.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const border = severityBorder[incident.severity];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, y: -1 }}
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        backgroundColor: isSelected ? "rgba(235,89,40,0.04)" : "var(--color-bg-card)",
        borderRadius: 12,
        padding: "14px 16px",
        border: `1px solid ${isSelected ? "rgba(235,89,40,0.45)" : "var(--color-border)"}`,
        borderLeft: `4px solid ${border}`,
        cursor: "pointer",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(235,89,40,0.08), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        display: "block",
        transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4, flex: 1 }}>
          {incident.name}
        </h3>
        <SeverityBadge severity={incident.severity} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)" }}>
          <AlertTriangle style={{ width: 11, height: 11 }} />
          {incident.alertCount} alerts
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)" }}>
          <Clock style={{ width: 11, height: 11 }} />
          {time}
        </span>
      </div>
    </motion.button>
  );
}
