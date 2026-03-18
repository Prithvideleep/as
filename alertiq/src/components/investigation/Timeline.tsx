import { motion } from "framer-motion";
import { AlertTriangle, GitCommit, Activity } from "lucide-react";
import type { TimelineEvent } from "../../data/mockData";

// Blue kept intentionally for "change" events — semantic colour
const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  alert:   { icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.10)"  },
  change:  { icon: GitCommit,     color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  anomaly: { icon: Activity,      color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        padding: "18px 22px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 20 }}>
        Timeline
      </h2>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 18, top: 10, bottom: 10, width: 1.5, backgroundColor: "var(--color-border)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {events.map((event, i) => {
            const cfg = typeConfig[event.type] ?? typeConfig.alert;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                style={{ display: "flex", gap: 12, position: "relative" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                  <Icon style={{ width: 14, height: 14, color: cfg.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {event.title}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {event.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 2 }}>
                    {event.description}
                  </p>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{event.source}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
