import { useState, useRef, useEffect } from "react";
import { ChevronDown, AlertTriangle, CheckCircle, Search, X } from "lucide-react";
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
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref       = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  const sc = severityColor[incidentData.severity];
  const sm = statusMeta[incidentData.status] ?? statusMeta.active;
  const StatusIcon = sm.icon;

  const filtered = query.trim()
    ? incidents.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase())
      )
    : incidents;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px", borderRadius: 10,
          border: `1px solid ${open ? ACCENT : "var(--color-border)"}`,
          backgroundColor: open ? `${ACCENT}08` : "var(--color-bg-card)",
          cursor: "pointer", width: "100%", maxWidth: 600,
          textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
            left: 0, right: 0, maxWidth: 600,
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.14)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search input */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "var(--color-text-muted)" }} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or ID…"
                style={{
                  width: "100%", paddingLeft: 28, paddingRight: query ? 28 : 10,
                  paddingTop: 7, paddingBottom: 7,
                  borderRadius: 8, border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-hover-bg)",
                  fontSize: 12, color: "var(--color-text-primary)", outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex", padding: 0 }}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div style={{ overflowY: "auto", maxHeight: 320 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 12, color: "var(--color-text-muted)" }}>
                No incidents match "{query}"
              </div>
            ) : (
              filtered.map((inc) => {
                const isActive = inc.id === selectedIncidentId;
                const color = severityColor[inc.severity];
                const iSm = statusMeta[inc.status] ?? statusMeta.active;
                const ISIcon = iSm.icon;
                return (
                  <button
                    key={inc.id}
                    onClick={() => { setSelectedIncidentId(inc.id); setOpen(false); setQuery(""); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      width: "100%", padding: "10px 14px", textAlign: "left",
                      cursor: "pointer",
                      backgroundColor: isActive ? `${ACCENT}08` : "transparent",
                      border: "none", borderBottom: "1px solid var(--color-border)",
                      transition: "background-color 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-hover-bg)"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isActive ? `${ACCENT}08` : "transparent"; }}
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
              })
            )}
          </div>

          {/* Footer count */}
          <div style={{ padding: "6px 14px", borderTop: "1px solid var(--color-border)", fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>
            {filtered.length} of {incidents.length} incidents
          </div>
        </div>
      )}
    </div>
  );
}
