import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Clock, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  incidents,
  incidentDetails,
  alertLevelSnapshot as initialSnapshot,
  historicalAlertSnapshots,
  correlationClusters,
  recentSuspectedChanges,
} from "../data/mockData";
import type { AlertLevelSnapshot } from "../data/mockData";
import AlertLevelBar from "../components/dashboard/AlertLevelBar";
import AlertDetailsPanel, { type LevelKey } from "../components/dashboard/AlertDetailsPanel";
import ResolutionLogPanel from "../components/dashboard/ResolutionLogPanel";
import SuspectedChangesCard from "../components/dashboard/SuspectedChangesCard";
import CorrelationTile from "../components/dashboard/CorrelationTile";
import IncidentTile from "../components/dashboard/IncidentTile";
import AllIncidentsPanel from "../components/dashboard/AllIncidentsPanel";
import DashboardDetailDrawer from "../components/dashboard/DashboardDetailDrawer";
import {
  loadDashboardLayoutPrefs,
  saveDashboardLayoutPrefs,
  type DashboardSectionId,
} from "../lib/dashboardLayoutPrefs";

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  paddingLeft: 2,
  display: "block",
  marginBottom: 8,
};

const DASH_GRID_GAP = 28;
const DASH_STACK_GAP = 24;
const DASH_RAIL_WIDTH_PX = 328;
const DASH_MAX_WIDTH_PX = 1760;

const DASHBOARD_WIDE_MIN_PX = 901;
function useDashboardWideLayout() {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(min-width: ${DASHBOARD_WIDE_MIN_PX}px)`).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DASHBOARD_WIDE_MIN_PX}px)`);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

function formatDashboardClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const abs = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  const rel = diff <= 1 ? "just now" : `${diff} min ago`;
  return `${abs} · ${rel}`;
}

