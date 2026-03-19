import { motion } from "framer-motion";
import { AlertTriangle, Clock, Server, AlertCircle, Search, CheckCircle } from "lucide-react";
import type { Incident } from "../../data/mockData";
import SeverityBadge from "../shared/SeverityBadge";

const severityBorder: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; bg: string; label: string }> = {
  active:        { icon: AlertCircle, color: "#EF4444", bg: "rgba(239,68,68,0.12)",  label: "Active"        },
  investigating: { icon: Search,      color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Investigating" },
  resolved:      { icon: CheckCircle, color: "#22C55E", bg: "rgba(34,197,94,0.12)",  label: "Resolved"      },
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
  const sc = statusConfig[incident.status] ?? statusConfig.active;
  const StatusIcon = sc.icon;
  const isResolved = incident.status === "resolved";

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
        opacity: isResolved ? 0.7 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s, opacity 0.15s",
      }}
    >
      {/* Top row: name + severity + status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.4, flex: 1 }}>
          {incident.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Status badge */}
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 999,
            fontSize: 10, fontWeight: 700,
            backgroundColor: sc.bg, color: sc.color,
            textTransform: "capitalize",
          }}>
            <StatusIcon style={{ width: 9, height: 9 }} />
            {sc.label}
          </span>
          <SeverityBadge severity={incident.severity} />
        </div>
      </div>

      {/* Bottom row: alerts + impacted services + time */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)" }}>
          <AlertTriangle style={{ width: 11, height: 11 }} />
          {incident.alertCount} alerts
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)" }}>
          <Server style={{ width: 11, height: 11 }} />
          {incident.impactedServices} services
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-muted)", marginLeft: "auto" }}>
          <Clock style={{ width: 11, height: 11 }} />
          {time}
        </span>
      </div>
    </motion.button>
  );
}
