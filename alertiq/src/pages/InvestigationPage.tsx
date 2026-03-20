import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Network } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/shared/BackButton";
import IncidentHeader from "../components/investigation/IncidentHeader";
import RootCausePanel from "../components/investigation/RootCausePanel";
import SummaryPanel from "../components/investigation/SummaryPanel";
import Timeline from "../components/investigation/Timeline";
import BlastRadiusPanel from "../components/investigation/BlastRadiusPanel";
import HistoricalRefPanel from "../components/investigation/HistoricalRefPanel";

function buildContextMessage(incident: ReturnType<typeof useAppContext>["incidentData"]): string {
  const primary = incident.rootCauses[0];
  const impacted = incident.blastRadius
    .filter((b) => b.severity === "critical" || b.severity === "high")
    .map((b) => b.service)
    .join(", ");

  return (
    `I'm investigating incident ${incident.id}: "${incident.name}" (${incident.severity} severity, status: ${incident.status}).\n\n` +
    `Primary root cause: ${primary.service} — ${primary.description} (${primary.confidence}% confidence)\n\n` +
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
    navigate("/chat", { state: { fromInvestigation: true } });
  };

  const handleViewTopology = () => {
    navigate("/topology");
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "var(--page-pad)" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackButton />
          <div style={{ flex: 1 }} />
        </div>

        {/* Incident selector */}
        <IncidentHeader incident={incidentData} />

        {/* Plain language summary */}
        <SummaryPanel summary={incidentData.summary} />

        {/* Root causes ranked */}
        <RootCausePanel rootCauses={incidentData.rootCauses} />

        {/* Timeline + Blast radius */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
          <Timeline events={incidentData.timeline} />
          <BlastRadiusPanel items={incidentData.blastRadius} />
        </div>

        {/* Historical refs + Topology shortcut */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16, alignItems: "stretch" }}>
          <HistoricalRefPanel refs={incidentData.historicalRefs} />

          {/* Topology shortcut card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "24px 20px",
              borderRadius: 16,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-card)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              minWidth: 210,
              cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onClick={handleViewTopology}
            whileHover={{ boxShadow: "0 4px 16px rgba(235,89,40,0.12)", borderColor: "rgba(235,89,40,0.35)" }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(235,89,40,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Network style={{ width: 22, height: 22, color: "var(--color-accent)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                View Dependency Map
              </p>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                See how services are connected and trace the propagation path
              </p>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-accent)" }}>
              Open Topology <ArrowRight style={{ width: 13, height: 13 }} />
            </span>
          </motion.div>
        </div>

        {/* Discuss in Triage banner */}
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
            <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(235,89,40,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