const SECTION_TITLES: Record<DashboardSectionId, string> = {
  correlation: "Top Alert Clusters",
  alerts: "Recent Alerts & alert level",
  impacted: "Impacted Services",
  suspectedChanges: "Suspected changes (mock)",
  resolution: "Resolution log",
  allIncidents: "All Incidents",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setSelectedIncidentId } = useAppContext();
  const dashboardWide = useDashboardWideLayout();
  const settingsRef = useRef<HTMLDivElement>(null);

  const [clusterLink, setClusterLink] = useState<{ clusterId: string; service: string } | null>(null);
  const [clusterScrollNonce, setClusterScrollNonce] = useState(0);

  const [previewIncidentId, setPreviewIncidentId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layoutPrefs, setLayoutPrefs] = useState(loadDashboardLayoutPrefs);
  const [detailLevelOpen, setDetailLevelOpen] = useState<LevelKey | null>(null);

  const linkClusterFromService = useCallback((service: string) => {
    const c = correlationClusters.find((cl) => cl.impactedL1.some((s) => s.service === service));
    if (c) {
      setClusterLink({ clusterId: c.incidentId, service });
      setClusterScrollNonce((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    if (!clusterLink) return;
    const t = window.setTimeout(() => setClusterLink(null), 10000);
    return () => window.clearTimeout(t);
  }, [clusterLink]);

  useEffect(() => {
    if (!settingsOpen) return;
    const close = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [settingsOpen]);

  const [viewOffset, setViewOffset] = useState<null | 15 | 30 | 45 | 60>(null);
  const [snapshot, setSnapshot] = useState<AlertLevelSnapshot>(initialSnapshot);
  const handleRefresh = useCallback(() => {
    setViewOffset(null);
    setSnapshot((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
  }, []);

  const activeSnapshot: AlertLevelSnapshot = useMemo(() => {
    if (viewOffset === null) return snapshot;
    return historicalAlertSnapshots.find((s) => s.offsetMinutes === viewOffset) ?? snapshot;
  }, [viewOffset, snapshot]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedIncidentId(id);
      navigate("/investigation");
    },
    [navigate, setSelectedIncidentId]
  );

  const openPreview = useCallback((id: string) => setPreviewIncidentId(id), []);

  const persistPrefs = useCallback((next: typeof layoutPrefs) => {
    setLayoutPrefs(next);
    saveDashboardLayoutPrefs(next);
  }, []);

  const toggleCollapsed = useCallback(
    (id: DashboardSectionId) => {
      persistPrefs({
        ...layoutPrefs,
        collapsed: { ...layoutPrefs.collapsed, [id]: !layoutPrefs.collapsed[id] },
      });
    },
    [layoutPrefs, persistPrefs]
  );

  const criticalLinkedServices = useMemo(() => {
    const names = new Set<string>();
    for (const inc of incidents) {
      if (inc.status === "resolved" || inc.severity !== "critical") continue;
      const d = incidentDetails[inc.id];
      if (!d) continue;
      for (const br of d.blastRadius) {
        if (br.severity === "critical" || br.severity === "high") names.add(br.service);
      }
    }
    return [...names];
  }, []);

  const impactedMultiHighlight =
    detailLevelOpen === "critical" && criticalLinkedServices.length > 0 ? criticalLinkedServices : null;

  const handleLevelOpenChange = useCallback((key: LevelKey | null) => {
    setDetailLevelOpen(key);
  }, []);

  const timeWindowNote =
    viewOffset === null
      ? "Live — header control (Live / −15–60 min) drives the Alert Level snapshot only"
      : `Snapshot −${viewOffset} min for Alert Level; other tiles stay on live data`;

  const headerDataFreshness = useMemo(
    () => formatDashboardClock(activeSnapshot.lastUpdated),
    [activeSnapshot.lastUpdated]
  );

  const impactedTileProps = {
    incidents,
    incidentDetails,
    onSelect: handleSelect,
    lastUpdated: activeSnapshot.lastUpdated,
  } as const;

  const alertLevelBlock = (
    <div>
      <span style={SECTION_LABEL}>Alert Level</span>
      <AlertLevelBar
        snapshot={activeSnapshot}
        onRefresh={viewOffset === null ? handleRefresh : undefined}
        demoteClearAndError
      />
    </div>
  );

  const resolutionLogBlock = (
    <div>
      <span style={SECTION_LABEL}>Resolution log</span>
      <ResolutionLogPanel
        incidents={incidents}
        incidentDetails={incidentDetails}
        onSelect={handleSelect}
        showToolbar
      />
    </div>
  );

  const allIncidentsBlock = (
    <div>
      <span style={SECTION_LABEL}>All Incidents</span>
      <AllIncidentsPanel incidents={incidents} incidentDetails={incidentDetails} onSelect={handleSelect} />
    </div>
  );

  const correlationBlockWide = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, order: layoutPrefs.swapCorrelationColumns ? 2 : 1 }}>
      <span style={SECTION_LABEL}>Top Alert Clusters</span>
      <CorrelationTile
        clusters={correlationClusters}
        onSelect={handleSelect}
        highlightIncidentId={clusterLink?.clusterId ?? null}
        scrollToIncidentId={clusterLink?.clusterId ?? null}
        scrollRequestNonce={clusterScrollNonce}
      />
    </div>
  );

  const alertsColumnWide = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: DASH_STACK_GAP, order: layoutPrefs.swapCorrelationColumns ? 1 : 2 }}>
      <span style={SECTION_LABEL}>Recent Alerts</span>
      <AlertDetailsPanel
        incidents={incidents}
        onSelect={handleSelect}
        onPreviewIncident={openPreview}
        onLevelOpenChange={handleLevelOpenChange}
        timeWindowNote={timeWindowNote}
        demoteLowSignalLevels
      />
      <div>
        <span style={SECTION_LABEL}>Alert Level</span>
        <AlertLevelBar
          snapshot={activeSnapshot}
          onRefresh={viewOffset === null ? handleRefresh : undefined}
          demoteClearAndError
        />
      </div>
    </div>
  );

  function SectionShell({ id, title, children }: { id: DashboardSectionId; title: string; children: ReactNode }) {
    const collapsed = layoutPrefs.collapsed[id];
    if (collapsed) {
      return (
        <div>
          <button
            type="button"
            onClick={() => toggleCollapsed(id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px dashed var(--color-border)",
              background: "var(--color-bg-card)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary)",
            }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
            Show {title}
          </button>
        </div>
      );
    }
    return <div data-section={id}>{children}</div>;
  }

  const narrowCorrelation = (
    <>
      <span style={SECTION_LABEL}>Top Alert Clusters</span>
      <CorrelationTile clusters={correlationClusters} onSelect={handleSelect} />
    </>
  );

  const narrowAlerts = (
    <>
      <span style={SECTION_LABEL}>Recent Alerts</span>
      <AlertDetailsPanel
        incidents={incidents}
        onSelect={handleSelect}
        onPreviewIncident={openPreview}
        onLevelOpenChange={handleLevelOpenChange}
        timeWindowNote={timeWindowNote}
        demoteLowSignalLevels
      />
      {alertLevelBlock}
    </>
  );

  const narrowImpacted = (
    <>
      <span style={SECTION_LABEL}>Impacted Services</span>
      <IncidentTile
        {...impactedTileProps}
        layout="default"
        highlightedService={clusterLink?.service ?? null}
        highlightedServices={impactedMultiHighlight}
        onServiceActivate={linkClusterFromService}
      />
    </>
  );

  const narrowSuspectedChanges = (
    <>
      <span style={SECTION_LABEL}>Suspected changes (mock)</span>
      <SuspectedChangesCard changes={recentSuspectedChanges} onOpenIncident={openPreview} layout="default" />
    </>
  );

  const sectionRenderers: Record<DashboardSectionId, ReactNode> = {
    correlation: narrowCorrelation,
    alerts: narrowAlerts,
    impacted: narrowImpacted,
    suspectedChanges: narrowSuspectedChanges,
    resolution: resolutionLogBlock,
    allIncidents: allIncidentsBlock,
  };

  const orderedNarrowIds = layoutPrefs.mobileOrder.filter((id) => id in sectionRenderers);

  const wideMainScroll: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "clip",
    paddingRight: 4,
    borderRight: "1px solid var(--color-border)",
    marginRight: 4,
    boxSizing: "border-box",
  };

  const wideRailFixed: React.CSSProperties = {
    width: DASH_RAIL_WIDTH_PX,
    flexShrink: 0,
    minHeight: 0,
    alignSelf: "stretch",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: DASH_STACK_GAP,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    backgroundColor: "var(--color-bg-primary)",
    paddingLeft: 8,
    marginLeft: -4,
    boxShadow: "-10px 0 24px rgba(15, 23, 42, 0.045)",
    boxSizing: "border-box",
  };

  const headerExtras = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{ position: "relative" }} ref={settingsRef}>
        <button
          type="button"
          aria-expanded={settingsOpen}
          aria-haspopup="dialog"
          onClick={() => setSettingsOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            color: "var(--color-text-secondary)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          Layout
        </button>
        {settingsOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 280,
              maxWidth: "90vw",
              padding: 14,
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-card)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              zIndex: 50,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 10px" }}>
              Dashboard layout
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={layoutPrefs.swapCorrelationColumns}
                onChange={() =>
                  persistPrefs({ ...layoutPrefs, swapCorrelationColumns: !layoutPrefs.swapCorrelationColumns })
                }
              />
              Swap correlation / alerts columns (wide)
            </label>
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: "0 0 8px" }}>Collapse sections</p>
            {(Object.keys(SECTION_TITLES) as DashboardSectionId[]).map((sid) => {
              const wideHideNote =
                dashboardWide && (sid === "correlation" || sid === "alerts")
                  ? " (narrow layout only)"
                  : "";
              return (
                <label
                  key={sid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 11,
                    cursor: dashboardWide && (sid === "correlation" || sid === "alerts") ? "not-allowed" : "pointer",
                    marginBottom: 6,
                    opacity: dashboardWide && (sid === "correlation" || sid === "alerts") ? 0.45 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={dashboardWide && (sid === "correlation" || sid === "alerts")}
                    checked={Boolean(layoutPrefs.collapsed[sid])}
                    onChange={() => toggleCollapsed(sid)}
                  />
                  {SECTION_TITLES[sid]}
                  {wideHideNote}
                </label>
              );
            })}
            <p style={{ fontSize: 10, color: "var(--color-text-muted)", margin: "12px 0 8px" }}>Mobile stack order</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                type="button"
                onClick={() =>
                  persistPrefs({
                    ...layoutPrefs,
                    mobileOrder: ["correlation", "alerts", "impacted", "suspectedChanges", "resolution", "allIncidents"],
                  })
                }
                style={{ fontSize: 11, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--color-border)", cursor: "pointer" }}
              >
                Default order (clusters first)
              </button>
              <button
                type="button"
                onClick={() =>
                  persistPrefs({
                    ...layoutPrefs,
                    mobileOrder: ["alerts", "correlation", "impacted", "suspectedChanges", "resolution", "allIncidents"],
                  })
                }
                style={{ fontSize: 11, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--color-border)", cursor: "pointer" }}
              >
                Alerts first (mobile)
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Clock style={{ width: 12, height: 12, color: "var(--color-text-muted)", flexShrink: 0 }} aria-hidden />
        <select
          aria-label="Alert level time window"
          value={viewOffset === null ? "live" : String(viewOffset)}
          onChange={(e) => {
            const val = e.target.value;
            setViewOffset(val === "live" ? null : (Number(val) as 15 | 30 | 45 | 60));
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
            color: viewOffset !== null ? "#818CF8" : "var(--color-text-secondary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            outline: "none",
            minWidth: 132,
          }}
        >
          <option value="live">Live</option>
          <option value="15">–15 min</option>
          <option value="30">–30 min</option>
          <option value="45">–45 min</option>
          <option value="60">–60 min</option>
        </select>
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 14px",
          borderRadius: 10,
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          color: "var(--color-text-secondary)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(235,89,40,0.4)";
          (e.currentTarget as HTMLButtonElement).style.color = "#EB5928";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
        }}
      >
        <RefreshCw style={{ width: 13, height: 13 }} />
        Refresh
      </button>
    </div>
  );

  const previewDetail = previewIncidentId ? incidentDetails[previewIncidentId] ?? null : null;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "var(--page-pad)",
      }}
    >
      <DashboardDetailDrawer
        open={Boolean(previewIncidentId && previewDetail)}
        incidentId={previewIncidentId}
        detail={previewDetail}
        onClose={() => setPreviewIncidentId(null)}
        onOpenInvestigation={(id) => {
          handleSelect(id);
          setPreviewIncidentId(null);
        }}
      />

      {dashboardWide ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            gap: DASH_GRID_GAP,
            maxWidth: DASH_MAX_WIDTH_PX,
            margin: "0 auto",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          <div style={wideMainScroll}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}
            >
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Alert IQ Dashboard
                </h1>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                  Real-time AI-grouped alert intelligence and cluster monitoring
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>
                  <strong style={{ color: "var(--color-text-secondary)" }}>Data freshness (alert level):</strong> {headerDataFreshness}
                </p>
              </div>
              {headerExtras}
            </motion.div>

            <AnimatePresence>
              {viewOffset !== null && (
                <motion.div
                  key="past-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    marginBottom: 16,
                    borderRadius: 10,
                    backgroundColor: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    fontSize: 12,
                    color: "#A5B4FC",
                    fontWeight: 600,
                  }}
                >
                  <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
                  Viewing Alert Level snapshot from <strong style={{ color: "#818CF8" }}>{viewOffset} minutes ago</strong>.
                  &nbsp;Other cards reflect current live data.
                  <button
                    type="button"
                    onClick={() => setViewOffset(null)}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#818CF8",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 6,
                    }}
                  >
                    Back to Live
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: DASH_STACK_GAP, minWidth: 0 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: DASH_STACK_GAP,
                  alignItems: "start",
                  minWidth: 0,
                }}
              >
                {correlationBlockWide}
                {alertsColumnWide}
              </div>

              <SectionShell id="allIncidents" title={SECTION_TITLES.allIncidents}>
                {allIncidentsBlock}
              </SectionShell>
            </motion.div>
          </div>

          <aside style={wideRailFixed} aria-label="Dashboard context">
            <SectionShell id="impacted" title={SECTION_TITLES.impacted}>
              <div style={{ flexShrink: 0, width: "100%" }}>
                <span style={SECTION_LABEL}>Impacted Services</span>
                <IncidentTile
                  {...impactedTileProps}
                  layout="sidebar"
                  highlightedService={clusterLink?.service ?? null}
                  highlightedServices={impactedMultiHighlight}
                  onServiceActivate={linkClusterFromService}
                />
              </div>
            </SectionShell>
            <SectionShell id="suspectedChanges" title={SECTION_TITLES.suspectedChanges}>
              <div style={{ width: "100%", flexShrink: 0 }}>
                <span style={SECTION_LABEL}>Suspected changes (mock)</span>
                <SuspectedChangesCard
                  changes={recentSuspectedChanges}
                  onOpenIncident={openPreview}
                  layout="sidebar"
                />
              </div>
            </SectionShell>
            <SectionShell id="resolution" title={SECTION_TITLES.resolution}>
              <div style={{ width: "100%", flexShrink: 0 }}>
                <span style={SECTION_LABEL}>Resolution log</span>
                <ResolutionLogPanel
                  incidents={incidents}
                  incidentDetails={incidentDetails}
                  onSelect={handleSelect}
                  layout="sidebar"
                  showToolbar={false}
                />
              </div>
            </SectionShell>
          </aside>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <div style={{ maxWidth: DASH_MAX_WIDTH_PX, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}
            >
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Alert IQ Dashboard
                </h1>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                  Real-time AI-grouped alert intelligence and cluster monitoring
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: 0 }}>
                  <strong style={{ color: "var(--color-text-secondary)" }}>Data freshness (alert level):</strong>{" "}
                  {headerDataFreshness}
                </p>
              </div>
              {headerExtras}
            </motion.div>

            <AnimatePresence>
              {viewOffset !== null && (
                <motion.div
                  key="past-banner-narrow"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    marginBottom: 16,
                    borderRadius: 10,
                    backgroundColor: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    fontSize: 12,
                    color: "#A5B4FC",
                    fontWeight: 600,
                  }}
                >
                  <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
                  Viewing Alert Level snapshot from <strong style={{ color: "#818CF8" }}>{viewOffset} minutes ago</strong>.
                  &nbsp;Other cards reflect current live data.
                  <button
                    type="button"
                    onClick={() => setViewOffset(null)}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#818CF8",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 6,
                    }}
                  >
                    Back to Live
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: DASH_STACK_GAP }}
            >
              {orderedNarrowIds.map((sid) => (
                <SectionShell key={sid} id={sid} title={SECTION_TITLES[sid]}>
                  {sectionRenderers[sid]}
                </SectionShell>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
