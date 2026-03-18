import type { Severity } from "../../data/mockData";

const config: Record<Severity, { bg: string; color: string; label: string }> = {
  critical: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "Critical" },
  high:     { bg: "rgba(249,115,22,0.15)", color: "#F97316", label: "High" },
  medium:   { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Medium" },
  low:      { bg: "rgba(34,197,94,0.15)",  color: "#22C55E", label: "Low" },
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const c = config[severity];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
