import { useState, useRef, useEffect } from "react";
import { ChevronDown, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { incidents } from "../../data/mockData";

const ACCENT = "#EB5928";

const severityColor: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  medium:   "#F59E0B",
  low:      "#22C55E",
};

const statusMeta = {
  active:        { icon: AlertTriangle, color: "#EF4444" },
  investigating: { icon: Search,        color: "#F59E0B" },
  resolved:      { icon: CheckCircle,   color: "#22C55E" },
};

export default function IncidentSelector() {
  const { selectedIncidentId, setSelectedIncidentId, incidentData } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sc = severityColor[incidentData.severity];
  const sm = statusMeta[incidentData.status] ?? statusMeta.active;
  const StatusIcon = sm.icon;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 14px",
          borderRadius: 10,
          border: `1px solid ${open ? ACCENT : "var(--color-border)"}`,
          backgroundColor: open ? `${ACCENT}08` : "var(--color-bg-card)",
          cursor: "pointer",
          width: "100%",
          maxWidth: 600,
          textAlign: "left",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: sc, boxShadow: `0 0 6px ${sc}80`, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {incidentData.name}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: sm.color, backgroundColor: `${sm.color}18`, padding: "2px 8px", borderRadius: 999, flexShrink: 0, textTransform: "capitalize" }}>
          <StatusIcon style={{ width: 10, height: 10 }} />
          {incidentData.status}
        </span>
        <ChevronDown style={{ width: 14, height: 14, color: "var(--color-text-muted)", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            maxWidth: 600,
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.14)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 14px 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>
            Switch Incident
          </div>
          {incidents.map((inc) => {
            const isActive = inc.id === selectedIncidentId;
            const color = severityColor[inc.severity];
            const iSm = statusMeta[inc.status] ?? statusMeta.active;
            const ISIcon = iSm.icon;
            return (
              <button
                key={inc.id}
                onClick={() => { setSelectedIncidentId(inc.id); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  backgroundColor: isActive ? `${ACCENT}08` : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background-color 0.12s",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <span style={{ width: 4, height: 36, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inc.name}
                    </span>
                    {isActive && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, backgroundColor: `${ACCENT}15`, padding: "1px 7px", borderRadius: 999, flexShrink: 0 }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{inc.id}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{inc.alertCount} alerts</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: iSm.color }}>
                      <ISIcon style={{ width: 10, height: 10 }} />
                      {inc.status}
                    </span>
                  </div>
                </div>
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: `${color}20`, color, flexShrink: 0, textTransform: "capitalize" }}>
                  {inc.severity}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
