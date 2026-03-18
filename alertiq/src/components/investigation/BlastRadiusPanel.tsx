import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { BlastRadiusItem } from "../../data/mockData";
import SeverityBadge from "../shared/SeverityBadge";

export default function BlastRadiusPanel({ items }: { items: BlastRadiusItem[] }) {
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Zap style={{ width: 17, height: 17, color: "#F97316" }} />
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>
          Blast Radius
        </h2>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {items.length} services
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <motion.div
            key={item.service}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              backgroundColor: "var(--color-hover-bg)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.service}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", flex: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.impact}
            </span>
            <SeverityBadge severity={item.severity} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
