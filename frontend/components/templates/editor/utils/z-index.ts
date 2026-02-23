/**
 * Z-index based z-order management utilities
 *
 * Uses a z-order list stored on containers as the source of truth.
 * The list is an array of component IDs ordered from back (index 0) to front (last index).
 * CSS z-index values are synced from this list.
 */

// Debug logging (set to true to enable)
const DEBUG_ZINDEX = false;
const zLog = {
  log: (...args: any[]) => DEBUG_ZINDEX && console.log('[z-index]', ...args),
  warn: (...args: any[]) => DEBUG_ZINDEX && console.warn('[z-index]', ...args),
};

/**
 * Get component ID for z-order list
 */
function getComponentId(component: any): string {
  return component?.getId?.() || component?.cid || '';
}

/**
 * Get component name for logging
 */
function getComponentLabel(component: any): string {
  const type = component?.get?.('type') || 'unknown';
  const customName = component?.get?.('custom-name');
  const content = component?.get?.('content')?.substring?.(0, 20) || '';
  return customName || `${type}${content ? `: "${content}"` : ''}`;
}

/**
 * Check if a component should have its z-index managed.
 * Excludes containers and table structure elements.
 */
export function shouldManageZIndex(component: any): boolean {
  if (!component) return false;

  const type = component.get?.('type');

  // Exclude containers (section, header, footer, page, wrapper)
  if (['section', 'header', 'footer', 'page', 'wrapper'].includes(type)) {
    return false;
  }

  // Exclude table structure elements
  const tagName = component.get?.('tagName')?.toLowerCase?.();
  if (['table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th'].includes(tagName)) {
    return false;
  }

  // Verify that the parent is a z-stack container
  const parent = component.parent?.();
  const parentType = parent?.get?.('type');
  return parentType === 'section' || parentType === 'header' || parentType === 'footer';
}

/**
 * Check if a component is a z-stack container (section, header, footer)
 */
function isZStackContainer(component: any): boolean {
  const type = component?.get?.('type');
  return type === 'section' || type === 'header' || type === 'footer';
}

/**
 * Get the z-order list from a container.
 * Returns array of component IDs from back (index 0) to front (last index).
 */
export function getZOrderList(container: any): string[] {
  if (!isZStackContainer(container)) return [];
  return container.get?.('zOrderList') || [];
}

/**
 * Set the z-order list on a container.
 */
function setZOrderList(container: any, list: string[]): void {
  if (!isZStackContainer(container)) return;
  zLog.log(`setZOrderList on ${getComponentLabel(container)}:`, list);
  container.set?.('zOrderList', [...list]);
}

/**
 * Sync CSS z-index values from the z-order list.
 * This is called after any z-order change to apply the actual CSS.
 */
export function syncZIndexFromList(container: any): void {
  if (!isZStackContainer(container)) return;

  const zOrderList = getZOrderList(container);
  const children = container?.components?.()?.models || [];

  zLog.log(`syncZIndexFromList for ${getComponentLabel(container)}, list:`, zOrderList);

  // Build a map of ID -> position in z-order list
  const positionMap = new Map<string, number>();
  zOrderList.forEach((id, index) => {
    positionMap.set(id, index + 1); // z-index starts at 1
  });

  // Apply z-index to each managed child
  children.forEach((child: any) => {
    if (!shouldManageZIndex(child)) return;

    const id = getComponentId(child);
    const zIndex = positionMap.get(id);

    if (zIndex !== undefined) {
      child.addStyle?.({ 'z-index': String(zIndex) });
    } else {
      // Component not in list - add it at the end (front)
      zLog.log(`syncZIndexFromList: ${getComponentLabel(child)} not in list, adding to front`);
      const newZ = zOrderList.length + 1;
      child.addStyle?.({ 'z-index': String(newZ) });
    }
  });
}

/**
 * Initialize z-order list for a container based on current DOM order.
 * Used for backward compatibility with templates that don't have a z-order list.
 */
export function initializeZOrderList(container: any): void {
  if (!isZStackContainer(container)) return;

  const existingList = getZOrderList(container);
  const children = container?.components?.()?.models || [];
  const managedChildren = children.filter(shouldManageZIndex);

  // If list already exists and has same components, keep it
  if (existingList.length > 0) {
    const existingSet = new Set(existingList);
    const currentIds = managedChildren.map(getComponentId);
    const allPresent = currentIds.every((id: string) => existingSet.has(id));

    if (allPresent && existingList.length === currentIds.length) {
      zLog.log(`initializeZOrderList: ${getComponentLabel(container)} already has valid list`);
      syncZIndexFromList(container);
      return;
    }
  }

  // Build list from current z-index values or DOM order
  const withZIndex = managedChildren.map((child: any) => ({
    id: getComponentId(child),
    zIndex: parseInt(child.getStyle?.()?.['z-index'] || '0', 10) || 0,
  }));

  // Sort by z-index (ascending: lowest first = back)
  withZIndex.sort((a: any, b: any) => a.zIndex - b.zIndex);

  const newList = withZIndex.map((item: any) => item.id);
  zLog.log(`initializeZOrderList: ${getComponentLabel(container)} creating list:`, newList);

  setZOrderList(container, newList);
  syncZIndexFromList(container);
}

