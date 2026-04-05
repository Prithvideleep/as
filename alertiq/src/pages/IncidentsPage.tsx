import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { incidents, incidentDetails } from "../data/mockData";
import AllIncidentsPanel from "../components/dashboard/AllIncidentsPanel";
import OperationsPageHeader from "../components/shared/OperationsPageHeader";
import OperationsSummaryStrip from "../components/shared/OperationsSummaryStrip";

export default function IncidentsPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();

  const summaryItems = useMemo(() => {
    const active = incidents.filter((i) => i.status === "active").length;
    const investigating = incidents.filter((i) => i.status === "investigating").length;
    const resolved = incidents.filter((i) => i.status === "resolved").length;
    const alerts = incidents.reduce((n, i) => n + i.alertCount, 0);
    return [
      { label: "Register total", value: incidents.length, sublabel: "All incident records" },
      { label: "Active", value: active, sublabel: "Open — needs ownership" },
      { label: "Investigating", value: investigating, sublabel: "Under active review" },
      { label: "Resolved", value: resolved, sublabel: "Closed in this dataset" },
      { label: "Alerts (sum)", value: alerts, sublabel: "Correlated alert count" },
    ];
  }, [incidents]);

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
        style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        <OperationsPageHeader
          kicker="Incident management"
          title="Incidents"
          description="Unified register of active and resolved incidents. Use search and filters to narrow the list; open a row to continue in Investigation."
        />
        <OperationsSummaryStrip items={summaryItems} />
        <AllIncidentsPanel incidents={incidents} incidentDetails={incidentDetails} onSelect={onSelect} />
      </motion.div>
    </div>
  );
}
