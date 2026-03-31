import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import type { IncidentDetail } from "../../data/mockData";

const ACCENT = "#EB5928";

export default function DashboardDetailDrawer({
  open,
  incidentId,
  detail,
  onClose,
  onOpenInvestigation,
}: {
  open: boolean;
  incidentId: string | null;
  detail: IncidentDetail | null;
  onClose: () => void;
  onOpenInvestigation: (id: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && incidentId && detail && (
        <>
          <motion.div
            key="dash-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 285,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <motion.div
            key="dash-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-detail-title"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(400px, 100vw - 16px)",
              zIndex: 286,
              backgroundColor: "var(--color-bg-card)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "-8px 0 28px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "rgba(235,89,40,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle style={{ width: 18, height: 18, color: ACCENT }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  id="dash-detail-title"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {detail.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                  {detail.id} · {detail.severity} · {detail.status}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-card)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Summary
                </span>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "6px 0 0" }}>
                  {detail.summary}
                </p>
              </div>
              {detail.rootCauses[0] && (
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Top hypothesis
                  </span>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: "6px 0 0" }}>
                    {detail.rootCauses[0].service}: {detail.rootCauses[0].description}{" "}
                    <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                      ({detail.rootCauses[0].confidence}% confidence)
                    </span>
                  </p>
                </div>
              )}
              {detail.blastRadius.length > 0 && (
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Impacted services ({detail.blastRadius.length})
                  </span>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {detail.blastRadius.slice(0, 8).map((b) => (
                      <li key={b.service} style={{ marginBottom: 4 }}>
                        {b.service}{" "}
                        <span style={{ color: "var(--color-text-muted)" }}>({b.severity})</span>
                      </li>
                    ))}
                    {detail.blastRadius.length > 8 && (
                      <li style={{ color: "var(--color-text-muted)" }}>…and {detail.blastRadius.length - 8} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div
              style={{
                flexShrink: 0,
                padding: "12px 16px 16px",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onOpenInvestigation(incidentId);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: ACCENT,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Open full investigation
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: 0, textAlign: "center" }}>
                Stay on dashboard — preview only. Full RCA tooling lives on Investigation.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
