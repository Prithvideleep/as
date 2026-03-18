import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, AlertOctagon, Server } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { incidents, dashboardMetrics } from "../data/mockData";
import MetricCard from "../components/shared/MetricCard";
import IncidentCard from "../components/dashboard/IncidentCard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedIncidentId, setSelectedIncidentId } = useAppContext();

  const handleSelect = (id: string) => {
    setSelectedIncidentId(id);
    navigate("/investigation");
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
          Executive Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
          Real-time incident overview and cluster monitoring
        </p>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <MetricCard
          title="Active Clusters"
          value={dashboardMetrics.activeClusters}
          icon={<Layers style={{ width: 18, height: 18 }} />}
        />
        <MetricCard
          title="Critical Alerts"
          value={dashboardMetrics.criticalAlerts}
          icon={<AlertOctagon style={{ width: 18, height: 18 }} />}
          iconColor="var(--color-critical)"
        />
        <MetricCard
          title="Impacted Services"
          value={dashboardMetrics.impactedServices}
          icon={<Server style={{ width: 18, height: 18 }} />}
          iconColor="var(--color-high)"
        />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 12 }}>
        Incident Clusters
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {incidents.map((incident, i) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <IncidentCard
              incident={incident}
              isSelected={selectedIncidentId === incident.id}
              onClick={() => handleSelect(incident.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
    </div>
  );
}
