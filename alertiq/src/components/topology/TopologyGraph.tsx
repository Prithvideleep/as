import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Server, Database, Globe, Monitor, Layers, GitBranch, Eye, EyeOff, Search, X } from "lucide-react";
import type { TopologyData, TopologyNode, NodeType } from "../../data/mockData";

// ─── Styling maps ─────────────────────────────────────────────────────────

const statusStyle: Record<string, { bg: string; border: string; textColor: string; glow: string }> = {
  root:     { bg: "rgba(239,68,68,0.13)",  border: "#EF4444", textColor: "#FCA5A5", glow: "0 0 18px rgba(239,68,68,0.28)" },
  impacted: { bg: "rgba(249,115,22,0.11)", border: "#F97316", textColor: "#FDBA74", glow: "0 0 12px rgba(249,115,22,0.2)"  },
  healthy:  { bg: "rgba(34,197,94,0.10)",  border: "#22C55E", textColor: "#86EFAC", glow: "none" },
};

const typeIcons: Record<NodeType, typeof Server> = {
  service:        Server,
  database:       Database,
  api:            Globe,
  application:    Monitor,
  infrastructure: Layers,
  pipeline:       GitBranch,
};

const edgeColor: Record<string, string> = {
  "dependency":    "#6B7280",
  "data-flow":     "#EB5928",
  "communication": "#3B82F6",
};

// ─── Custom node ──────────────────────────────────────────────────────────

