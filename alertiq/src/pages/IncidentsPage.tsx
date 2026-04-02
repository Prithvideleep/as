import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { incidents, incidentDetails } from "../data/mockData";
import AllIncidentsPanel from "../components/dashboard/AllIncidentsPanel";
import BackButton from "../components/shared/BackButton";

export default function IncidentsPage() {
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
        style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackButton />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>All incidents</h1>
        </div>
        <AllIncidentsPanel incidents={incidents} incidentDetails={incidentDetails} onSelect={onSelect} />
      </motion.div>
    </div>
  );
}
