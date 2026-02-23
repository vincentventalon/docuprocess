import { useEffect, useState, useCallback, useRef } from "react";
import type { DragEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayerItem, LayerData } from "./LayerItem";
import {
  shouldManageZIndex,
  getSiblingsSortedByZIndex,
  bringToFront,
  sendToBack,
  moveToZIndex,
} from "../../utils/z-index";

interface LayersListProps {
  editor: any;
}

function getComponentId(component: any): string {
  return component.cid || component.getId?.() || String(Math.random());
}

function getTextContent(component: any): string | null {
  // Try to get text content from the component
  const content = component.get?.("content") || "";
  if (content) {
    // Strip HTML tags and get plain text
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text) return text;
  }

  // Try getting inner text from the view's element
  const el = component.view?.el;
  if (el) {
    const text = el.textContent?.trim();
    if (text) return text;
  }

  // Try getting from components (nested text)
  const children = component.components?.()?.models || [];
  for (const child of children) {
    const childText = getTextContent(child);
    if (childText) return childText;
  }

  return null;
}

function getComponentName(component: any): string {
  const customName = component.get("custom-name");
  if (customName) return customName;

  const attrs = component.getAttributes?.() || {};
  if (attrs["data-layer-name"]) return attrs["data-layer-name"];

  const type = component.get("type");
  const tagName = component.get("tagName")?.toLowerCase();

  if (type === "header") return "Header";
  if (type === "footer") return "Footer";
  if (type === "section") return "Section";
  if (type === "image") return "Image";
  if (type === "table") return "Table";
  if (type === "barcode") return "Barcode";
  if (type === "qrcode") return "QR Code";
  if (type === "shape-line") return "Line";
  if (type === "shape-circle") return "Circle";
  if (type === "shape-rectangle") return "Rectangle";

  // For text elements, show preview of actual content
  if (type === "text" || type === "div" || tagName === "div") {
    const text = getTextContent(component);
    if (text) {
      // Truncate to reasonable length for layer name
      const maxLen = 25;
      return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
    }
    return "Empty";
  }

  return type || tagName || "Element";
}

function getComponentType(component: any): string {
  const type = component.get("type");
  if (type) return type;
  const tagName = component.get("tagName")?.toLowerCase();
  if (tagName === "div") return "text";
  return tagName || "element";
}

function shouldShowComponent(component: any): boolean {
  const type = component.get("type");
  const tagName = component.get("tagName")?.toLowerCase();

  const visibleTypes = ["header", "footer", "section", "text", "image", "table", "barcode", "qrcode", "div", "shape-line", "shape-circle", "shape-rectangle"];
  if (visibleTypes.includes(type)) return true;

  // Hide table internal elements
  const hiddenTags = ["tr", "td", "th", "tbody", "thead", "tfoot"];
  if (hiddenTags.includes(tagName)) return false;

  return false;
}

function buildLayerTree(
  component: any,
  depth: number,
  parentId: string | null
): LayerData | null {
  if (!shouldShowComponent(component)) return null;

  const id = getComponentId(component);
  const type = getComponentType(component);

  // For z-stack containers, sort children by z-index (descending) instead of DOM order
  // This makes the layers panel show elements in visual stacking order (top = front)
  const isZStackContainer = type === "section" || type === "header" || type === "footer";
  const children = isZStackContainer
    ? getSiblingsSortedByZIndex(component)
    : component.components?.()?.models || [];

  const childLayers: LayerData[] = [];
  children.forEach((child: any) => {
    const childLayer = buildLayerTree(child, depth + 1, id);
    if (childLayer) {
      childLayers.push(childLayer);
    }
  });

  // NOTE: No more childLayers.reverse() - z-index sorting handles the order

  return {
    id,
    name: getComponentName(component),
    type: getComponentType(component),
    component,
    children: childLayers,
    depth,
    parentId,
  };
}

// Flatten the tree into a map for quick lookup
function buildLayerMap(layers: LayerData[]): Map<string, LayerData> {
  const map = new Map<string, LayerData>();

  function traverse(layer: LayerData) {
    map.set(layer.id, layer);
    layer.children.forEach(traverse);
  }

  layers.forEach(traverse);
  return map;
}

