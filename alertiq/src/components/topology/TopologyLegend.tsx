const statusItems = [
  { color: "#EF4444", label: "Root Cause" },
  { color: "#F97316", label: "Impacted"   },
  { color: "#22C55E", label: "Healthy"    },
];

const edgeItems = [
  { color: "#6B7280", label: "Dependency",    dashed: false },
  { color: "#EB5928", label: "Data Flow",     dashed: true  },
  { color: "#3B82F6", label: "Communication", dashed: false },
];

export default function TopologyLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        alignItems: "center",
        padding: "10px 14px",
        backgroundColor: "#1A1A26",
        borderTop: "1px solid #2D2D3A",
        borderRadius: "0 0 12px 12px",
      }}
    >
      {/* Status row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
          Status
        </span>
        {statusItems.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}88` }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, backgroundColor: "#2D2D3A" }} />

      {/* Edge type row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)" }}>
          Edge Type
        </span>
        {edgeItems.map((e) => (
          <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="22" height="8" style={{ flexShrink: 0 }}>
              <line
                x1="0" y1="4" x2="18" y2="4"
                stroke={e.color}
                strokeWidth="1.8"
                strokeDasharray={e.dashed ? "3,2" : undefined}
              />
              <polygon points="16,1 22,4 16,7" fill={e.color} />
            </svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
