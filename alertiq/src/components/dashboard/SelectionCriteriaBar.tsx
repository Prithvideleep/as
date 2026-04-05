import { type ReactNode } from "react";
import { RefreshCw, Clock, SlidersHorizontal } from "lucide-react";

export default function SelectionCriteriaBar({
  optionalDate,
  onOptionalDateChange,
  timeWindowSelect,
  scopePlaceholder,
  onRefresh,
  trailingControls,
}: {
  optionalDate: string;
  onOptionalDateChange: (isoDate: string) => void;
  timeWindowSelect: ReactNode;
  scopePlaceholder?: ReactNode;
  onRefresh: () => void;
  trailingControls?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
        marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: "1 1 auto" }}>
        <SlidersHorizontal style={{ width: 14, height: 14, color: "var(--color-text-muted)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)" }}>Selection criteria</span>
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Applies to all tiles on the overview.
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
          <span style={{ fontWeight: 600 }}>Date</span>
          <input
            type="date"
            value={optionalDate}
            onChange={(e) => onOptionalDateChange(e.target.value)}
            style={{
              padding: "5px 8px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-primary)",
              color: "var(--color-text-secondary)",
              fontSize: 11,
            }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)" }} aria-hidden />
          {timeWindowSelect}
        </div>
        {scopePlaceholder}
        <button
          type="button"
          onClick={onRefresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-primary)",
            color: "var(--color-text-secondary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} />
          Refresh
        </button>
        {trailingControls}
      </div>
    </div>
  );
}
