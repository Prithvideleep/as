import { motion } from "framer-motion";
import { History, CheckCircle2 } from "lucide-react";
import type { HistoricalRef } from "../../data/mockData";

function similarityColor(pct: number): { bar: string; text: string; bg: string } {
  if (pct >= 80) return { bar: "#EF4444", text: "#EF4444", bg: "rgba(239,68,68,0.10)" };
  if (pct >= 60) return { bar: "#F97316", text: "#F97316", bg: "rgba(249,115,22,0.09)" };
  return { bar: "#F59E0B", text: "#F59E0B", bg: "rgba(245,158,11,0.09)" };
}

export default function HistoricalRefPanel({ refs }: { refs: HistoricalRef[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 16,
        padding: "20px 24px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <History style={{ width: 17, height: 17, color: "var(--color-accent)", flexShrink: 0 }} />
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", flex: 1 }}>
          Similar Past Incidents
        </h2>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          {refs.length} {refs.length === 1 ? "match" : "matches"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {refs.map((ref, i) => {
          const sc = similarityColor(ref.similarity);
          return (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              style={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                padding: "14px 16px",
                backgroundColor: "var(--color-hover-bg)",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ref.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{ref.id}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{ref.date}</span>
                  </div>
                </div>

                {/* Similarity badge */}
                <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, backgroundColor: sc.bg, color: sc.text, flexShrink: 0 }}>
                  {ref.similarity}% similar
                </span>
              </div>

              {/* Similarity bar */}
              <div style={{ height: 3, borderRadius: 3, backgroundColor: "var(--color-border)", marginBottom: 12, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ref.similarity}%` }}
                  transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 3, backgroundColor: sc.bar }}
                />
              </div>

              {/* Resolution */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <CheckCircle2 style={{ width: 13, height: 13, color: "#22C55E", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#22C55E", marginRight: 6 }}>
                    Resolution:
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    {ref.resolution}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
