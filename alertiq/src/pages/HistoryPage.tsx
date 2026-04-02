import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { incidents, incidentDetails } from "../data/mockData";
import ResolutionLogPanel from "../components/dashboard/ResolutionLogPanel";
import BackButton from "../components/shared/BackButton";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  const onSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>History</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Resolution log for closed incidents. Search and open an incident to continue in Investigation.
        </p>
        <ResolutionLogPanel incidents={incidents} incidentDetails={incidentDetails} onSelect={onSelect} showToolbar />
      </motion.div>
    </div>
  );
}
