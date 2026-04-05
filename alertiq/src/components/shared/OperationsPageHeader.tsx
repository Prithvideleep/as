import BackButton from "./BackButton";

/**
 * Shared header for operational pages (incidents, changes, etc.).
 */
export default function OperationsPageHeader({
  kicker,
  title,
  description,
  backLabel = "Overview",
}: {
  kicker: string;
  title: string;
  description: string;
  backLabel?: string;
}) {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: "16px 24px",
        paddingBottom: 18,
        marginBottom: 2,
        borderBottom: "1px solid var(--color-border)",
        alignItems: "start",
      }}
    >
      <div style={{ flexShrink: 0, paddingTop: 3 }}>
        <BackButton label={backLabel} />
      </div>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          {kicker}
        </span>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: "min(720px, 100%)",
          }}
        >
          {description}
        </p>
      </div>
    </header>
  );
}
