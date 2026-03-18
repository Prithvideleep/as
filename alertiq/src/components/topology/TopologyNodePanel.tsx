import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownRight, AlertTriangle, Server, Database, Globe, Monitor, Layers, GitBranch } from "lucide-react";
import type { TopologyData, TopologyNode, NodeType, BlastRadiusItem } from "../../data/mockData";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  root:     { label: "Root Cause", bg: "rgba(239,68,68,0.12)",  color: "#EF4444" },
  impacted: { label: "Impacted",   bg: "rgba(249,115,22,0.12)", color: "#F97316" },
  healthy:  { label: "Healthy",    bg: "rgba(34,197,94,0.12)",  color: "#22C55E" },
};

const typeConfig: Record<NodeType, { label: string; icon: typeof Server }> = {
  service:        { label: "Service",        icon: Server },
  database:       { label: "Database",       icon: Database },
  api:            { label: "API",            icon: Globe },
  application:    { label: "Application",    icon: Monitor },
  infrastructure: { label: "Infrastructure", icon: Layers },
  pipeline:       { label: "Pipeline",       icon: GitBranch },
};

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  node: TopologyNode | null;
  topology: TopologyData;
  blastRadius: BlastRadiusItem[];
  onClose: () => void;
}

export default function TopologyNodePanel({ node, topology, blastRadius, onClose }: Props) {
  const upstream = node
    ? topology.edges
        .filter((e) => e.target === node.id)
        .map((e) => ({ edge: e, node: topology.nodes.find((n) => n.id === e.source)! }))
        .filter((x) => x.node)
    : [];

  const downstream = node
    ? topology.edges
        .filter((e) => e.source === node.id)
        .map((e) => ({ edge: e, node: topology.nodes.find((n) => n.id === e.target)! }))
        .filter((x) => x.node)
    : [];

  const blastItem = node
    ? blastRadius.find((b) => b.service === node.id)
    : null;

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2 }}
          style={{
            width: 300,
            flexShrink: 0,
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <NodeHeader node={node} onClose={onClose} />

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Description */}
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              {node.description}
            </p>

            {/* Blast radius impact */}
            {blastItem && (
              <Section icon={<AlertTriangle style={{ width: 13, height: 13 }} />} title="Incident Impact" iconColor="#EF4444">
                <div style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>{blastItem.impact}</p>
                </div>
              </Section>
            )}

            {/* Upstream */}
            <Section
              icon={<ArrowUpRight style={{ width: 13, height: 13 }} />}
              title={`Upstream (${upstream.length})`}
              subtitle="what this node depends on"
              iconColor="#3B82F6"
            >
              {upstream.length === 0
                ? <EmptyRow text="No upstream dependencies" />
                : upstream.map(({ edge, node: n }) => (
                    <RelationRow key={n.id} node={n} edgeLabel={edge.label} edgeType={edge.type} />
                  ))
              }
            </Section>

            {/* Downstream */}
            <Section
              icon={<ArrowDownRight style={{ width: 13, height: 13 }} />}
              title={`Downstream (${downstream.length})`}
              subtitle="what depends on this node"
              iconColor="#EB5928"
            >
              {downstream.length === 0
                ? <EmptyRow text="No downstream dependants" />
                : downstream.map(({ edge, node: n }) => (
                    <RelationRow key={n.id} node={n} edgeLabel={edge.label} edgeType={edge.type} />
                  ))
              }
            </Section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NodeHeader({ node, onClose }: { node: TopologyNode; onClose: () => void }) {
  const sc = statusConfig[node.status];
  const tc = typeConfig[node.type];
  const TypeIcon = tc.icon;

  return (
    <div
      style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${sc.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TypeIcon style={{ width: 15, height: 15, color: sc.color }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{node.label}</p>
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 1 }}>{node.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ padding: 4, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
        <Badge bg="rgba(0,0,0,0.04)" color="var(--color-text-secondary)">{tc.label}</Badge>
      </div>
    </div>
  );
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, backgroundColor: bg, color }}>
      {children}
    </span>
  );
}

function Section({ icon, title, subtitle, iconColor, children }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)" }}>{title}</span>
        {subtitle && <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>— {subtitle}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

const edgeTypeColor: Record<string, string> = {
  "dependency":   "#6B7280",
  "data-flow":    "#EB5928",
  "communication":"#3B82F6",
};

function RelationRow({ node, edgeLabel, edgeType }: { node: TopologyNode; edgeLabel?: string; edgeType: string }) {
  const sc = statusConfig[node.status];
  const tc = typeConfig[node.type];
  const TypeIcon = tc.icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, backgroundColor: "var(--color-hover-bg)", border: "1px solid var(--color-border)" }}>
      <TypeIcon style={{ width: 13, height: 13, color: sc.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</p>
        {edgeLabel && (
          <p style={{ fontSize: 10, color: edgeTypeColor[edgeType] ?? "var(--color-text-muted)" }}>{edgeLabel}</p>
        )}
      </div>
      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: sc.color, flexShrink: 0 }} />
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 11, color: "var(--color-text-muted)", padding: "6px 0" }}>{text}</p>
  );
}
