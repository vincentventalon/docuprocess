"use client";

import { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import { useGrapesJSEditor } from "./hooks/useGrapesJSEditor";
import { GrapesJSEditorProps } from "./types";
import { LeftPanel } from "./panels/LeftPanel";
import { StylePanel } from "./panels/StylePanel";
import { RTEToolbar } from "./components/RTEToolbar";
import { DEFAULT_PAGE_SETTINGS } from "@/types/page-settings";
import { ChevronRight } from "lucide-react";

export function GrapesJSEditor(props: GrapesJSEditorProps) {
  const {
    rightPanelVisible = true,
    onEditorReady,
    templateName = "Sans titre",
    pageSettings = DEFAULT_PAGE_SETTINGS,
    onTemplateNameChange,
    onFormatChange,
    onOrientationChange,
    onPaddingChange,
    customCss,
    onCustomCssChange,
    infiniteMode = true,
  } = props;
  const { editorRef, editor, isRTEActive, startPlacement } = useGrapesJSEditor(props);

  // Local state for left panel collapse
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Header row (h-12 = 48px) + RTE toolbar (h-9 = 36px)
  const baseCanvasHeight = 48 + 36;
  const canvasHeight = `calc(100vh - ${baseCanvasHeight}px)`;

  return (
    <div className="gjs-container">
      {/* RTE Toolbar - inline text formatting */}
      <RTEToolbar editor={editor} isRTEActive={isRTEActive} />

      {/* 3-column layout with toggle */}
      <div className="flex">
        {/* Left panel - Custom React panel with collapse */}
        <div
          className="gjs-column-left bg-gray-50 border-r flex flex-col flex-shrink-0 relative"
          style={{
            width: isLeftPanelCollapsed ? "40px" : "250px",
            height: canvasHeight,
            transition: "width 0.2s ease-in-out",
          }}
        >
          {isLeftPanelCollapsed ? (
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="absolute inset-0 flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Show panel"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            editor && (
              <LeftPanel
                editor={editor}
                templateName={templateName}
                pageSettings={pageSettings}
                onTemplateNameChange={onTemplateNameChange}
                onFormatChange={onFormatChange}
                onOrientationChange={onOrientationChange}
                onCollapse={() => setIsLeftPanelCollapsed(true)}
                onStartPlacement={startPlacement}
                infiniteMode={infiniteMode}
              />
            )
          )}
        </div>

        {/* Central canvas */}
        <div className="gjs-column-center flex-1">
          <div ref={editorRef}></div>
        </div>

        {/* Right panel - Custom StylePanel */}
        <div
          className="gjs-column-right bg-gray-50 border-l"
          style={{
            width: rightPanelVisible ? "280px" : "0px",
            height: canvasHeight,
            overflow: rightPanelVisible ? "hidden" : "hidden",
            transition: "width 0.2s ease-in-out",
          }}
        >
          {editor && (
            <StylePanel
              editor={editor}
              pageSettings={pageSettings}
              onPaddingChange={onPaddingChange}
              customCss={customCss}
              onCustomCssChange={onCustomCssChange}
            />
          )}
        </div>

        {/* Hidden containers for GrapesJS references */}
        <div id="gjs-hidden-styles" style={{ display: "none" }}></div>
        <div id="traits" style={{ display: "none" }}></div>
      </div>
    </div>
  );
}
