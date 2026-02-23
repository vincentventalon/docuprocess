export const PAGE_FORMATS = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "Letter", "Legal", "Tabloid"] as const;

export type PageFormat = (typeof PAGE_FORMATS)[number];
export type PageOrientation = "portrait" | "landscape";

// Note: Called "PagePadding" internally (represents body padding/content spacing)
// but shown as "Page Margins" in UI for user familiarity
export interface PagePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageSettings {
  format: PageFormat;
  orientation: PageOrientation;
  padding: PagePadding;
}

export const DEFAULT_PAGE_PADDING: PagePadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  format: "A4",
  orientation: "portrait",
  padding: DEFAULT_PAGE_PADDING,
};

export const PAGE_DIMENSIONS_MM: Record<PageFormat, { width: number; height: number }> = {
  A0: { width: 841, height: 1189 },
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 },
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  Tabloid: { width: 279, height: 432 },
};

export function clampPadding(padding?: Partial<PagePadding>): PagePadding {
  const merged = { ...DEFAULT_PAGE_PADDING, ...padding };
  return {
    top: Math.max(0, merged.top),
    right: Math.max(0, merged.right),
    bottom: Math.max(0, merged.bottom),
    left: Math.max(0, merged.left),
  };
}

export function pageSettingsToCss(settings: PageSettings): string {
  const paddingString = `${settings.padding.top}mm ${settings.padding.right}mm ${settings.padding.bottom}mm ${settings.padding.left}mm`;
  return `@page {
  size: ${settings.format} ${settings.orientation};
  margin: ${paddingString};
}

body {
  margin: 0;
  padding: 0;
}`;
}

