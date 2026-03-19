import { motion } from "framer-motion";
import { Zap, AlertOctagon } from "lucide-react";
import type { BlastRadiusItem, Severity } from "../../data/mockData";

const SEV_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const sevStyle: Record<Severity, { badge: string; badgeBg: string; rowBg: string; rowBorder: string }> = {
  critical: { badge: "#EF4444", badgeBg: "rgba(239,68,68,0.15)", rowBg: "rgba(239,68,68,0.06)", rowBorder: "rgba(239,68,68,0.22)" },
  high:     { badge: "#F97316", badgeBg: "rgba(249,115,22,0.13)", rowBg: "rgba(249,115,22,0.05)", rowBorder: "rgba(249,115,22,0.18)" },
  medium:   { badge: "#F59E0B", badgeBg: "rgba(245,158,11,0.13)", rowBg: "var(--color-hover-bg)",              rowBorder: "transparent" },
  low:      { badge: "#22C55E", badgeBg: "rgba(34,197,94,0.13)",  rowBg: "var(--color-hover-bg)",              rowBorder: "transparent" },
};

export default function BlastRadiusPanel({ items }: { items: BlastRadiusItem[] }) {
  const sorted = [...items].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  const criticalCount = sorted.filter((i) => i.severity === "critical").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 16,
        padding: "20px 24px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap style={{ width: 17, height: 17, color: "#F97316", flexShrink: 0 }} />
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", flex: 1 }}>
          Blast Radius
        </h2>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {sorted.length} services
        </span>
        {criticalCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#EF4444", backgroundColor: "rgba(239,68,68,0.12)", padding: "2px 9px", borderRadius: 999 }}>
            <AlertOctagon style={{ width: 10, height: 10 }} />
            {criticalCount} critical
          </span>
        )}
      </div>

      {/* Service list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((item, i) => {
          const s = sevStyle[item.severity];
          return (
            <motion.div
              key={item.service}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                backgroundColor: s.rowBg,
                border: `1px solid ${s.rowBorder}`,
              }}
            >
              {/* Left severity stripe */}
              <span style={{ width: 3, height: 28, borderRadius: 3, backgroundColor: s.badge, flexShrink: 0 }} />

              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", flex: "0 0 160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.service}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.impact}
              </span>
              <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, backgroundColor: s.badgeBg, color: s.badge, flexShrink: 0, textTransform: "capitalize" }}>
                {item.severity}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
