import { useState, useCallback, useEffect } from "react";

interface SelectedComponentState {
  component: any | null;
  type: string;
  name: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
}

function getDefaultName(component: any): string {
  const customName = component.get?.("custom-name");
  if (customName) return customName;

  const attrs = component.getAttributes?.() || {};
  if (attrs["data-layer-name"]) return attrs["data-layer-name"];

  const type = component.get?.("type");
  const tagName = component.get?.("tagName")?.toLowerCase?.();

  // Wrapper = the page itself
  if (type === "wrapper") return "Page";
  if (type === "header") return "Header";
  if (type === "footer") return "Footer";
  if (type === "image") return "Image";
  if (type === "table") return "Table";
  if (type === "barcode") return "Barcode";
  if (type === "section") return "Section";
  if (type === "text" || tagName === "div") return "Text";

  return type || tagName || "Element";
}

function parseStyleValue(value: string | undefined): string {
  if (!value) return "";
  // Remove 'px' suffix for numeric values
  const match = value.match(/^(-?\d+(?:\.\d+)?)(px)?$/);
  if (match) return match[1];
  return value;
}

function getComponentStyles(component: any): Record<string, string> {
  if (!component) return {};

  // Get styles from GrapesJS model
  const modelStyles = component.getStyle?.() || {};

  // Try to get computed styles from DOM element as fallback
  const el = component.getEl?.();
  const computedStyles: Record<string, string> = {};

  if (el) {
    const computed = window.getComputedStyle(el);
    // Only get properties we care about
    const props = [
      "width",
      "height",
      "top",
      "left",
      "font-family",
      "font-size",
      "font-weight",
      "color",
      "text-align",
      "background-color",
      "opacity",
      "border-width",
      "border-color",
      "border-style",
      "border-radius",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ];

    props.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        computedStyles[prop] = value;
      }
    });
  }

  // Merge: model styles take precedence
  return { ...computedStyles, ...modelStyles };
}

export function useSelectedComponent(editor: any) {
  const [state, setState] = useState<SelectedComponentState>({
    component: null,
    type: "",
    name: "",
    styles: {},
    attributes: {},
  });

  const syncFromComponent = useCallback((comp: any) => {
    if (!comp) {
      setState({ component: null, type: "", name: "", styles: {}, attributes: {} });
      return;
    }

    const styles = getComponentStyles(comp);
    const type =
      comp.get?.("type") ||
      comp.get?.("tagName")?.toLowerCase?.() ||
      "element";
    const name = getDefaultName(comp);
    const attributes = comp.getAttributes?.() || {};

    setState({
      component: comp,
      type,
      name,
      styles,
      attributes,
    });
  }, []);

  const updateStyle = useCallback(
    (property: string, value: string) => {
      if (!state.component) return;

      // Properties that need 'px' unit
      const needsUnit = [
        "width",
        "height",
        "top",
        "left",
        "font-size",
        "border-width",
        "border-radius",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
      ].includes(property);

      let finalValue = value;
      if (needsUnit && value && !value.includes("px") && !isNaN(Number(value))) {
        finalValue = `${value}px`;
      }

      state.component.addStyle({ [property]: finalValue });

      // Update local state immediately for responsiveness
      setState((prev) => ({
        ...prev,
        styles: { ...prev.styles, [property]: finalValue },
      }));
    },
    [state.component]
  );

  const updateStyles = useCallback(
    (styles: Record<string, string>) => {
      if (!state.component) return;

      const processedStyles: Record<string, string> = {};

      Object.entries(styles).forEach(([property, value]) => {
        const needsUnit = [
          "width",
          "height",
          "top",
          "left",
          "font-size",
          "border-width",
          "border-radius",
          "padding",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
        ].includes(property);

        if (needsUnit && value && !value.includes("px") && !isNaN(Number(value))) {
          processedStyles[property] = `${value}px`;
        } else {
          processedStyles[property] = value;
        }
      });

      state.component.addStyle(processedStyles);

      setState((prev) => ({
        ...prev,
        styles: { ...prev.styles, ...processedStyles },
      }));
    },
    [state.component]
  );

  const updateAttribute = useCallback(
    (name: string, value: string | null) => {
      if (!state.component) return;

      const currentAttrs = state.component.getAttributes() || {};
      if (value === null) {
        // Remove attribute
        delete currentAttrs[name];
      } else {
        currentAttrs[name] = value;
      }
      state.component.setAttributes(currentAttrs);

      // Update local state
      setState((prev) => {
        const newAttrs = { ...prev.attributes };
        if (value === null) {
          delete newAttrs[name];
        } else {
          newAttrs[name] = value;
        }
        return { ...prev, attributes: newAttrs };
      });
    },
    [state.component]
  );

  useEffect(() => {
    if (!editor) return;

    // Helper to select wrapper (page) as default
    const selectWrapper = () => {
      const wrapper = editor.getWrapper?.();
      if (wrapper) {
        syncFromComponent(wrapper);
      }
    };

    const handleSelected = (comp: any) => syncFromComponent(comp);
    const handleDeselected = () => {
      // When deselected, fall back to the wrapper (page) instead of null
      selectWrapper();
    };
    const handleStyleChange = () => {
      const selected = editor.getSelected?.();
      if (selected) syncFromComponent(selected);
    };

    editor.on("component:selected", handleSelected);
    editor.on("component:deselected", handleDeselected);
    editor.on("component:styleUpdate", handleStyleChange);
    editor.on("styleable:change", handleStyleChange);

    // Sync initial selection - default to wrapper if nothing selected
    const current = editor.getSelected?.();
    if (current) {
      syncFromComponent(current);
    } else {
      selectWrapper();
    }

    return () => {
      editor.off("component:selected", handleSelected);
      editor.off("component:deselected", handleDeselected);
      editor.off("component:styleUpdate", handleStyleChange);
      editor.off("styleable:change", handleStyleChange);
    };
  }, [editor, syncFromComponent]);

  // Helper to get parsed numeric value
  const getNumericValue = useCallback(
    (property: string): string => {
      const value = state.styles[property];
      return parseStyleValue(value);
    },
    [state.styles]
  );

  return {
    ...state,
    updateStyle,
    updateStyles,
    updateAttribute,
    getNumericValue,
  };
}
