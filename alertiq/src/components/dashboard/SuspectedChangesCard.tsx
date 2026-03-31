import { useMemo, useState, useEffect } from "react";
import { GitBranch, RotateCcw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { SuspectedChange } from "../../data/mockData";

interface Props {
  changes: SuspectedChange[];
  onOpenIncident?: (id: string) => void;
  /** Match ResolutionLogPanel / IncidentTile rail styling */
  layout?: "default" | "sidebar";
}

export default function SuspectedChangesCard({ changes, onOpenIncident, layout = "default" }: Props) {
  const isSidebar = layout === "sidebar";
  const pageSize = isSidebar ? 5 : 8;
  const [filterQ, setFilterQ] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    if (!q) return changes;
    return changes.filter((c) => {
      const ids = c.relatedIncidentIds.join(" ").toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.rollbackHint.toLowerCase().includes(q) ||
        ids.includes(q)
      );
    });
  }, [changes, filterQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [filtered, safePage, pageSize]
  );

  useEffect(() => {
    setPage(0);
  }, [filterQ]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const rangeLabel =
    filtered.length === 0
      ? "0 results"
      : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)} of ${filtered.length}`;

  if (changes.length === 0) return null;

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
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <GitBranch style={{ width: 14, height: 14, color: "var(--color-accent)", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.45 }}>
            Mock deploy / change correlation · ServiceNow / RCA Genie TBD
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-primary)",
          }}
        >
          <Search style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Search title, service, change ID, incidents…"
            value={filterQ}
            onChange={(e) => setFilterQ(e.target.value)}
            aria-label="Search suspected changes"
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
      </div>
      <div
        style={{
          flex: "0 0 auto",
          padding: "10px 14px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxHeight: isSidebar ? undefined : 320,
          overflowY: isSidebar ? "visible" : "auto",
          overscrollBehavior: "contain",
        }}
      >
        {pageItems.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "4px 6px 12px", lineHeight: 1.45 }}>
            No results match your search.
          </p>
        ) : (
          pageItems.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                backgroundColor: "rgba(235,89,40,0.06)",
                border: "1px solid rgba(235,89,40,0.2)",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.35 }}>
                {c.title}
              </p>
              <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: "5px 0 8px", lineHeight: 1.45 }}>
                {c.service} ·{" "}
                {new Date(c.at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {c.relatedIncidentIds.length > 0 && (
                  <>
                    {" · "}
                    Linked:{" "}
                    {c.relatedIncidentIds.map((id, i) => (
                      <span key={id}>
                        {i > 0 && ", "}
                        {onOpenIncident ? (
                          <button
                            type="button"
                            onClick={() => onOpenIncident(id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "var(--color-accent)",
                              fontWeight: 700,
                              fontSize: 10,
                            }}
                          >
                            {id}
                          </button>
                        ) : (
                          id
                        )}
                      </span>
                    ))}
                  </>
                )}
              </p>
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(235,89,40,0.35)",
                  backgroundColor: "rgba(235,89,40,0.1)",
                  color: "var(--color-accent)",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <RotateCcw style={{ width: 12, height: 12 }} />
                {c.rollbackHint}
              </button>
            </div>
          ))
        )}
      </div>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 14px 10px",
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
    </div>
  );
}
