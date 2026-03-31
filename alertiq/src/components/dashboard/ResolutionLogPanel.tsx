import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Clock, Search, Rows3, List, ChevronLeft, ChevronRight } from "lucide-react";
import type { Incident, IncidentDetail } from "../../data/mockData";

const PRIO_COLOR: Record<string, string> = {
  P1: "#EF4444",
  P2: "#F97316",
  P3: "#F59E0B",
  P4: "#6B7280",
};

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
  /** Optional cap after filter/sort (omit for no cap) */
  maxItems?: number;
  /** Show density toggle alongside search */
  showToolbar?: boolean;
}

export default function ResolutionLogPanel({
  incidents,
  incidentDetails,
  onSelect,
  layout = "default",
  maxItems,
  showToolbar = true,
}: Props) {
  const isSidebar = layout === "sidebar";
  const pageSize = isSidebar ? 5 : 8;
  const [compact, setCompact] = useState(false);
  const [filterQ, setFilterQ] = useState("");
  const [page, setPage] = useState(0);

  const entriesAll = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    const sorted = incidents
      .filter((i) => i.status === "resolved")
      .filter((i) => {
        if (!q) return true;
        const summary = (incidentDetails[i.id]?.resolutionSummary ?? "").toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.resolutionPriority ?? "").toLowerCase().includes(q) ||
          summary.includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const capped = maxItems != null ? sorted.slice(0, maxItems) : sorted;

    return capped.map((i) => ({
      id: i.id,
      title: i.name,
      resolvedAt: i.timestamp,
      priority: i.resolutionPriority,
      summary:
        incidentDetails[i.id]?.resolutionSummary ??
        "Marked resolved — see investigation record for full context.",
    }));
  }, [incidents, incidentDetails, maxItems, filterQ]);

  const totalPages = Math.max(1, Math.ceil(entriesAll.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const entries = useMemo(
    () => entriesAll.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [entriesAll, safePage, pageSize]
  );

  useEffect(() => {
    setPage(0);
  }, [filterQ]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const rangeLabel =
    entriesAll.length === 0
      ? "0 results"
      : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, entriesAll.length)} of ${entriesAll.length}`;

  const searchRow = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: "1 1 140px",
          minWidth: 0,
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-primary)",
        }}
      >
        <Search style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Search title, ID, priority, notes…"
          value={filterQ}
          onChange={(e) => setFilterQ(e.target.value)}
          aria-label="Search resolution log"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            fontSize: 11,
            outline: "none",
            color: "var(--color-text-primary)",
          }}
        />
      </div>
      {showToolbar && (
        <button
          type="button"
          onClick={() => setCompact((c) => !c)}
          title={compact ? "Comfortable rows" : "Compact rows"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: compact ? "rgba(235,89,40,0.08)" : "var(--color-bg-card)",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            color: "var(--color-text-secondary)",
          }}
        >
          {compact ? <List style={{ width: 12, height: 12 }} /> : <Rows3 style={{ width: 12, height: 12 }} />}
          {compact ? "Compact" : "Comfort"}
        </button>
      )}
    </div>
  );

  const paginationFooter = (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "8px 20px 10px",
        borderTop: "1px solid var(--color-border)",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)" }}>{rangeLabel}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          aria-label="Previous page"
          disabled={safePage <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            fontSize: 10,
            fontWeight: 700,
            cursor: safePage <= 0 ? "not-allowed" : "pointer",
            opacity: safePage <= 0 ? 0.45 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
          Prev
        </button>
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", minWidth: 36, textAlign: "center" }}>
          {safePage + 1}/{totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={safePage >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            fontSize: 10,
            fontWeight: 700,
            cursor: safePage >= totalPages - 1 ? "not-allowed" : "pointer",
            opacity: safePage >= totalPages - 1 ? 0.45 : 1,
            color: "var(--color-text-secondary)",
          }}
        >
          Next
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        flex: isSidebar ? "0 1 auto" : undefined,
        minWidth: 0,
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
        {searchRow}
      </div>
      <div
        style={{
          flex: "0 0 auto",
          minHeight: isSidebar ? undefined : 120,
          maxHeight: isSidebar ? undefined : 280,
          overflowY: isSidebar ? "visible" : "auto",
          overscrollBehavior: isSidebar ? undefined : "contain",
          padding: "10px 0 0",
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
            {incidents.some((i) => i.status === "resolved")
              ? "No results match your search."
              : "No resolved incidents in the current dataset."}
          </p>
        ) : (
          entries.map((e) => {
            const inner = (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <CheckCircle2
                  style={{
                    width: compact ? 12 : 14,
                    height: compact ? 12 : 14,
                    color: "#22C55E",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                  aria-hidden
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: compact ? 2 : 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: compact ? 11 : 12,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.3,
                      }}
                    >
                      {e.title}
                    </span>
                    {e.priority && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: `${PRIO_COLOR[e.priority] ?? "#6B7280"}18`,
                          color: PRIO_COLOR[e.priority] ?? "#6B7280",
                        }}
                      >
                        {e.priority}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      fontWeight: 600,
                      marginBottom: compact ? 4 : 6,
                    }}
                  >
                    <Clock style={{ width: 11, height: 11, flexShrink: 0 }} aria-hidden />
                    {formatResolved(e.resolvedAt)}
                  </div>
                  {!compact && (
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
                  )}
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
                    padding: compact ? "6px 20px" : "10px 20px",
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
                  padding: compact ? "6px 20px" : "10px 20px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {inner}
              </div>
            );
          })
        )}
      </div>
      {paginationFooter}
    </div>
  );
}
