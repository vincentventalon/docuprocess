"use client";

import { useState, useEffect, useMemo, useCallback, useRef, type MouseEvent } from "react";
import { Undo2, Redo2, Save, LogOut, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonEditor } from "@/components/ui/json-editor";
import { GrapesJSEditor } from "./editor";
import { getDefaultBodyCss } from "./editor/panels/components/BodyTypographySection";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  DEFAULT_PAGE_SETTINGS,
  PAGE_FORMATS,
  clampPadding,
  pageSettingsToCss,
  type PageFormat,
  type PagePadding,
  type PageOrientation,
  type PageSettings,
} from "@/types/page-settings";
import { SELF_HOSTED_FONTS_CSS } from "@/libs/fonts";
import { EditorCTABanner } from "@/components/public-templates/EditorCTABanner";
import type { PublicTemplateDetail } from "@/libs/templates";
import { getBackendHeaders } from "@/libs/backend-api";

type TemplateDesignerProps = {
  templateId?: string;
  isAdminMode?: boolean;
  isPublicDemo?: boolean;
  publicTemplate?: PublicTemplateDetail;
  backUrl?: string;
};

// Clean nested body tags from HTML content
function cleanNestedBodyTags(html: string): string {
  if (!html || typeof html !== 'string') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (doc.body) {
      let content = (doc.body.innerHTML || html).trim();
      // Recursively extract content from nested body tags
      let nestedBodyMatch = content.match(/^\s*<body\s*[^>]*>([\s\S]*)<\/body>\s*$/i);
      while (nestedBodyMatch) {
        content = nestedBodyMatch[1].trim();
        nestedBodyMatch = content.match(/^\s*<body\s*[^>]*>([\s\S]*)<\/body>\s*$/i);
      }
      // Re-wrap in a single body tag with the original body's style
      const bodyStyleMatch = html.match(/<body\s+style="([^"]*)"/i);
      const bodyStyle = bodyStyleMatch ? bodyStyleMatch[1] : '';
      return bodyStyle ? `<body style="${bodyStyle}">\n${content}\n</body>` : `<body>\n${content}\n</body>`;
    }
    return html;
  } catch {
    return html;
  }
}

// Extract template variables from HTML and merge missing keys into existing JSON data
function extractAndMergeTemplateVariables(html: string, existingData: Record<string, unknown>): Record<string, unknown> {
  const pattern = /\{\{([^}]+)\}\}/g;
  const result = { ...existingData };
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const varPath = match[1].trim();

    // Skip function calls like sum(), format(), etc.
    if (varPath.includes('(') || varPath.includes(')')) {
      continue;
    }

    // Skip section markers and system variables
    if (varPath.startsWith('#') || varPath.startsWith('/') || varPath.startsWith('$') || varPath.startsWith('sys.')) {
      // For array section markers like {{#items}}, add the array if missing
      if (varPath.startsWith('#')) {
        const arrayName = varPath.slice(1);
        if (!(arrayName in result)) {
          result[arrayName] = [{}];
        }
      }
      continue;
    }

    // Handle nested paths like "customer.name"
    const parts = varPath.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        // Only add if key doesn't exist
        if (!(part in current)) {
          current[part] = "";
        }
      } else {
        // Create nested object if it doesn't exist
        if (!(part in current)) {
          current[part] = {};
        }
        // Navigate into nested object (skip if it's an array or primitive)
        if (typeof current[part] === 'object' && current[part] !== null && !Array.isArray(current[part])) {
          current = current[part] as Record<string, unknown>;
        } else {
          break;
        }
      }
    }
  }

  return result;
}

// Extract body CSS block from combined CSS string
function extractBodyCss(css: string): { bodyCss: string; remainingCss: string } {
  if (!css) return { bodyCss: "", remainingCss: "" };

  // Match body { ... } block
  const bodyMatch = css.match(/body\s*\{[^}]*\}/i);
  if (!bodyMatch) {
    return { bodyCss: "", remainingCss: css };
  }

  const bodyCss = bodyMatch[0];
  const remainingCss = css.replace(bodyCss, "").trim();

  return { bodyCss, remainingCss };
}

