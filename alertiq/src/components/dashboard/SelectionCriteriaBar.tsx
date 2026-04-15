import { type CSSProperties, type ReactNode, useMemo } from "react";
import { RefreshCw, Clock, SlidersHorizontal } from "lucide-react";

function randomTime(minHour = 0, maxHour = 23): string {
  const h = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
  const m = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const inputStyle: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-muted)",
  fontSize: 11,
  minWidth: 90,
  outline: "none",
};

const dateInputStyle: CSSProperties = {
  ...inputStyle,
  color: "var(--color-text-secondary)",
};

export default function SelectionCriteriaBar({
  optionalDate,
  onOptionalDateChange,
  timeWindowSelect,
  onRefresh,
  trailingControls,
}: {
  optionalDate: string;
  onOptionalDateChange: (isoDate: string) => void;
  timeWindowSelect: ReactNode;
  onRefresh: () => void;
  trailingControls?: ReactNode;
}) {
  const startTime = useMemo(() => randomTime(0, 11), []);
  const endTime   = useMemo(() => randomTime(12, 23), []);

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
        {/* Date */}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
          <span style={{ fontWeight: 600 }}>Date</span>
          <input
            type="date"
            value={optionalDate}
            onChange={(e) => onOptionalDateChange(e.target.value)}
            style={dateInputStyle}
          />
        </label>

        {/* Time section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            paddingLeft: 8,
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          {/* Time window dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)" }} aria-hidden />
            {timeWindowSelect}
          </div>

          {/* Start time */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
            <span style={{ fontWeight: 600 }}>Start time</span>
            <input
              type="text"
              readOnly
              value={startTime}
              style={{ ...inputStyle, color: "var(--color-text-secondary)" }}
            />
          </label>

          {/* End time */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
            <span style={{ fontWeight: 600 }}>End time</span>
            <input
              type="text"
              readOnly
              value={endTime}
              style={{ ...inputStyle, color: "var(--color-text-secondary)" }}
            />
          </label>
        </div>

        {/* Refresh */}
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
