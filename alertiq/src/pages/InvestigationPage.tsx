import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import IncidentHeader from "../components/investigation/IncidentHeader";
import RootCausePanel from "../components/investigation/RootCausePanel";
import SummaryPanel from "../components/investigation/SummaryPanel";
import Timeline from "../components/investigation/Timeline";
import BlastRadiusPanel from "../components/investigation/BlastRadiusPanel";

function buildContextMessage(incident: ReturnType<typeof useAppContext>["incidentData"]): string {
  const impacted = incident.blastRadius
    .filter((b) => b.severity === "critical" || b.severity === "high")
    .map((b) => b.service)
    .join(", ");

  return (
    `I'm investigating incident ${incident.id}: "${incident.name}" (${incident.severity} severity, status: ${incident.status}).\n\n` +
    `Root cause: ${incident.rootCause.service} — ${incident.rootCause.description} (${incident.rootCause.confidence}% confidence)\n\n` +
    `Critically/highly impacted services: ${impacted || "none identified yet"}.\n\n` +
    `Summary: ${incident.summary}\n\n` +
    `What are the recommended next steps to resolve this?`
  );
}

export default function InvestigationPage() {
  const navigate = useNavigate();
  const { incidentData, setPendingChatContext } = useAppContext();

  const handleDiscussInTriage = () => {
    setPendingChatContext(buildContextMessage(incidentData));
    // Pass state flag so ChatPage knows this is a context transfer (not a normal nav)
    navigate("/chat", { state: { fromInvestigation: true } });
  };

  return (
    // Scrollable wrapper — matches padding removed from AppLayout main
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <IncidentHeader incident={incidentData} />
        <SummaryPanel summary={incidentData.summary} />
        <RootCausePanel rootCause={incidentData.rootCause} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Timeline events={incidentData.timeline} />
          <BlastRadiusPanel items={incidentData.blastRadius} />
        </div>

        {/* Context transfer banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "16px 20px",
            borderRadius: 14,
            border: "1px solid rgba(235,89,40,0.25)",
            backgroundColor: "rgba(235,89,40,0.04)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: "rgba(235,89,40,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageSquare style={{ width: 18, height: 18, color: "var(--color-accent)" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>
                Need help resolving this?
              </p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                Transfer this incident's full context — root cause, impacted services, and summary — directly into Triage.
              </p>
            </div>
          </div>

          <button
            onClick={handleDiscussInTriage}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 10,
              backgroundColor: "var(--color-accent)", color: "#fff",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            Discuss in Triage
            <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
