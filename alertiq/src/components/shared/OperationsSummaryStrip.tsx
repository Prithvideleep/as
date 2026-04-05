import type { ReactNode } from "react";

export type SummaryMetric = {
  label: string;
  value: ReactNode;
  sublabel?: string;
};

/**
 * Fills the horizontal band under operational page headers with KPI-style tiles.
 */
export default function OperationsSummaryStrip({ items }: { items: SummaryMetric[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(152px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            padding: "14px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minHeight: 88,
            justifyContent: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.value}
          </span>
          {item.sublabel ? (
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.35, marginTop: 2 }}>
              {item.sublabel}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
