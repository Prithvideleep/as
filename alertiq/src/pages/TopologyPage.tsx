import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import type { TopologyNode } from "../data/mockData";
import TopologyGraph from "../components/topology/TopologyGraph";
import TopologyLegend from "../components/topology/TopologyLegend";
import TopologyStatsBar from "../components/topology/TopologyStatsBar";
import TopologyNodePanel from "../components/topology/TopologyNodePanel";
import IncidentSelector from "../components/shared/IncidentSelector";
import BackButton from "../components/shared/BackButton";

export default function TopologyPage() {
  const { topologyForIncident, incidentData } = useAppContext();
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  const handleNodeClick = useCallback((node: TopologyNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleClosePanel = useCallback(() => setSelectedNode(null), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "20px var(--page-pad) 0",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <BackButton />
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Service Topology
          </span>
        </div>
        <IncidentSelector />
      </div>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <TopologyStatsBar data={topologyForIncident} />

      {/* ── Graph area + slide-in panel ─────────────────────── */}
      <div className="topology-split">
        {/* Graph */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            borderRadius: "12px 12px 0 0",
            overflow: "hidden",
            backgroundColor: "#14141E",
            border: "1px solid #2D2D3A",
            borderBottom: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <TopologyGraph
              data={topologyForIncident}
              selectedNodeId={selectedNode?.id ?? null}
              onNodeClick={handleNodeClick}
              rootCauseServiceIds={incidentData.rootCauses.map((r) => r.service)}
              primaryRootCauseServiceId={incidentData.rootCauses[0]?.service ?? null}
            />
          </div>
          <TopologyLegend />
        </div>

        {/* Node detail panel */}
        <TopologyNodePanel
          node={selectedNode}
          topology={topologyForIncident}
          blastRadius={incidentData?.blastRadius ?? []}
          rootCauses={incidentData.rootCauses}
          onClose={handleClosePanel}
        />
      </div>

      {/* Bottom padding */}
      <div style={{ flexShrink: 0, height: 20 }} />
    </motion.div>
  );
}
