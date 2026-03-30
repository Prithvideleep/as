import { useMemo } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { Incident, IncidentDetail } from "../../data/mockData";

function formatResolved(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  incidents: Incident[];
  incidentDetails: Record<string, IncidentDetail>;
  onSelect?: (id: string) => void;
  layout?: "default" | "sidebar";
  sidebarMaxHeight?: string;
  maxItems?: number;
}

export default function ResolutionLogPanel({
  incidents,
  incidentDetails,
  onSelect,
  layout = "default",
  sidebarMaxHeight = "min(320px, calc(45dvh - 24px))",
  maxItems = 14,
}: Props) {
  const isSidebar = layout === "sidebar";

  const entries = useMemo(() => {
    return incidents
      .filter((i) => i.status === "resolved")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems)
      .map((i) => ({
        id: i.id,
        title: i.name,
        resolvedAt: i.timestamp,
        summary:
          incidentDetails[i.id]?.resolutionSummary ??
          "Marked resolved — see investigation record for full context.",
      }));
  }, [incidents, incidentDetails, maxItems]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        flex: isSidebar ? "1 1 auto" : undefined,
        maxHeight: isSidebar ? sidebarMaxHeight : undefined,
        minWidth: 0,
        minHeight: isSidebar ? 0 : undefined,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: "14px 20px 10px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>
          Recent closures and remediation notes
        </p>
      </div>
      <div
        style={{
          flex: isSidebar ? "1 1 auto" : undefined,
          minHeight: isSidebar ? 0 : 120,
          maxHeight: isSidebar ? undefined : 280,
          overflowY: "auto",
          overscrollBehavior: "contain",
          padding: "10px 0 12px",
        }}
      >
        {entries.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              padding: "8px 20px 12px",
              margin: 0,
            }}
          >
            No resolved incidents in the current dataset.
          </p>
        ) : (
          entries.map((e) => {
            const inner = (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CheckCircle2
                  style={{
                    width: 14,
                    height: 14,
                    color: "#22C55E",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                  aria-hidden
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      lineHeight: 1.3,
                      marginBottom: 4,
                    }}
                  >
                    {e.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    <Clock style={{ width: 11, height: 11, flexShrink: 0 }} aria-hidden />
                    {formatResolved(e.resolvedAt)}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.45,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {e.summary}
                  </p>
                </div>
              </div>
            );

            if (onSelect) {
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onSelect(e.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 20px",
                    borderBottom: "1px solid var(--color-border)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(ev) => {
                    ev.currentTarget.style.backgroundColor = "var(--color-hover-bg)";
                  }}
                  onMouseLeave={(ev) => {
                    ev.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {inner}
                </button>
              );
            }

            return (
              <div
                key={e.id}
                style={{
                  padding: "10px 20px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {inner}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
