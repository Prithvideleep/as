import type { TopologyData } from "../../data/mockData";

const stats = (data: TopologyData) => [
  { label: "Total Nodes",  value: data.nodes.length,                                         color: "var(--color-text-primary)" },
  { label: "Root Cause",   value: data.nodes.filter((n) => n.status === "root").length,      color: "#EF4444" },
  { label: "Impacted",     value: data.nodes.filter((n) => n.status === "impacted").length,  color: "#F97316" },
  { label: "Healthy",      value: data.nodes.filter((n) => n.status === "healthy").length,   color: "#22C55E" },
  { label: "Dependencies", value: data.edges.length,                                         color: "var(--color-text-secondary)" },
];

export default function TopologyStatsBar({ data }: { data: TopologyData }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      {stats(data).map((s) => (
        <div
          key={s.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 16px",
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            minWidth: 110,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
            {s.value}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-muted)", lineHeight: 1.3 }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
