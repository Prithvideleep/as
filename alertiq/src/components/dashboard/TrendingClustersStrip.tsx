import { useMemo } from "react";
import type { CorrelationCluster, Incident } from "../../data/mockData";

const MAX = 5;

/**
 * Wireframe-aligned tile: two-column table — Major Alerts (links) · # impacted Services.
 */
export default function TrendingClustersStrip({
  clusters,
  incidents,
  onSelectIncident,
}: {
  clusters: CorrelationCluster[];
  incidents: Incident[];
  onSelectIncident: (incidentId: string) => void;
}) {
  const list = clusters.slice(0, MAX);
  const byId = useMemo(() => Object.fromEntries(incidents.map((i) => [i.id, i])), [incidents]);

  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          display: "block",
          marginBottom: 10,
          lineHeight: 1.3,
        }}
      >
        Trending Clustered Alerts (max 5)
      </span>
      <div
        style={{
          flex: 1,
          borderRadius: 14,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          padding: 0,
          minHeight: 120,
          overflow: "hidden",
        }}
      >
        {list.length === 0 ? (
          <p style={{ margin: 0, padding: 20, fontSize: 13, color: "var(--color-text-muted)", textAlign: "center" }}>
            No clustered alerts
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    fontWeight: 700,
                    color: "var(--color-text-secondary)",
                    fontSize: 12,
                  }}
                >
                  Major Alerts
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "10px 14px",
                    fontWeight: 700,
                    color: "var(--color-text-secondary)",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  # impacted Services
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const inc = byId[c.incidentId];
                const impactedCount = inc?.impactedServices ?? c.impactedL1.length;
                const majorLabel = c.relatedAlerts[0]?.title ?? c.incidentName;
                return (
                  <tr key={c.incidentId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "10px 14px", verticalAlign: "middle", maxWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => onSelectIncident(c.incidentId)}
                        title={majorLabel}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          font: "inherit",
                          fontWeight: 600,
                          color: "#EB5928",
                          textDecoration: "underline",
                          textAlign: "left",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {majorLabel}
                      </button>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        textAlign: "right",
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {impactedCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
