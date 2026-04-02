import { useMemo } from "react";
import { motion } from "framer-motion";
import { incidentDetails } from "../data/mockData";
import BackButton from "../components/shared/BackButton";

type ChangeRow = { id: string; incidentId: string; title: string; source: string; timestamp: string };

export default function ChangesPage() {
  const rows = useMemo(() => {
    const out: ChangeRow[] = [];
    for (const [incidentId, d] of Object.entries(incidentDetails)) {
      for (const ev of d.timeline) {
        if (ev.type !== "change") continue;
        out.push({
          id: `${incidentId}-${ev.id}`,
          incidentId,
          title: ev.title,
          source: ev.source,
          timestamp: ev.timestamp,
        });
      }
    }
    return out.slice(0, 40);
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackButton />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Changes</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Mock list of change events from incident timelines. Associated change IDs on Home link here conceptually; full CMDB
          integration is Phase 2.
        </p>
        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            overflow: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                {["Incident", "Change event", "Source", "Time"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.incidentId}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-primary)" }}>{r.title}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-secondary)" }}>{r.source}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
