import { motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import type { RootCause } from "../../data/mockData";

export default function RootCausePanel({ rootCause }: { rootCause: RootCause }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 16,
        padding: "20px 24px",
        border: "1px solid rgba(239,68,68,0.30)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 20px rgba(239,68,68,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Crosshair style={{ width: 18, height: 18, color: "#EF4444" }} />
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>
          Root Cause
        </h2>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: "rgba(239,68,68,0.15)",
            color: "#EF4444",
          }}
        >
          {rootCause.confidence}% confidence
        </span>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 10 }}>
        {rootCause.description}
      </p>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
        Service:{" "}
        <span style={{ color: "#EF4444", fontWeight: 600 }}>{rootCause.service}</span>
      </p>
    </motion.div>
  );
}
