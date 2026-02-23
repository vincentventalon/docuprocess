/**
 * Ghost overlay system for repeating sections with column split.
 *
 * Renders faded copies of the first column's content into ghost columns
 * directly in the canvas iframe DOM (not in the GrapeJS component tree).
 */

const GHOST_CONTAINER_CLASS = "repeat-ghost-container";
const GHOST_COLUMN_CLASS = "repeat-ghost-column";
const GHOST_DIVIDER_CLASS = "repeat-column-divider";
const GHOST_STYLE_ID = "repeat-ghost-styles";

/**
 * Inject ghost overlay CSS into the canvas iframe.
 */
function ensureGhostStyles(doc: Document): void {
  if (doc.getElementById(GHOST_STYLE_ID)) return;

  const style = doc.createElement("style");
  style.id = GHOST_STYLE_ID;
  style.textContent = `
    .${GHOST_CONTAINER_CLASS} {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    .${GHOST_COLUMN_CLASS} {
      position: absolute;
      top: 0;
      height: 100%;
      background: rgba(148, 163, 184, 0.15);
      pointer-events: none;
      overflow: hidden;
    }
    .repeat-ghost-column-content {
      opacity: 0.25;
      filter: grayscale(50%);
    }
    .${GHOST_DIVIDER_CLASS} {
      position: absolute;
      top: 0;
      width: 0;
      height: 100%;
      border-left: 1px dashed rgba(99, 102, 241, 0.5);
      pointer-events: none;
      z-index: 1;
    }
  `;
  doc.head.appendChild(style);
}

/**
 * Remove the ghost overlay from a section's DOM element.
 */
function removeGhostOverlay(sectionEl: HTMLElement): void {
  const existing = sectionEl.querySelector(`.${GHOST_CONTAINER_CLASS}`);
  if (existing) existing.remove();
}

/**
 * Update (or create) the ghost overlay for a repeating section.
 */
function updateGhostOverlay(editor: any, sectionComponent: any): void {
  const sectionEl = sectionComponent.getEl?.() as HTMLElement | null;
  if (!sectionEl) return;

  const attrs = sectionComponent.getAttributes?.() || {};
  const columns = parseInt(attrs["data-repeat-columns"] || "1", 10);

  // Remove existing overlay
  removeGhostOverlay(sectionEl);

  // No ghost needed for single column
  if (columns <= 1) return;

  // Ensure CSS is in the iframe
  const doc = sectionEl.ownerDocument;
  if (!doc) return;
  ensureGhostStyles(doc);

  const sectionWidth = sectionEl.offsetWidth;
  const columnWidth = sectionWidth / columns;

  // Create ghost container
  const container = doc.createElement("div");
  container.className = GHOST_CONTAINER_CLASS;

  // Collect content elements to clone (skip the ghost container itself)
  const contentChildren = Array.from(sectionEl.children).filter(
    (child) => !child.classList.contains(GHOST_CONTAINER_CLASS)
  );

  // Create ghost columns (index 1 to columns-1)
  for (let colIdx = 1; colIdx < columns; colIdx++) {
    const ghostCol = doc.createElement("div");
    ghostCol.className = GHOST_COLUMN_CLASS;
    ghostCol.style.left = `${colIdx * columnWidth}px`;
    ghostCol.style.width = `${columnWidth}px`;

    // Clone content into a faded inner wrapper (background stays full opacity)
    const contentWrapper = doc.createElement("div");
    contentWrapper.className = "repeat-ghost-column-content";
    for (const child of contentChildren) {
      contentWrapper.appendChild(child.cloneNode(true));
    }
    ghostCol.appendChild(contentWrapper);

    container.appendChild(ghostCol);
  }

  // Create column dividers
  for (let colIdx = 1; colIdx < columns; colIdx++) {
    const divider = doc.createElement("div");
    divider.className = GHOST_DIVIDER_CLASS;
    divider.style.left = `${colIdx * columnWidth}px`;
    container.appendChild(divider);
  }

  sectionEl.appendChild(container);
}

/**
 * Check if a component is a repeating section (has columns > 1 or a repeat source).
 */
function isRepeatSection(component: any): boolean {
  const attrs = component?.getAttributes?.() || {};
  return !!attrs["data-repeat-source"] ||
    parseInt(attrs["data-repeat-columns"] || "1", 10) > 1;
}

/**
 * Find the parent repeating section of a component, if any.
 */
function findParentRepeatSection(component: any): any | null {
  let parent = typeof component?.parent === "function"
    ? component.parent()
    : component?.parent;

  while (parent) {
    if (parent.get?.("type") === "section" && isRepeatSection(parent)) {
      return parent;
    }
    parent = typeof parent?.parent === "function" ? parent.parent() : parent?.parent;
  }
  return null;
}

/**
 * Refresh all ghost overlays in the editor.
 */
function refreshAllGhosts(editor: any): void {
  if (!editor?.getWrapper) return;
  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  const sections = wrapper.components?.()?.models || [];
  for (const section of sections) {
    if (section.get?.("type") === "section") {
      // Always call update — it removes the ghost when columns <= 1
      updateGhostOverlay(editor, section);
    }
  }
}

/**
 * Setup ghost sync listeners on the editor.
 * Call this once during component registration.
 */
export function setupGhostSync(editor: any): void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;
  let isReady = false;

  // Wait for editor to be fully ready (wrapper available)
  const waitForReady = (callback: () => void) => {
    if (destroyed) return;
    const wrapper = editor.getWrapper?.();
    if (wrapper) {
      isReady = true;
      callback();
    } else {
      // Retry after a short delay
      setTimeout(() => waitForReady(callback), 50);
    }
  };

  const scheduleRefresh = () => {
    if (destroyed || !isReady) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (destroyed || !isReady) return;
      try {
        refreshAllGhosts(editor);
      } catch {
        // Editor may be torn down during hot-reload / navigation
      }
    }, 100);
  };

  // Cancel pending refreshes when editor is destroyed
  editor.on("destroy", () => {
    destroyed = true;
    isReady = false;
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  // Refresh when components change inside sections
  // For sections themselves, always refresh (needed to clean up ghosts when repeat is turned off)
  editor.on("component:update", (component: any) => {
    if (!isReady) return;
    if (component.get?.("type") === "section" || findParentRepeatSection(component) || isRepeatSection(component)) {
      scheduleRefresh();
    }
  });

  editor.on("component:add", (component: any) => {
    if (!isReady) return;
    if (findParentRepeatSection(component)) {
      scheduleRefresh();
    }
  });

  editor.on("component:remove", (component: any) => {
    if (!isReady) return;
    // After removal, parent reference may be gone — refresh all
    scheduleRefresh();
  });

  editor.on("component:styleUpdate", (component: any) => {
    if (!isReady) return;
    if (findParentRepeatSection(component) || isRepeatSection(component)) {
      scheduleRefresh();
    }
  });

  // Refresh on canvas load/frame changes
  editor.on("canvas:frame:load", () => {
    waitForReady(() => refreshAllGhosts(editor));
  });

  // Initial refresh after editor loads
  editor.on("load", () => {
    waitForReady(() => refreshAllGhosts(editor));
  });
}
