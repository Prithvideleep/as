import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { Incident } from "../../data/mockData";
import { dashTopTileColumn, dashTopTileShell, dashTopTileTitle } from "./dashboardTopTileStyles";

const MAX = 5;

/** P1/P2 proxy: critical + high severity open incidents, newest first. */
export default function TrendingP1P2IncidentsStrip({
  incidents,
  onOpenIncident,
}: {
  incidents: Incident[];
  onOpenIncident: (id: string) => void;
}) {
  const list = useMemo(() => {
    return incidents
      .filter((i) => i.status !== "resolved" && (i.severity === "critical" || i.severity === "high"))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX);
  }, [incidents]);

  return (
    <div style={dashTopTileColumn}>
      <div style={{ ...dashTopTileShell, gap: 4 }}>
        <span style={dashTopTileTitle}>Trending incidents (P1 / P2)</span>
        {list.map((i) => {
          const tier = i.severity === "critical" ? "P1" : "P2";
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onOpenIncident(i.id)}
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
                  fontSize: 10,
                  fontWeight: 800,
                  color: tier === "P1" ? "#EF4444" : "#F97316",
                  width: 22,
                  flexShrink: 0,
                }}
              >
                {tier}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {i.name}
              </span>
              <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>{i.id}</span>
              <ChevronRight style={{ width: 14, height: 14, color: "var(--color-text-muted)", flexShrink: 0 }} />
            </button>
          );
        })}
        {list.length === 0 && (
          <p style={{ margin: "auto", fontSize: 12, color: "var(--color-text-muted)" }}>No P1/P2 incidents</p>
        )}
      </div>
    </div>
  );
}