export function LayersList({ editor }: LayersListProps) {
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [layerMap, setLayerMap] = useState<Map<string, LayerData>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const draggedIdRef = useRef<string | null>(null);
  const [dragState, setDragState] = useState<{
    draggedId: string | null;
    overId: string | null;
    position: "before" | "after" | "inside" | null;
  }>({
    draggedId: null,
    overId: null,
    position: null,
  });

  const syncLayers = useCallback(() => {
    if (!editor) return;

    const wrapper = editor.getWrapper();
    if (!wrapper) return;

    const components = wrapper.components?.()?.models || [];
    const childLayers: LayerData[] = [];

    components.forEach((comp: any) => {
      const layer = buildLayerTree(comp, 1, "page"); // depth 1, parent is "page"
      if (layer) {
        childLayers.push(layer);
      }
    });

    // Don't reverse page-level children (header, sections, footer) - they represent
    // document position (top to bottom), not z-stacking. Z-order reversal happens
    // inside buildLayerTree for elements within sections.

    // Create Page layer at the top with all other layers as children
    const pageLayer: LayerData = {
      id: "page",
      name: "Page",
      type: "page",
      component: wrapper,
      children: childLayers,
      depth: 0,
      parentId: null,
    };

    const layerList = [pageLayer];
    setLayers(layerList);
    setLayerMap(buildLayerMap(layerList));
  }, [editor]);

  // Auto-expand containers with children on initial load
  const initialExpandDone = useRef(false);
  useEffect(() => {
    if (initialExpandDone.current || layers.length === 0) return;

    const toExpand = new Set<string>();
    function collectExpandable(layerList: LayerData[]) {
      layerList.forEach((layer) => {
        if (layer.children.length > 0) {
          toExpand.add(layer.id);
          collectExpandable(layer.children);
        }
      });
    }
    collectExpandable(layers);

    if (toExpand.size > 0) {
      setExpandedIds(toExpand);
      initialExpandDone.current = true;
    }
  }, [layers]);

  useEffect(() => {
    if (!editor) return;

    syncLayers();

    const handleChange = () => syncLayers();
    const handleSelected = (comp: any) => {
      setSelectedId(comp?.cid || comp?.getId?.() || null);
    };
    const handleDeselected = () => {
      setSelectedId(null);
    };

    editor.on("component:add", handleChange);
    editor.on("component:remove", handleChange);
    editor.on("component:update", handleChange);
    editor.on("component:selected", handleSelected);
    editor.on("component:deselected", handleDeselected);

    const selected = editor.getSelected?.();
    if (selected) {
      setSelectedId(selected.cid || selected.getId?.() || null);
    }

    return () => {
      editor.off("component:add", handleChange);
      editor.off("component:remove", handleChange);
      editor.off("component:update", handleChange);
      editor.off("component:selected", handleSelected);
      editor.off("component:deselected", handleDeselected);
    };
  }, [editor, syncLayers]);

  const handleToggleExpand = useCallback((layerId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (layer: LayerData) => {
      if (editor && layer.component) {
        editor.select(layer.component);
      }
    },
    [editor]
  );

  const handleRename = useCallback(
    (layer: LayerData, newName: string) => {
      if (layer.component) {
        layer.component.set("custom-name", newName);
        syncLayers();
      }
    },
    [syncLayers]
  );

  const handleDuplicate = useCallback(
    (layer: LayerData) => {
      if (!layer.component || !editor) return;

      const parent = layer.component.parent?.();
      if (!parent) return;

      const components = parent.components?.();
      if (!components) return;

      const index = components.indexOf(layer.component);
      const clone = layer.component.clone();

      const originalName = getComponentName(layer.component);
      clone.set("custom-name", `${originalName} (copy)`);

      parent.append(clone, { at: index + 1 });
    },
    [editor]
  );

  const handleDelete = useCallback((layer: LayerData) => {
    if (layer.component) {
      layer.component.remove();
    }
  }, []);

  const handleBringToFront = useCallback((layer: LayerData) => {
    bringToFront(layer.component);
    syncLayers();
  }, [syncLayers]);

  const handleSendToBack = useCallback((layer: LayerData) => {
    sendToBack(layer.component);
    syncLayers();
  }, [syncLayers]);

  // Check if z-order controls should be shown for this layer
  // Z-order only applies to elements INSIDE sections/header/footer, not at page level
  const canReorderLayer = useCallback((layer: LayerData): boolean => {
    return shouldManageZIndex(layer.component);
  }, []);

  const resetDragState = useCallback(() => {
    draggedIdRef.current = null;
    setDragState({
      draggedId: null,
      overId: null,
      position: null,
    });
  }, []);

  // Check if dragging is allowed for this layer
  const canDrag = useCallback((layer: LayerData) => {
    // Don't allow dragging header/footer/page
    if (layer.type === "header" || layer.type === "footer" || layer.type === "page") return false;
    return true;
  }, []);

  // Check if a layer can accept drops (containers only)
  const canAcceptDrop = useCallback((layer: LayerData) => {
    return layer.type === "section" || layer.type === "header" || layer.type === "footer";
  }, []);

  const handleDragStart = useCallback(
    (layer: LayerData) => (event: DragEvent<HTMLDivElement>) => {
      if (!canDrag(layer)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", layer.id);
      draggedIdRef.current = layer.id;
      setDragState({
        draggedId: layer.id,
        overId: null,
        position: null,
      });
    },
    [canDrag]
  );

  const handleDragOver = useCallback(
    (layer: LayerData) => (event: DragEvent<HTMLDivElement>) => {
      const draggedId = draggedIdRef.current;
      if (!draggedId || draggedId === layer.id) return;

      // Prevent dropping into own children
      const draggedLayer = layerMap.get(draggedId);
      if (draggedLayer) {
        let current: LayerData | undefined = layer;
        while (current) {
          if (current.id === draggedId) return;
          current = current.parentId ? layerMap.get(current.parentId) : undefined;
        }
      }

      event.preventDefault();

      const rect = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const height = rect.height;

      let position: "before" | "after" | "inside";

      // For containers, allow dropping inside
      if (canAcceptDrop(layer)) {
        if (offsetY < height * 0.25) {
          position = "before";
        } else if (offsetY > height * 0.75) {
          position = "after";
        } else {
          position = "inside";
        }
      } else {
        // For non-containers, only before/after
        position = offsetY < height / 2 ? "before" : "after";
      }

      setDragState((prev) => ({
        ...prev,
        overId: layer.id,
        position,
      }));
    },
    [canAcceptDrop, layerMap]
  );

  const handleDrop = useCallback(
    (layer: LayerData) => (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const draggedId = draggedIdRef.current;
      if (!draggedId || draggedId === layer.id) {
        resetDragState();
        return;
      }

      const draggedLayer = layerMap.get(draggedId);
      if (!draggedLayer || !canDrag(draggedLayer)) {
        resetDragState();
        return;
      }

      const position = dragState.position || "after";
      const draggedComponent = draggedLayer.component;
      const targetComponent = layer.component;

      if (!draggedComponent || !targetComponent) {
        resetDragState();
        return;
      }

      const targetParent = targetComponent.parent?.();
      if (!targetParent) {
        resetDragState();
        return;
      }

      if (position === "inside" && canAcceptDrop(layer)) {
        // Drop inside the container
        const children = targetComponent.components?.();
        if (children) {
          draggedComponent.move(targetComponent, { at: children.length });
        }
      } else {
        // Drop before/after
        const parentType = targetParent.get?.("type");
        const isZStackContainer = parentType === "section" || parentType === "header" || parentType === "footer";

        // For z-stack containers: modify z-index instead of DOM order
        // Note: position is guaranteed to be "before" or "after" here (not "inside" - handled above)
        if (isZStackContainer && shouldManageZIndex(draggedComponent) && shouldManageZIndex(targetComponent)) {
          moveToZIndex(draggedComponent, targetComponent, position as "before" | "after");
        } else {
          // Page level or non-z-managed elements: use DOM order
          const siblings = targetParent.components?.()?.models || [];
          const targetIndex = siblings.indexOf(targetComponent);

          if (targetIndex === -1) {
            resetDragState();
            return;
          }

          // Calculate insert index
          const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;

          // Validate: don't move before header or after footer at root level
          let finalIndex = insertIndex;
          if (parentType === "wrapper") {
            const firstChild = siblings[0];
            const lastChild = siblings[siblings.length - 1];

            if (firstChild?.get?.("type") === "header" && finalIndex === 0) {
              finalIndex = 1;
            }
            if (lastChild?.get?.("type") === "footer" && finalIndex >= siblings.length) {
              finalIndex = siblings.length - 1;
            }
          }

          draggedComponent.move(targetParent, { at: finalIndex });
        }
      }

      syncLayers();
      resetDragState();
    },
    [canAcceptDrop, canDrag, dragState.position, layerMap, resetDragState, syncLayers]
  );

  const handleDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  // Recursive render function for layers
  const renderLayer = useCallback(
    (layer: LayerData) => {
      const isExpanded = expandedIds.has(layer.id);

      return (
        <LayerItem
          key={layer.id}
          layer={layer}
          isSelected={layer.id === selectedId}
          isDragging={layer.id === dragState.draggedId}
          dragOverPosition={layer.id === dragState.overId ? dragState.position : null}
          isDraggable={canDrag(layer)}
          isExpanded={isExpanded}
          onToggleExpand={() => handleToggleExpand(layer.id)}
          onSelect={() => handleSelect(layer)}
          onRename={(newName) => handleRename(layer, newName)}
          onDuplicate={() => handleDuplicate(layer)}
          onDelete={() => handleDelete(layer)}
          onBringToFront={() => handleBringToFront(layer)}
          onSendToBack={() => handleSendToBack(layer)}
          canReorder={canReorderLayer(layer)}
          onDragStart={handleDragStart(layer)}
          onDragOver={handleDragOver(layer)}
          onDrop={handleDrop(layer)}
          onDragEnd={handleDragEnd}
          renderChildren={
            layer.children.length > 0
              ? () => layer.children.map((child) => renderLayer(child))
              : undefined
          }
        />
      );
    },
    [
      canDrag,
      canReorderLayer,
      dragState.draggedId,
      dragState.overId,
      dragState.position,
      expandedIds,
      handleBringToFront,
      handleDelete,
      handleDragEnd,
      handleDragOver,
      handleDragStart,
      handleDrop,
      handleDuplicate,
      handleRename,
      handleSelect,
      handleSendToBack,
      handleToggleExpand,
      selectedId,
    ]
  );

  if (layers.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-gray-500">
        No elements
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
        Layers
      </div>
      <ScrollArea className="h-full">
        <div className="pb-4">
          {layers.map((layer) => renderLayer(layer))}
        </div>
      </ScrollArea>
    </div>
  );
}
