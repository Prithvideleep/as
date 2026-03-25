import { motion } from "framer-motion";
import { Crosshair, ChevronDown, FlaskConical } from "lucide-react";
import { useState } from "react";
import type { RootCause } from "../../data/mockData";

const RANK_LABELS = ["Primary Hypothesis", "Secondary Hypothesis", "Alternative Hypothesis"];
const RANK_BORDER = ["rgba(239,68,68,0.25)", "rgba(249,115,22,0.18)", "rgba(107,114,128,0.15)"];
const RANK_BAR    = ["#EF4444", "#F97316", "#6B7280"];
const RANK_TEXT   = ["#EF4444", "#F97316", "#6B7280"];

export default function RootCausePanel({ rootCauses }: { rootCauses: RootCause[] }) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? rootCauses : rootCauses.slice(0, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 16,
        padding: "18px 20px",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Crosshair style={{ width: 15, height: 15, color: "var(--color-text-muted)", flexShrink: 0 }} />
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", flex: 1 }}>
          Root Cause Analysis
        </h2>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {rootCauses.length} {rootCauses.length === 1 ? "hypothesis" : "hypotheses"}
        </span>
      </div>

      {/* Indicative placeholder notice */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 7,
          padding: "8px 10px",
          borderRadius: 8,
          backgroundColor: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.22)",
          marginBottom: 14,
        }}
      >
        <FlaskConical style={{ width: 12, height: 12, color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          <strong style={{ color: "#F59E0B" }}>Indicative only</strong> — full root cause analysis
          requires enriched data pipeline integration (Phase 2).
        </span>
      </div>

      {/* Hypothesis cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((rc, i) => {
          const isFirst = i === 0;
          return (
            <motion.div
              key={rc.service}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              style={{
                borderRadius: 12,
                border: `1.5px solid ${RANK_BORDER[i] ?? RANK_BORDER[2]}`,
                backgroundColor: isFirst ? "rgba(239,68,68,0.04)" : "transparent",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: RANK_TEXT[i] ?? RANK_TEXT[2], backgroundColor: `${RANK_BAR[i] ?? RANK_BAR[2]}18`, padding: "2px 8px", borderRadius: 999 }}>
                  {RANK_LABELS[i] ?? `Hypothesis ${i + 1}`}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: RANK_TEXT[i] ?? RANK_TEXT[2], marginLeft: "auto" }}>
                  {rc.confidence}% confidence
                </span>
              </div>

              {/* Confidence bar */}
              <div style={{ height: 4, borderRadius: 4, backgroundColor: "var(--color-border)", marginBottom: 10, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rc.confidence}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 4, backgroundColor: RANK_BAR[i] ?? RANK_BAR[2] }}
                />
              </div>

              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 8 }}>
                {rc.description}
              </p>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Service:{" "}
                <span style={{ fontWeight: 600, color: RANK_TEXT[i] ?? RANK_TEXT[2] }}>{rc.service}</span>
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Show more / less toggle */}
      {rootCauses.length > 1 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            marginTop: 12, background: "transparent", border: "none",
            cursor: "pointer", fontSize: 12, fontWeight: 500,
            color: "var(--color-text-muted)", padding: "4px 0",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)")}
        >
          <ChevronDown style={{ width: 13, height: 13, transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          {showAll
            ? "Show only primary hypothesis"
            : `Show ${rootCauses.length - 1} alternative ${rootCauses.length - 1 === 1 ? "hypothesis" : "hypotheses"}`}
        </button>
      )}
    </motion.div>
  );
}
