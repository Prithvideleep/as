/**
 * Pre–MVP redesign stored section order / collapse under this key.
 * Redesigned Home no longer uses these prefs; we clear the legacy entry once.
 */
const LEGACY_STORAGE_KEY = "alertiq-dashboard-layout-v1";

export function clearLegacyDashboardLayoutPrefs(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