// Inject CSS into HTML as a <style> tag in <head>
function injectCssIntoHtml(html: string, css: string): string {
  if (!css) return html;

  const styleTag = `<style>${css}</style>`;

  // If there's a </head>, inject before it
  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}</head>`);
  }

  // If there's a <body>, inject before it
  if (html.includes("<body")) {
    return html.replace(/<body/i, `${styleTag}<body`);
  }

  // Otherwise prepend
  return styleTag + html;
}

export function TemplateDesigner({
  templateId,
  isAdminMode = false,
  isPublicDemo = false,
  publicTemplate,
  backUrl,
}: TemplateDesignerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  // Redirect if no template_id AND no mode param (force modal selection)
  // Skip redirect for public demo mode since we have pre-loaded data
  useEffect(() => {
    if (!templateId && !modeParam && !isAdminMode && !isPublicDemo) {
      router.replace("/dashboard/templates");
    }
  }, [templateId, modeParam, isAdminMode, isPublicDemo, router]);

  const [activeTemplateId, setActiveTemplateId] = useState(templateId || "");
  const [htmlContent, setHtmlContent] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [templateName, setTemplateName] = useState("New Template");
  const [isLoading, setIsLoading] = useState(Boolean(templateId));
  const [isDataLoaded, setIsDataLoaded] = useState(!templateId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [editorCss, setEditorCss] = useState("");
  const [customCss, setCustomCss] = useState(() => getDefaultBodyCss());
  const [pageFormat, setPageFormat] = useState<PageFormat>(DEFAULT_PAGE_SETTINGS.format);
  const [pageOrientation, setPageOrientation] = useState<PageOrientation>(DEFAULT_PAGE_SETTINGS.orientation);
  const [pagePadding, setPagePadding] = useState<PagePadding>({ ...DEFAULT_PAGE_SETTINGS.padding });
  // Initialize infiniteMode from URL param (infinite is the default for backwards compat)
  const [infiniteMode, setInfiniteMode] = useState(() => {
    if (modeParam === "fixed") return false;
    return true; // Default to infinite mode
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"designer" | "preview">("designer");
  const [dataPanelWidth, setDataPanelWidth] = useState(350);
  const [isDataPanelCollapsed, setIsDataPanelCollapsed] = useState(false);
  const isDraggingSplitter = useRef(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const originalNameRef = useRef<string>("");

  // Demo session token (fetched once for public demo mode)
  const [demoToken, setDemoToken] = useState<string | null>(null);

  // Editor controls (moved from EditorToolbar)
  const [rightPanelVisible] = useState(true);
  const [bordersVisible, setBordersVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const editorInstanceRef = useRef<any>(null);

  // Track unsaved changes - simple boolean, stops checking once dirty
  const [isDirty, setIsDirty] = useState(false);
  const isInitialLoadRef = useRef(true);

  // Mark dirty callback - call this on actual user edits
  const markDirty = useCallback(() => {
    if (!isInitialLoadRef.current) {
      setIsDirty(true);
    }
  }, []);

  // Wrapped setters that mark dirty on user changes
  const handleJsonDataChange = useCallback((value: string) => {
    setJsonData(value);
    markDirty();
  }, [markDirty]);

  const handlePageFormatChange = useCallback((value: PageFormat) => {
    setPageFormat(value);
    markDirty();
  }, [markDirty]);

  const handlePageOrientationChange = useCallback((value: PageOrientation) => {
    setPageOrientation(value);
    markDirty();
  }, [markDirty]);

  const handlePagePaddingChange = useCallback((value: PagePadding) => {
    setPagePadding(value);
    markDirty();
  }, [markDirty]);

  const handleCustomCssChange = useCallback((value: string) => {
    setCustomCss(value);
    markDirty();
  }, [markDirty]);

  const designerPageSettings = useMemo<PageSettings>(() => ({
    format: pageFormat,
    orientation: pageOrientation,
    padding: pagePadding,
  }), [pageFormat, pageOrientation, pagePadding]);

  const externalCss = useMemo(
    () => [SELF_HOSTED_FONTS_CSS, customCss].filter(Boolean).join("\n\n"),
    [customCss]
  );

  const zeroPaddingPageSettings = useMemo<PageSettings>(() => ({
    ...designerPageSettings,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  }), [designerPageSettings]);

  const pageCss = useMemo(
    () => pageSettingsToCss(zeroPaddingPageSettings),
    [zeroPaddingPageSettings]
  );

  const previewCss = useMemo(
    () => [SELF_HOSTED_FONTS_CSS, pageCss, customCss, editorCss].filter(Boolean).join("\n\n"),
    [pageCss, customCss, editorCss]
  );


  useEffect(() => {
    if (templateId) {
      setActiveTemplateId(templateId);
      setIsLoading(true);
      setIsDataLoaded(false);
    }
  }, [templateId]);

  // Load template from API (for authenticated modes)
  useEffect(() => {
    // Skip API fetch for public demo mode - we use pre-loaded data
    if (isPublicDemo) return;
    if (!activeTemplateId) {
      return;
    }

    setIsLoading(true);
    setIsDataLoaded(false);

    const apiUrl = isAdminMode
      ? `/api/admin/example-templates/get?id=${activeTemplateId}`
      : `/api/templates/get?template_id=${activeTemplateId}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.template) {
          const normalizedHtml = data.template.html_content || "<div>No content</div>";
          setHtmlContent(cleanNestedBodyTags(normalizedHtml));
          setTemplateName(data.template.name || "Template");
          // Parse body CSS from css_content for BodyTypographySection
          const loadedCss = data.template.css_content || "";
          const { bodyCss, remainingCss } = extractBodyCss(loadedCss);
          setEditorCss(remainingCss);
          // Use default body CSS if none found in template
          setCustomCss(bodyCss || getDefaultBodyCss());

          const rawFormat = (data.template.paper_format as string) || data.template.page_format;
          const rawOrientation = (data.template.page_orientation as string) || data.template.page_format?.split("-")[1];
          const normalizedFormat = rawFormat?.toUpperCase();
          const isValidFormat = normalizedFormat && PAGE_FORMATS.includes(normalizedFormat as PageFormat);
          const normalizedOrientation = rawOrientation === "landscape" ? "landscape" : "portrait";

          setPageFormat((isValidFormat ? normalizedFormat : DEFAULT_PAGE_SETTINGS.format) as PageFormat);
          setPageOrientation(normalizedOrientation as PageOrientation);
          setPagePadding(clampPadding(data.template.page_padding || undefined));
          setInfiniteMode(data.template.infinite_mode ?? true);

          const loadedJsonData = data.template.sample_data
            ? JSON.stringify(data.template.sample_data, null, 2)
            : "";
          if (data.template.sample_data) {
            setJsonData(loadedJsonData);
          }

          // Mark initial load complete (no unsaved changes yet)
          isInitialLoadRef.current = false;
          setIsDirty(false);

          setIsDataLoaded(true);
        }
      })
      .catch((error) => {
        console.error("Error loading template:", error);
        setIsDataLoaded(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeTemplateId, isAdminMode, isPublicDemo]);

  // Load template from pre-fetched data (for public demo mode)
  useEffect(() => {
    if (!isPublicDemo || !publicTemplate) return;

    const template = publicTemplate;
    const normalizedHtml = template.html_content || "<div>No content</div>";
    setHtmlContent(cleanNestedBodyTags(normalizedHtml));
    setTemplateName(template.name || "Template");

    // Parse body CSS from css_content for BodyTypographySection
    const loadedCss = template.css_content || "";
    const { bodyCss, remainingCss } = extractBodyCss(loadedCss);
    setEditorCss(remainingCss);
    setCustomCss(bodyCss || getDefaultBodyCss());

    const rawFormat = template.paper_format as string;
    const rawOrientation = template.page_orientation as string;
    const normalizedFormat = rawFormat?.toUpperCase();
    const isValidFormat = normalizedFormat && PAGE_FORMATS.includes(normalizedFormat as PageFormat);
    const normalizedOrientation = rawOrientation === "landscape" ? "landscape" : "portrait";

    setPageFormat((isValidFormat ? normalizedFormat : DEFAULT_PAGE_SETTINGS.format) as PageFormat);
    setPageOrientation(normalizedOrientation as PageOrientation);
    setPagePadding(clampPadding(undefined));
    setInfiniteMode(true);

    const loadedJsonData = template.sample_data
      ? JSON.stringify(template.sample_data, null, 2)
      : "";
    if (template.sample_data) {
      setJsonData(loadedJsonData);
    }

    // Mark initial load complete (no unsaved changes yet)
    isInitialLoadRef.current = false;
    setIsDirty(false);

    setIsLoading(false);
    setIsDataLoaded(true);
  }, [isPublicDemo, publicTemplate]);

  // Fetch demo session token for public demo mode
  useEffect(() => {
    if (!isPublicDemo || !publicTemplate) return;

    const fetchToken = async () => {
      try {
        const res = await fetch("/api/demo/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template_id: publicTemplate.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setDemoToken(data.token);
        }
      } catch (error) {
        console.error("Failed to fetch demo token:", error);
      }
    };

    void fetchToken();

    // Refresh token every 2.5 minutes (before 3 min expiry)
    const interval = setInterval(fetchToken, 2.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isPublicDemo, publicTemplate]);

  const updateTemplateName = useCallback(async (newName: string) => {
    if (!activeTemplateId || !newName.trim()) {
      // If empty, revert to original
      if (originalNameRef.current) {
        setTemplateName(originalNameRef.current);
      }
      return;
    }

    const trimmedName = newName.trim();
    if (trimmedName === originalNameRef.current) {
      return;
    }

    setIsSavingName(true);
    try {
      const apiUrl = isAdminMode
        ? "/api/admin/example-templates/update-name"
        : "/api/templates/update-name";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: activeTemplateId,
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      setTemplateName(trimmedName);
      originalNameRef.current = trimmedName;
    } catch (error) {
      console.error("Error updating template name:", error);
      // Revert to original name on error
      setTemplateName(originalNameRef.current);
    } finally {
      setIsSavingName(false);
    }
  }, [activeTemplateId, isAdminMode]);

  // Handler for LeftPanel name changes
  const handleTemplateNameChange = useCallback((newName: string) => {
    originalNameRef.current = templateName;
    setTemplateName(newName);
    void updateTemplateName(newName);
  }, [templateName, updateTemplateName]);

  // Editor control callbacks
  const handleEditorReady = useCallback((editor: any) => {
    editorInstanceRef.current = editor;
  }, []);

  const toggleBorders = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    if (bordersVisible) {
      editor.stopCommand("sw-visibility");
    } else {
      editor.runCommand("sw-visibility");
    }
    setBordersVisible(!bordersVisible);
  }, [bordersVisible]);

  const handleUndo = useCallback(() => {
    editorInstanceRef.current?.runCommand("core:undo");
  }, []);

  const handleRedo = useCallback(() => {
    editorInstanceRef.current?.runCommand("core:redo");
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    // Get the GrapesJS editor container element
    const editorEl = editor.getContainer?.();
    if (editorEl) {
      const scale = zoom / 100;
      // Find the canvas wrapper that contains both frames and tools
      const canvasWrapper = editorEl.querySelector('.gjs-cv-canvas') as HTMLElement;
      if (canvasWrapper) {
        // Use CSS zoom instead of transform - it handles mouse coordinates better
        canvasWrapper.style.zoom = `${scale}`;
        // Reset any previous transform
        canvasWrapper.style.transform = '';
      }
    }
    setZoomLevel(zoom);
  }, []);

  const handleAddMissingKeys = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    const html = editor.getHtml();
    let existingData: Record<string, unknown> = {};

    // Parse existing JSON data
    try {
      const cleaned = jsonData.replace(/,(\s*[}\]])/g, '$1');
      if (cleaned.trim()) {
        existingData = JSON.parse(cleaned);
      }
    } catch {
      existingData = {};
    }

    const mergedData = extractAndMergeTemplateVariables(html, existingData);
    setJsonData(JSON.stringify(mergedData, null, 2));
    markDirty();
  }, [jsonData, markDirty]);

  // Calculate optimal data panel width based on page format
  const calculateOptimalDataPanelWidth = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 120; // minus header

    // Page format dimensions in mm (width x height for portrait)
    const formatDimensions: Record<string, { width: number; height: number }> = {
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

    const dims = formatDimensions[pageFormat] || formatDimensions.A4;
    const isLandscape = pageOrientation === "landscape";
    const pageWidth = isLandscape ? dims.height : dims.width;
    const pageHeight = isLandscape ? dims.width : dims.height;

    // Calculate preview width needed to show full page at available height
    const aspectRatio = pageWidth / pageHeight;
    const previewWidthNeeded = viewportHeight * aspectRatio;

    // Add some padding around preview (40px each side)
    const previewWithPadding = previewWidthNeeded + 80;

    // Data panel gets the rest, clamped between 250 and 600
    const optimalWidth = Math.max(250, Math.min(600, viewportWidth - previewWithPadding - 1)); // -1 for splitter

    return optimalWidth;
  }, [pageFormat, pageOrientation]);

  // Load data panel state from localStorage or calculate optimal
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("isDataPanelCollapsed");
    if (savedCollapsed) setIsDataPanelCollapsed(savedCollapsed === "true");

    // Always calculate optimal width based on format (don't use saved width)
    const optimalWidth = calculateOptimalDataPanelWidth();
    setDataPanelWidth(optimalWidth);
  }, [calculateOptimalDataPanelWidth]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isDraggingSplitter.current) {
        const optimalWidth = calculateOptimalDataPanelWidth();
        setDataPanelWidth(optimalWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateOptimalDataPanelWidth]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("isDataPanelCollapsed", String(isDataPanelCollapsed));
  }, [isDataPanelCollapsed]);

  // Splitter drag handlers
  const handleSplitterMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingSplitter.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: { clientX: number }) => {
      if (!isDraggingSplitter.current) return;
      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;
      setDataPanelWidth(Math.max(250, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      if (isDraggingSplitter.current) {
        isDraggingSplitter.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const saveTemplate = async (): Promise<boolean> => {
    if (!activeTemplateId) {
      alert("No template ID");
      return false;
    }

    setIsSaving(true);
    try {
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to save templates");
        setIsSaving(false);
        return false;
      }

      // Parse JSON data (tolerant of trailing commas)
      let parsedData = {};
      try {
        const cleanedJson = (jsonData || "{}").replace(/,(\s*[}\]])/g, '$1');
        parsedData = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("Invalid JSON:", e);
        alert("Invalid JSON in data tab");
        setIsSaving(false);
        return false;
      }

      // Get the actual template UUID
      let templateId = activeTemplateId;

      if (!isAdminMode) {
        // For user templates, we need to get UUID from short_id
        const { data: templateData } = await supabase
          .from("templates")
          .select("id")
          .eq("short_id", activeTemplateId)
          .single();

        if (!templateData) {
          alert("Template not found");
          setIsSaving(false);
          return false;
        }
        templateId = templateData.id;
      }
      // For admin mode, activeTemplateId is already the UUID

      // Inject body CSS directly into HTML to ensure it's always included
      const allCss = [customCss, editorCss].filter(Boolean).join("\n\n");
      const normalizedHtml = injectCssIntoHtml(htmlContent, allCss);

      const apiUrl = isAdminMode
        ? "/api/admin/example-templates/save"
        : "/api/templates/save";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          content: {
            html: normalizedHtml,
            css: allCss, // Also store separately for extraction on load
            data: parsedData,
          },
          paper_format: pageFormat,
          page_orientation: pageOrientation,
          page_padding: pagePadding,
          infinite_mode: infiniteMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      // Clear dirty state after successful save
      setIsDirty(false);

      // Show success state on button
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      return true;
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    router.push("/dashboard/templates");
  };

  const generatePreview = useCallback(async (silent = false) => {
    setIsGeneratingPreview(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      // Parse JSON data (tolerant of trailing commas)
      let parsedData = {};
      try {
        // Remove trailing commas before ] or } to be more forgiving
        const cleanedJson = (jsonData || "{}").replace(/,(\s*[}\]])/g, '$1');
        parsedData = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("Invalid JSON:", e);
        if (!silent) alert("Invalid JSON in data tab");
        setIsGeneratingPreview(false);
        return;
      }

      // Extract full body tag (with styles from GrapesJS wrapper) and rebuild full HTML
      const bodyTag = cleanTemplateExpressions(extractFullBodyTag(htmlContent));
      const cleanCss = deduplicateCss(previewCss || "");

      const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
${cleanCss}
    </style>
  </head>
  ${bodyTag}
</html>`;

      let response: Response;

      if (isPublicDemo) {
        // Public demo mode - use demo endpoint with token
        if (!demoToken) {
          if (!silent) alert("Demo session not ready. Please try again.");
          setIsGeneratingPreview(false);
          return;
        }

        response = await fetch(`${backendUrl}/public/demo/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: demoToken,
            html: fullHtml,
            variables: parsedData,
          }),
        });
      } else {
        // Authenticated mode - use UI endpoint
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!silent) alert("You must be logged in to generate previews");
          setIsGeneratingPreview(false);
          return;
        }

        response = await fetch(`${backendUrl}/ui/pdf/preview`, {
          method: "POST",
          headers: getBackendHeaders(session.access_token),
          body: JSON.stringify({
            html: fullHtml,
            variables: parsedData,
            filename: "preview.pdf",
            template_id: activeTemplateId,
            mode: "infinite",
            output_format: "html",
            page_settings: {
              format: pageFormat,
              orientation: pageOrientation,
              padding: pagePadding,
            },
          }),
        });
      }

      if (!response.ok) {
        // Handle rate limiting gracefully - just wait and retry silently
        if (response.status === 429 && isPublicDemo) {
          setTimeout(() => void generatePreview(true), 5500);
          return;
        }
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to generate preview: ${response.statusText} - ${errorText}`);
      }

      // Get the clean HTML from backend
      const cleanHtml = await response.text();

      // Add base tag FIRST in <head> for blob URL context (so /fonts/... URLs resolve correctly)
      // Base tag MUST come before any relative URLs (like font CSS) to take effect
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const baseTag = `<base href="${baseUrl}/" />`;

      // Insert base tag right after <head> (before CSS with font URLs)
      let displayHtml = cleanHtml.replace(/<head>/i, `<head>\n${baseTag}`);

      // Add preview styling before </head>
      // Override overflow:hidden from PDF mode to allow seeing content beyond page boundaries
      // Keep height (297mm for A4) to show page limits, but allow overflow to be visible
      const previewStyles = `
        <style>
          html { background: #f3f4f6; padding: 20px; min-height: 100vh; }
          body { box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: visible !important; }
        </style>
      `;
      displayHtml = displayHtml.replace('</head>', previewStyles + '</head>');

      const blob = new Blob([displayHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error generating preview:", error);
      if (!silent) {
        alert("Failed to generate preview. Make sure your Python backend is running on " + (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"));
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [htmlContent, jsonData, previewCss, activeTemplateId, pageFormat, pageOrientation, pagePadding, isPublicDemo, demoToken]);

  // Auto-generate preview when switching to preview tab (debounced to reduce API costs)
  useEffect(() => {
    if (activeTab !== "preview" || !htmlContent || isLoading) return;
    // Use longer delay for public demo mode to respect rate limits
    const delay = isPublicDemo ? 5500 : 2000;
    const timeout = setTimeout(() => {
      void generatePreview(true); // silent mode - always regenerate
    }, delay);
    return () => clearTimeout(timeout);
  }, [activeTab, htmlContent, isLoading, generatePreview, isPublicDemo]);

  const generatePdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      // Parse JSON data (tolerant of trailing commas)
      let parsedData = {};
      try {
        const cleanedJson = (jsonData || "{}").replace(/,(\s*[}\]])/g, '$1');
        parsedData = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("Invalid JSON:", e);
        alert("Invalid JSON in data tab");
        setIsGeneratingPdf(false);
        return;
      }

      // Get Supabase session token for authentication
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("You must be logged in to generate PDFs");
        setIsGeneratingPdf(false);
        return;
      }

      // Extract full body tag and rebuild full HTML
      const bodyTag = cleanTemplateExpressions(extractFullBodyTag(htmlContent));
      const cleanCss = deduplicateCss(previewCss || "");

      const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
${cleanCss}
    </style>
  </head>
  ${bodyTag}
</html>`;

      const response = await fetch(`${backendUrl}/ui/pdf/create`, {
        method: "POST",
        headers: getBackendHeaders(session.access_token),
        body: JSON.stringify({
          html: fullHtml,
          variables: parsedData,
          filename: `${templateName || "document"}.pdf`,
          template_id: activeTemplateId,
          mode: "infinite",
          page_settings: {
            format: pageFormat,
            orientation: pageOrientation,
            padding: pagePadding,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorText}`);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateName || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Make sure your Python backend is running on " + (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"));
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [htmlContent, jsonData, previewCss, activeTemplateId, templateName, pageFormat, pageOrientation, pagePadding]);

  const generateThumbnail = useCallback(async () => {
    if (!isAdminMode) {
      alert("Thumbnail generation is only available in admin mode");
      return;
    }

    if (!activeTemplateId) {
      alert("Please save the template first");
      return;
    }

    setIsGeneratingThumbnail(true);
    try {
      // Parse JSON data (tolerant of trailing commas)
      let parsedData = {};
      try {
        const cleanedJson = (jsonData || "{}").replace(/,(\s*[}\]])/g, '$1');
        parsedData = JSON.parse(cleanedJson);
      } catch (e) {
        console.error("Invalid JSON:", e);
        alert("Invalid JSON in data tab");
        setIsGeneratingThumbnail(false);
        return;
      }

      // Extract full body tag and rebuild full HTML
      const bodyTag = cleanTemplateExpressions(extractFullBodyTag(htmlContent));
      const cleanCss = deduplicateCss(previewCss || "");

      const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
${cleanCss}
    </style>
  </head>
  ${bodyTag}
</html>`;

      const response = await fetch("/api/admin/example-templates/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: activeTemplateId,
          html: fullHtml,
          variables: parsedData,
          page_settings: {
            format: pageFormat,
            orientation: pageOrientation,
            padding: pagePadding,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate thumbnail");
      }

      const data = await response.json();
      alert("Preview image generated successfully!");
      console.log("Thumbnail URL:", data.thumbnail_url);

    } catch (error) {
      console.error("Error generating thumbnail:", error);
      alert(`Failed to generate thumbnail: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGeneratingThumbnail(false);
    }
  }, [isAdminMode, activeTemplateId, htmlContent, jsonData, previewCss, pageFormat, pageOrientation, pagePadding]);

  const extractBodyContent = (html: string): string => {
    // Extract only the inner content of the body tag
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1].trim();
    }
    // If no body tag found, return the original html
    return html;
  };

  const extractFullBodyTag = (html: string): string => {
    // Extract the full body tag including attributes and content
    const bodyMatch = html.match(/(<body[^>]*>[\s\S]*<\/body>)/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
    // If no body tag found, wrap in a plain body tag
    return `<body>\n${html}\n</body>`;
  };

  const cleanTemplateExpressions = (html: string): string => {
    // Strip HTML tags from inside {{ }} template expressions
    // This handles copy-paste issues where formatting spans get inserted
    return html.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
      // Remove all HTML tags from inside the expression
      const cleaned = content.replace(/<[^>]*>/g, '').trim();
      return `{{${cleaned}}}`;
    });
  };

  const deduplicateCss = (css: string): string => {
    // Split CSS into rules
    const lines = css.split('\n');
    const seen = new Set<string>();
    const deduplicated: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines
      if (!trimmed) {
        deduplicated.push(line);
        continue;
      }
      // Only deduplicate exact duplicate rules
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        deduplicated.push(line);
      }
    }

    return deduplicated.join('\n');
  };

  const exportPreviewHtml = () => {
    // Extract full body tag (with styles from GrapesJS wrapper)
    const bodyTag = cleanTemplateExpressions(extractFullBodyTag(htmlContent));
    const cleanCss = deduplicateCss(previewCss || "");

    const fullHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
${cleanCss}
    </style>
  </head>
  ${bodyTag}
</html>
`.trim();

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-preview.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-4 h-12">
          {/* Left: Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex">
              <button
                onClick={() => setActiveTab("designer")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "designer"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Designer
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === "preview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Mode indicator */}
            <div className={`ml-3 px-2.5 py-1 text-xs font-medium rounded-full ${
              infiniteMode
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}>
              {infiniteMode ? "Infinite Mode" : "Fixed Mode"}
            </div>
          </div>

          {/* Right: Controls + Save */}
          <div className="flex items-center gap-2">
            {/* Editor controls - only show on designer tab */}
            {activeTab === "designer" && (
              <>
                <button
                  onClick={toggleBorders}
                  className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
                    bordersVisible
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {bordersVisible ? "Hide borders" : "Show borders"}
                </button>
                <select
                  value={zoomLevel}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="px-2.5 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Zoom level"
                >
                  <option value={50}>50%</option>
                  <option value={75}>75%</option>
                  <option value={100}>100%</option>
                  <option value={125}>125%</option>
                  <option value={150}>150%</option>
                  <option value={200}>200%</option>
                </select>

                <div className="w-px h-5 bg-gray-200" />

                <button
                  onClick={handleUndo}
                  className="p-1.5 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  className="p-1.5 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-200" />
              </>
            )}

            {activeTab === "preview" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview(false)}
                  disabled={isGeneratingPreview || !htmlContent}
                >
                  {isGeneratingPreview ? "Generating..." : "Refresh Preview"}
                </Button>
                {!isPublicDemo && (
                  <Button
                    size="sm"
                    onClick={generatePdf}
                    disabled={isGeneratingPdf || !htmlContent}
                    className="bg-[#570df8] text-white hover:bg-[#4a0bd4]"
                  >
                    {isGeneratingPdf ? "Generating..." : "Generate PDF"}
                  </Button>
                )}
                {isAdminMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateThumbnail}
                    disabled={isGeneratingThumbnail || !htmlContent}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {isGeneratingThumbnail ? "Generating..." : "Generate Preview Image"}
                  </Button>
                )}
              </>
            )}

            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-2">
              {isPublicDemo ? (
                <>
                  <Link href={backUrl || "/templates"}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Templates
                    </Button>
                  </Link>
                  <Link href="/signin?redirect=/dashboard/browse-examples">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Get Started Free
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={saveTemplate}
                    disabled={isSaving || !activeTemplateId}
                    size="sm"
                    className={saveSuccess ? "border-green-600 text-green-600" : ""}
                    title={isDirty ? "Save (unsaved changes)" : "Save"}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saveSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <div className="relative">
                        <Save className="h-4 w-4" />
                        {isDirty && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full" />
                        )}
                      </div>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExit}
                    size="sm"
                    title="Exit"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {isLoading && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      </header>

      {isPublicDemo && <EditorCTABanner />}

      <main className="p-0">
        <div className="w-full">

          {/* Designer Tab - Keep mounted but hidden */}
          <div 
            className="m-0 p-0" 
            style={{ display: activeTab === "designer" ? "block" : "none" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading template...</div>
              </div>
            ) : isDataLoaded ? (
              <GrapesJSEditor
                htmlContent={htmlContent}
                cssContent={editorCss}
                onChange={setHtmlContent}
                onCssChange={setEditorCss}
                pageSettings={designerPageSettings}
                externalCss={externalCss}
                infiniteMode={infiniteMode}
                rightPanelVisible={rightPanelVisible}
                onEditorReady={handleEditorReady}
                templateName={templateName}
                onTemplateNameChange={handleTemplateNameChange}
                onFormatChange={handlePageFormatChange}
                onOrientationChange={handlePageOrientationChange}
                onPaddingChange={handlePagePaddingChange}
                customCss={customCss}
                onCustomCssChange={handleCustomCssChange}
                onDirty={markDirty}
              />
            ) : null}
          </div>

          {/* Preview Tab with Data Panel */}
          <div
            className="flex"
            style={{
              display: activeTab === "preview" ? "flex" : "none",
              height: "calc(100vh - 48px)"
            }}
          >
            {/* Preview iframe */}
            <div className="flex-1 relative h-full overflow-auto">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 block"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {isGeneratingPreview ? "Generating preview..." : "Preview will generate automatically"}
                </div>
              )}
            </div>

            {/* Splitter */}
            {!isDataPanelCollapsed && (
              <div
                className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
                onMouseDown={handleSplitterMouseDown}
              />
            )}

            {/* Data Panel */}
            <div
              className="bg-gray-50 border-l flex flex-col flex-shrink-0 relative"
              style={{ width: isDataPanelCollapsed ? 40 : dataPanelWidth }}
            >
              {isDataPanelCollapsed ? (
                <button
                  onClick={() => setIsDataPanelCollapsed(false)}
                  className="absolute inset-0 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title="Expand data panel"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Template Data</span>
                      <button
                        onClick={handleAddMissingKeys}
                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Add missing template variables"
                      >
                        Add missing key
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(jsonData);
                          const btn = document.activeElement as HTMLButtonElement;
                          const originalText = btn.textContent;
                          btn.textContent = "Copied!";
                          setTimeout(() => { btn.textContent = originalText; }, 1500);
                        }}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        title="Copy JSON payload to clipboard"
                      >
                        Copy Payload
                      </button>
                    </div>
                    <button
                      onClick={() => setIsDataPanelCollapsed(true)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Collapse panel"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <JsonEditor
                    value={jsonData}
                    onChange={handleJsonDataChange}
                    placeholder="Enter JSON data..."
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

