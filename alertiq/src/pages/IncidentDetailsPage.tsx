import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents } from "../data/mockData";
import BackButton from "../components/shared/BackButton";

const ACCENT = "#EB5928";

export default function IncidentDetailsPage() {
  const navigate = useNavigate();
  const { selectedIncidentId, setSelectedIncidentId, incidentData } = useAppContext();
  const detail = incidentData;

  if (!detail) {
    return (
      <div style={{ flex: 1, padding: "var(--page-pad)" }}>
        <p style={{ color: "var(--color-text-muted)" }}>No incident detail for the current selection.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <BackButton />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Incident details</h1>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
          Incident
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {incidents.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — {i.name}
              </option>
            ))}
          </select>
        </label>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, fontWeight: 700, letterSpacing: "0.06em" }}>
              SUMMARY
            </p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.55, margin: "8px 0 0" }}>{detail.summary}</p>
          </div>
          {detail.rootCauses[0] && (
            <div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, fontWeight: 700, letterSpacing: "0.06em" }}>
                TOP HYPOTHESIS
              </p>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: "8px 0 0" }}>
                {detail.rootCauses[0].service}: {detail.rootCauses[0].description}{" "}
                <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                  ({detail.rootCauses[0].confidence}% confidence)
                </span>
              </p>
            </div>
          )}
          {detail.blastRadius.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0, fontWeight: 700, letterSpacing: "0.06em" }}>
                IMPACTED SERVICES ({detail.blastRadius.length})
              </p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--color-text-secondary)" }}>
                {detail.blastRadius.slice(0, 12).map((b) => (
                  <li key={b.service} style={{ marginBottom: 4 }}>
                    {b.service} <span style={{ color: "var(--color-text-muted)" }}>({b.severity})</span>
                  </li>
                ))}
                {detail.blastRadius.length > 12 && (
                  <li style={{ color: "var(--color-text-muted)" }}>…and {detail.blastRadius.length - 12} more</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/investigation")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            backgroundColor: ACCENT,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Open full investigation
          <ArrowRight style={{ width: 18, height: 18 }} />
        </button>
      </motion.div>
    </div>
  );
}
