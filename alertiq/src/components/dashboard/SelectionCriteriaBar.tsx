import { type CSSProperties, type ReactNode } from "react";
import { RefreshCw, Clock, SlidersHorizontal } from "lucide-react";

const timeInputStyle: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-secondary)",
  fontSize: 11,
};

export default function SelectionCriteriaBar({
  optionalDate,
  onOptionalDateChange,
  timeWindowSelect,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onRefresh,
  trailingControls,
}: {
  optionalDate: string;
  onOptionalDateChange: (isoDate: string) => void;
  timeWindowSelect: ReactNode;
  startTime: string;
  endTime: string;
  onStartTimeChange: (hhmm: string) => void;
  onEndTimeChange: (hhmm: string) => void;
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
            style={timeInputStyle}
          />
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            paddingLeft: 4,
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)" }} aria-hidden />
            {timeWindowSelect}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>
            Range
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
            <span style={{ fontWeight: 600 }}>Start</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              aria-label="Start time"
              style={timeInputStyle}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
            <span style={{ fontWeight: 600 }}>End</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              aria-label="End time"
              style={timeInputStyle}
            />
          </label>
        </div>
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
