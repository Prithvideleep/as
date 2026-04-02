import { useMemo, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import type { CorrelationCluster, Incident } from "../../data/mockData";
import { dashTopTileColumn, dashTopTileShell, dashTopTileTitle } from "./dashboardTopTileStyles";

const MAX = 5;

const HEADER: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 0 6px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  borderBottom: "1px solid var(--color-border)",
  marginBottom: 4,
};

/**
 * Matches Trending P1/P2 tile: label + card chrome + row buttons.
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
    <div style={dashTopTileColumn}>
      <div style={{ ...dashTopTileShell, gap: 4 }}>
        <span style={dashTopTileTitle}>Trending clustered alerts (max 5)</span>
        {list.length > 0 && (
          <div style={HEADER}>
            <span>Major alerts</span>
            <span style={{ textAlign: "right" }}># Impacted</span>
          </div>
        )}
        {list.map((c) => {
          const inc = byId[c.incidentId];
          const impactedCount = inc?.impactedServices ?? c.impactedL1.length;
          const majorLabel = c.relatedAlerts[0]?.title ?? c.incidentName;
          return (
            <button
              key={c.incidentId}
              type="button"
              onClick={() => onSelectIncident(c.incidentId)}
              title={majorLabel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid transparent",
                background: "rgba(15,23,42,0.03)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#EB5928",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {majorLabel}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  flexShrink: 0,
                  minWidth: 28,
                  textAlign: "right",
                }}
              >
                {impactedCount}
              </span>
              <ChevronRight style={{ width: 14, height: 14, color: "var(--color-text-muted)", flexShrink: 0 }} />
            </button>
          );
        })}
        {list.length === 0 && (
          <p style={{ margin: "auto", fontSize: 12, color: "var(--color-text-muted)" }}>No clustered alerts</p>
        )}
      </div>
    </div>
  );
}
