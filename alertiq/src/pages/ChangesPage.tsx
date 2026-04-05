import { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { incidentDetails } from "../data/mockData";
import OperationsPageHeader from "../components/shared/OperationsPageHeader";
import OperationsSummaryStrip from "../components/shared/OperationsSummaryStrip";

type ChangeRow = { id: string; incidentId: string; title: string; source: string; timestamp: string };

function formatRecordedTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TH: CSSProperties = {
  padding: "12px 16px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  textAlign: "left",
  borderBottom: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-primary)",
};

const TABLE_LIMIT = 40;

export default function ChangesPage() {
  const { allRows, tableRows } = useMemo(() => {
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
    out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return { allRows: out, tableRows: out.slice(0, TABLE_LIMIT) };
  }, []);

  const summaryItems = useMemo(() => {
    const incidentIds = new Set(allRows.map((r) => r.incidentId));
    const sources = new Set(allRows.map((r) => r.source));
    const latest = allRows[0]?.timestamp;
    return [
      {
        label: "Change events",
        value: allRows.length,
        sublabel:
          allRows.length > TABLE_LIMIT
            ? `Table shows ${TABLE_LIMIT} most recent`
            : "Full set listed below",
      },
      { label: "Incidents linked", value: incidentIds.size, sublabel: "Distinct incident IDs" },
      { label: "Source systems", value: sources.size, sublabel: "Unique event origins" },
      {
        label: "Latest recorded",
        value: latest ? formatRecordedTime(latest) : "—",
        sublabel: "Most recent change timestamp",
      },
    ];
  }, [allRows]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <OperationsPageHeader
          kicker="Change management"
          title="Changes"
          description="Change events correlated to incidents in the current dataset (demonstration data). Use this view to trace deployment and configuration activity alongside incident timelines; enterprise CMDB linkage is out of scope for this mock."
        />
        <OperationsSummaryStrip items={summaryItems} />
        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-primary)",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)" }}>Change register</span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {tableRows.length} row{tableRows.length === 1 ? "" : "s"} in view · newest first
            </span>
          </div>
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={TH}>Incident ID</th>
                  <th style={TH}>Description</th>
                  <th style={TH}>Source</th>
                  <th style={{ ...TH, whiteSpace: "nowrap" }}>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "36px 16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                      No change events are available in the current dataset.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: i < tableRows.length - 1 ? "1px solid var(--color-border)" : "none",
                        transition: "background-color 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "rgba(15, 23, 42, 0.03)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                          verticalAlign: "top",
                        }}
                      >
                        {r.incidentId}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-primary)", fontWeight: 500, verticalAlign: "top" }}>
                        {r.title}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", verticalAlign: "top" }}>{r.source}</td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                          verticalAlign: "top",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatRecordedTime(r.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
