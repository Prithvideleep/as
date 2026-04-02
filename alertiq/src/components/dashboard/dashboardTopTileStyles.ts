import type { CSSProperties } from "react";

/** Aligns the three dashboard top-row tiles: shared min height and card chrome. */
export const DASH_TOP_TILE_MIN_HEIGHT = 272;

export const dashTopTileColumn: CSSProperties = {
  minWidth: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

export const dashTopTileShell: CSSProperties = {
  flex: 1,
  minWidth: 0,
  minHeight: DASH_TOP_TILE_MIN_HEIGHT,
  borderRadius: 14,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-card)",
  padding: "12px 14px 14px",
  display: "flex",
  flexDirection: "column",
};

/** Matches `AlertLevelBar` embedded title row. */
export const dashTopTileTitle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--color-text-primary)",
  marginBottom: 6,
  flexShrink: 0,
  lineHeight: 1.25,
};