/**
 * Initialize z-order lists for all containers in the editor.
 * Called on editor load for backward compatibility.
 */
export function initializeAllZIndexes(editor: any): void {
  const wrapper = editor?.getWrapper?.();
  const containers = wrapper?.components?.()?.models || [];

  containers.forEach((c: any) => {
    if (isZStackContainer(c)) {
      initializeZOrderList(c);
    }
  });
}

/**
 * Add a new component to the z-order list (at the front/top).
 */
export function addToZOrderList(component: any): void {
  if (!shouldManageZIndex(component)) return;

  const parent = component.parent?.();
  if (!isZStackContainer(parent)) return;

  const id = getComponentId(component);
  const list = getZOrderList(parent);

  // Check if already in list
  if (list.includes(id)) {
    zLog.log(`addToZOrderList: ${getComponentLabel(component)} already in list`);
    return;
  }

  // Add to end (front)
  const newList = [...list, id];
  zLog.log(`addToZOrderList: ${getComponentLabel(component)} added to front`);
  setZOrderList(parent, newList);
  syncZIndexFromList(parent);
}

/**
 * Remove a component from the z-order list.
 */
export function removeFromZOrderList(component: any, parent: any): void {
  if (!isZStackContainer(parent)) return;

  const id = getComponentId(component);
  const list = getZOrderList(parent);

  const newList = list.filter((itemId: string) => itemId !== id);
  if (newList.length !== list.length) {
    zLog.log(`removeFromZOrderList: ${getComponentLabel(component)} removed`);
    setZOrderList(parent, newList);
    syncZIndexFromList(parent);
  }
}

/**
 * Move a component to a specific position in the z-order list.
 */
export function moveInZOrderList(component: any, targetComponent: any, position: 'before' | 'after'): void {
  if (!shouldManageZIndex(component) || !shouldManageZIndex(targetComponent)) return;

  const parent = component.parent?.();
  if (!isZStackContainer(parent)) return;

  const id = getComponentId(component);
  const targetId = getComponentId(targetComponent);
  let list = getZOrderList(parent);

  // Remove component from current position
  list = list.filter((itemId: string) => itemId !== id);

  // Find target position
  const targetIndex = list.indexOf(targetId);
  if (targetIndex === -1) {
    zLog.warn(`moveInZOrderList: target ${targetId} not found in list`);
    return;
  }

  // Insert at new position
  // "before" in UI (above) = higher z-index = after in list (toward front)
  // "after" in UI (below) = lower z-index = before in list (toward back)
  const insertIndex = position === 'before' ? targetIndex + 1 : targetIndex;
  list.splice(insertIndex, 0, id);

  zLog.log(`moveInZOrderList: ${getComponentLabel(component)} ${position} ${getComponentLabel(targetComponent)}, new list:`, list);
  setZOrderList(parent, list);
  syncZIndexFromList(parent);
}

/**
 * Bring a component to the front (highest z-index).
 */
export function bringToFront(component: any): void {
  if (!shouldManageZIndex(component)) return;

  const parent = component.parent?.();
  if (!isZStackContainer(parent)) return;

  const id = getComponentId(component);
  let list = getZOrderList(parent);

  // Remove from current position
  list = list.filter((itemId: string) => itemId !== id);

  // Add to end (front)
  list.push(id);

  zLog.log(`bringToFront: ${getComponentLabel(component)}`);
  setZOrderList(parent, list);
  syncZIndexFromList(parent);
}

/**
 * Send a component to the back (lowest z-index).
 */
export function sendToBack(component: any): void {
  if (!shouldManageZIndex(component)) return;

  const parent = component.parent?.();
  if (!isZStackContainer(parent)) return;

  const id = getComponentId(component);
  let list = getZOrderList(parent);

  // Remove from current position
  list = list.filter((itemId: string) => itemId !== id);

  // Add to beginning (back)
  list.unshift(id);

  zLog.log(`sendToBack: ${getComponentLabel(component)}`);
  setZOrderList(parent, list);
  syncZIndexFromList(parent);
}

/**
 * Get siblings sorted by z-order (front to back for display in layers panel).
 * Uses the z-order list as the source of truth.
 */
export function getSiblingsSortedByZIndex(parent: any): any[] {
  const children = parent?.components?.()?.models || [];

  if (!isZStackContainer(parent)) {
    return children;
  }

  const list = getZOrderList(parent);
  const idToComponent = new Map<string, any>();

  children.forEach((child: any) => {
    idToComponent.set(getComponentId(child), child);
  });

  // Build sorted array based on z-order list (reversed: front first for display)
  const sorted: any[] = [];
  for (let i = list.length - 1; i >= 0; i--) {
    const comp = idToComponent.get(list[i]);
    if (comp) {
      sorted.push(comp);
      idToComponent.delete(list[i]);
    }
  }

  // Add any components not in the list (shouldn't happen, but safety)
  idToComponent.forEach((comp) => {
    sorted.push(comp);
  });

  return sorted;
}

// Keep these for backward compatibility with LayersList.tsx
export function moveToZIndex(component: any, targetComponent: any, position: 'before' | 'after'): void {
  moveInZOrderList(component, targetComponent, position);
}

// Legacy function - now we use addToZOrderList
export function assignZIndexToNewComponent(component: any): void {
  addToZOrderList(component);
}
