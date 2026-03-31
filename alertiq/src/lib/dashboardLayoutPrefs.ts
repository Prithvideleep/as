const STORAGE_KEY = "alertiq-dashboard-layout-v1";

export type DashboardSectionId =
  | "correlation"
  | "alerts"
  | "impacted"
  | "suspectedChanges"
  | "resolution"
  | "allIncidents";

const KNOWN_SECTIONS: DashboardSectionId[] = [
  "correlation",
  "alerts",
  "impacted",
  "suspectedChanges",
  "resolution",
  "allIncidents",
];

export interface DashboardLayoutPrefs {
  /** Narrow / stacked layout section order (top to bottom). */
  mobileOrder: DashboardSectionId[];
  collapsed: Partial<Record<DashboardSectionId, boolean>>;
  /** Wide layout: swap correlation vs alerts+level in the 2-col grid. */
  swapCorrelationColumns: boolean;
}

const DEFAULT_PREFS: DashboardLayoutPrefs = {
  mobileOrder: ["correlation", "alerts", "impacted", "suspectedChanges", "resolution", "allIncidents"],
  collapsed: {},
  swapCorrelationColumns: false,
};

function normalizeMobileOrder(raw: unknown): DashboardSectionId[] {
  const valid = new Set<string>(KNOWN_SECTIONS);
  let order =
    Array.isArray(raw) && raw.length
      ? (raw.filter((x) => typeof x === "string" && valid.has(x)) as DashboardSectionId[])
      : [...DEFAULT_PREFS.mobileOrder];
  if (order.length === 0) order = [...DEFAULT_PREFS.mobileOrder];
  if (!order.includes("suspectedChanges")) {
    const i = order.indexOf("impacted");
    order =
      i >= 0
        ? [...order.slice(0, i + 1), "suspectedChanges", ...order.slice(i + 1)]
        : [...DEFAULT_PREFS.mobileOrder];
  }
  for (const id of KNOWN_SECTIONS) {
    if (!order.includes(id)) order.push(id);
  }
  const seen = new Set<DashboardSectionId>();
  return order.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function loadDashboardLayoutPrefs(): DashboardLayoutPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS, mobileOrder: [...DEFAULT_PREFS.mobileOrder], collapsed: {} };
    const p = JSON.parse(raw) as Partial<DashboardLayoutPrefs>;
    return {
      mobileOrder: normalizeMobileOrder(p.mobileOrder),
      collapsed: typeof p.collapsed === "object" && p.collapsed !== null ? p.collapsed : {},
      swapCorrelationColumns: Boolean(p.swapCorrelationColumns),
    };
  } catch {
    return { ...DEFAULT_PREFS, mobileOrder: [...DEFAULT_PREFS.mobileOrder], collapsed: {} };
  }
}

export function saveDashboardLayoutPrefs(prefs: DashboardLayoutPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}
