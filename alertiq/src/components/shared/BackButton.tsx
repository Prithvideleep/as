import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function canGoBackInApp() {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" && idx > 0;
}

export default function BackButton({ label = "Back" }: { label?: string }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        if (canGoBackInApp()) navigate(-1);
        else navigate("/");
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 10,
        backgroundColor: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "border-color 0.15s, color 0.15s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,89,40,0.4)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
      }}
      title="Go back (or Dashboard)"
    >
      <ArrowLeft style={{ width: 14, height: 14 }} />
      {label}
    </button>
  );
}

