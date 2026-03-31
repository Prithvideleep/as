import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function SummaryPanel({ summary }: { summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        padding: "18px 22px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: "rgba(235,89,40,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText style={{ width: 14, height: 14, color: "#EB5928" }} />
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
          Incident summary
        </h2>
      </div>
      <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: "0 0 8px", fontStyle: "italic" }}>
        AI-assisted narrative for operators — confirm against signals and runbooks.
      </p>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{summary}</p>
    </motion.div>
  );
}