function ServiceNode({ data, selected }: NodeProps) {
  const d = data as {
    label: string;
    status: string;
    type: NodeType;
    description: string;
    isSearchMatch?: boolean;
    isRootCauseMatch?: boolean;
    isPrimaryRootCause?: boolean;
  };
  const s = statusStyle[d.status] ?? statusStyle.healthy;
  const Icon = typeIcons[d.type] ?? Server;

  const accent = d.isPrimaryRootCause ? "#EF4444" : d.isRootCauseMatch ? "#F97316" : "#EB5928";
  const matchRing = d.isSearchMatch ? `0 0 0 3px rgba(59,130,246,0.22)` : "none";

  return (
    <div
      style={{
        background: s.bg,
        border: `1.5px solid ${
          selected ? accent : d.isSearchMatch ? "#3B82F6" : d.isRootCauseMatch ? accent : s.border
        }`,
        borderRadius: 12,
        padding: "10px 14px",
        minWidth: 130,
        maxWidth: 160,
        textAlign: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: selected
          ? `0 0 0 3px rgba(235,89,40,0.25), ${matchRing}`
          : d.isRootCauseMatch
            ? `0 0 0 2px rgba(249,115,22,0.18), ${matchRing}`
            : matchRing !== "none"
              ? matchRing
              : s.glow,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Handle type="target" position={Position.Top}    style={{ background: s.border, width: 6, height: 6, border: "2px solid #1C1C28", opacity: 0.8 }} />

      <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: `${s.border}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ width: 14, height: 14, color: s.border }} />
      </div>

      <span style={{ fontSize: 11, fontWeight: 700, color: s.textColor, lineHeight: 1.3, wordBreak: "break-word" }}>
        {d.label}
      </span>

      {d.status === "root" && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#EF4444", backgroundColor: "rgba(239,68,68,0.18)", padding: "1px 6px", borderRadius: 999 }}>
          Root Cause
        </span>
      )}

      {d.isPrimaryRootCause && (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#EF4444", backgroundColor: "rgba(239,68,68,0.18)", padding: "1px 6px", borderRadius: 999 }}>
          Primary
        </span>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: s.border, width: 6, height: 6, border: "2px solid #1C1C28", opacity: 0.8 }} />
    </div>
  );
}

const nodeTypes = { service: ServiceNode };

// ─── BFS layered layout ───────────────────────────────────────────────────

function computeLayeredPositions(
  nodes: TopologyNode[],
  edges: TopologyData["edges"]
): Record<string, { x: number; y: number }> {
  // Assign layers via BFS starting from root nodes
  const layerMap: Record<string, number> = {};
  const roots = nodes.filter((n) => n.status === "root").map((n) => n.id);

  const queue: string[] = [...roots];
  roots.forEach((id) => { layerMap[id] = 0; });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layerMap[current] ?? 0;
    edges
      .filter((e) => e.source === current)
      .forEach((e) => {
        if (layerMap[e.target] === undefined) {
          layerMap[e.target] = currentLayer + 1;
          queue.push(e.target);
        }
      });
  }

  // Assign any unvisited nodes (disconnected) to the last layer
  const maxLayer = Math.max(0, ...Object.values(layerMap));
  nodes.forEach((n) => {
    if (layerMap[n.id] === undefined) layerMap[n.id] = maxLayer + 1;
  });

  // Group nodes by layer
  const byLayer: Record<number, string[]> = {};
  Object.entries(layerMap).forEach(([id, layer]) => {
    if (!byLayer[layer]) byLayer[layer] = [];
    byLayer[layer].push(id);
  });

  const NODE_W = 170;
  const NODE_H = 130;
  const positions: Record<string, { x: number; y: number }> = {};

  Object.entries(byLayer).forEach(([layerStr, ids]) => {
    const layer = Number(layerStr);
    const totalWidth = ids.length * NODE_W;
    ids.forEach((id, i) => {
      positions[id] = {
        x: i * NODE_W - totalWidth / 2 + NODE_W / 2,
        y: layer * NODE_H,
      };
    });
  });

  return positions;
}

// ─── Main component ───────────────────────────────────────────────────────

interface Props {
  data: TopologyData;
  selectedNodeId: string | null;
  onNodeClick: (node: TopologyNode) => void;
  rootCauseServiceIds?: string[];
  primaryRootCauseServiceId?: string | null;
}

// (Edge type toggles + focus-path controls removed per UX request.)

export default function TopologyGraph({
  data,
  selectedNodeId,
  onNodeClick,
  rootCauseServiceIds = [],
  primaryRootCauseServiceId = null,
}: Props) {
  const [hideHealthy, setHideHealthy] = useState(false);
  const [query, setQuery] = useState("");

  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const lastFitIdRef = useRef<string | null>(null);

  const visibleNodes = useMemo(
    () => hideHealthy ? data.nodes.filter((n) => n.status !== "healthy") : data.nodes,
    [data.nodes, hideHealthy]
  );

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () =>
      data.edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      ),
    [data.edges, visibleNodeIds]
  );

  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return visibleNodes.filter(
      (n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    );
  }, [visibleNodes, query]);

  const focusNodeId = searchMatches[0]?.id ?? null;

  const finalNodes = visibleNodes;
  const finalEdges = visibleEdges;

  const positions = useMemo(
    () => computeLayeredPositions(finalNodes, finalEdges),
    [finalNodes, finalEdges]
  );

  const nodes: Node[] = useMemo(
    () =>
      finalNodes.map((n) => ({
        id: n.id,
        type: "service",
        position: positions[n.id] ?? { x: 0, y: 0 },
        selected: n.id === selectedNodeId,
        data: {
          label: n.label,
          status: n.status,
          type: n.type,
          description: n.description,
          isSearchMatch: !!focusNodeId && n.id === focusNodeId,
          isRootCauseMatch: rootCauseServiceIds.includes(n.id),
          isPrimaryRootCause: !!primaryRootCauseServiceId && n.id === primaryRootCauseServiceId,
        },
      })),
    [finalNodes, positions, selectedNodeId, focusNodeId, rootCauseServiceIds, primaryRootCauseServiceId]
  );

  const edges: Edge[] = useMemo(
    () =>
      finalEdges.map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        labelStyle: { fontSize: 9, fill: edgeColor[e.type] ?? "#6B7280", fontFamily: "Inter, sans-serif" },
        labelBgStyle: { fill: "#1C1C28", fillOpacity: 0.85 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        animated: e.type === "data-flow",
        markerEnd: { type: "arrowclosed" as const, color: edgeColor[e.type] ?? "#6B7280", width: 14, height: 14 },
        style: { stroke: edgeColor[e.type] ?? "#6B7280", strokeWidth: 1.5 },
      })),
    [finalEdges]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, rfNode) => {
      const original = data.nodes.find((n) => n.id === rfNode.id);
      if (original) onNodeClick(original);
    },
    [data.nodes, onNodeClick]
  );

  // When search finds a node, zoom to it once (per node id)
  useEffect(() => {
    const rf = rfInstanceRef.current;
    if (!rf) return;

    if (focusNodeId) {
      if (lastFitIdRef.current === focusNodeId) return;
      lastFitIdRef.current = focusNodeId;
      // best-effort: fitView supports nodes: [{ id }]
      rf.fitView({ nodes: [{ id: focusNodeId }], padding: 0.5, duration: 400 });
      return;
    }

    // Search cleared (or no match): reverse the zoom back to the full graph.
    if (lastFitIdRef.current === null) return;
    lastFitIdRef.current = null;
    rf.fitView({ padding: 0.22, duration: 400 });
  }, [focusNodeId]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Controls panel */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: 260,
          maxWidth: "calc(100% - 24px)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.55)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            style={{
              width: "100%",
              padding: "7px 10px 7px 30px",
              borderRadius: 10,
              backgroundColor: "#252532",
              border: "1px solid #2D2D3A",
              color: "rgba(255,255,255,0.78)",
              fontSize: 12,
              outline: "none",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.55)",
                display: "flex",
                padding: 0,
              }}
              title="Clear search"
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
          {query && (
            <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              {searchMatches.length} match{searchMatches.length === 1 ? "" : "es"}
            </div>
          )}
        </div>

        {/* Search is enough per UX request; no edge-type chips / focus-path toggle. */}
      </div>

      {/* Hide-healthy toggle */}
      <button
        onClick={() => setHideHealthy((v) => !v)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          backgroundColor: hideHealthy ? "rgba(235,89,40,0.15)" : "#252532",
          border: `1px solid ${hideHealthy ? "rgba(235,89,40,0.4)" : "#2D2D3A"}`,
          color: hideHealthy ? "#EB5928" : "rgba(255,255,255,0.6)",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {hideHealthy ? <Eye style={{ width: 13, height: 13 }} /> : <EyeOff style={{ width: 13, height: 13 }} />}
        {hideHealthy ? "Show healthy" : "Hide healthy"}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onInit={(instance) => { rfInstanceRef.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2.5}
        nodesDraggable
      >
        <Background color="#2D2D3A" gap={28} size={1} />
        <Controls
          showInteractive={false}
          style={{ background: "#252532", border: "1px solid #2D2D3A", borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
