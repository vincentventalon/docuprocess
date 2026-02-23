"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Editor } from "grapesjs";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ChevronDown,
  Minus,
  Plus,
  CaseSensitive,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { LinkModal } from "./LinkModal";

interface RTEToolbarProps {
  editor: Editor | null;
  isRTEActive: boolean;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  disabled: boolean;
  onAction: () => void;
  active?: boolean;
}

// Must match fonts available in backend (same list as TypographySection.tsx)
const FONT_FAMILIES = [
  // Self-hosted fonts (consistent rendering frontend/backend)
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  // Signature fonts
  { value: "Great Vibes", label: "Great Vibes" },
  { value: "Dancing Script", label: "Dancing Script" },
  { value: "Pacifico", label: "Pacifico" },
  { value: "Allura", label: "Allura" },
  // Web-safe system fonts
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
];

const TEXT_COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04",
  "#16A34A", "#059669", "#0D9488", "#0891B2",
  "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
];

const ToolbarButton = ({ icon, title, disabled, onAction, active }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => {
      e.preventDefault();
      if (!disabled) {
        onAction();
      }
    }}
    className={`
      p-1.5 rounded transition-colors
      ${disabled
        ? "text-gray-300 cursor-not-allowed"
        : active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      }
    `}
  >
    {icon}
  </button>
);

export function RTEToolbar({ editor, isRTEActive }: RTEToolbarProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const savedComponentRef = useRef<any>(null);

  // New state for formatting options
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSpacingControl, setShowSpacingControl] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  const getCanvasDocument = useCallback(() => {
    if (!editor) return null;
    const canvasFrame = editor.Canvas?.getFrameEl?.();
    return canvasFrame?.contentDocument || null;
  }, [editor]);

  const execCommand = useCallback((command: string, value?: string) => {
    const canvasDoc = getCanvasDocument();
    if (!canvasDoc || !isRTEActive) return;

    canvasDoc.execCommand(command, false, value);
  }, [getCanvasDocument, isRTEActive]);

  // Helper to wrap selection in a span with custom styles
  const wrapSelectionWithStyle = useCallback((styleProperty: string, styleValue: string) => {
    const canvasDoc = getCanvasDocument();
    if (!canvasDoc || !isRTEActive) return;

    const selection = canvasDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    // Extract contents and clean up existing styles for this property to prevent nesting
    const contents = range.extractContents();

    const spans = Array.from(contents.querySelectorAll("span"));
    for (const existingSpan of spans) {
      existingSpan.style.removeProperty(styleProperty);
      // Unwrap spans that have no remaining styles and no meaningful attributes
      if (existingSpan.style.length === 0) {
        const hasOtherAttrs = Array.from(existingSpan.attributes).some(
          (attr) => attr.name !== "style"
        );
        if (!hasOtherAttrs && existingSpan.parentNode) {
          while (existingSpan.firstChild) {
            existingSpan.parentNode.insertBefore(existingSpan.firstChild, existingSpan);
          }
          existingSpan.parentNode.removeChild(existingSpan);
        }
      }
    }

    const span = canvasDoc.createElement("span");
    span.style.setProperty(styleProperty, styleValue);
    span.appendChild(contents);
    range.insertNode(span);

    // Restore selection so the user can apply further changes without re-selecting
    selection.removeAllRanges();
    const newRange = canvasDoc.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    // Trigger update
    if (editor) {
      const selected = editor.getSelected();
      if (selected) {
        editor.trigger('component:update', selected);
      }
    }
  }, [getCanvasDocument, isRTEActive, editor]);

  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleStrikethrough = () => execCommand("strikeThrough");
  const handleRemoveFormat = () => execCommand("removeFormat");

  // Font family handler
  const handleFontFamily = useCallback((family: string) => {
    execCommand("fontName", family);
    setFontFamily(family);
    setShowFontDropdown(false);
  }, [execCommand]);

  // Font size handlers
  const handleFontSizeChange = useCallback((delta: number) => {
    const newSize = Math.max(6, Math.min(72, fontSize + delta));
    setFontSize(newSize);
    wrapSelectionWithStyle("font-size", `${newSize}px`);
  }, [fontSize, wrapSelectionWithStyle]);

  // Text color handler
  const handleTextColor = useCallback((color: string) => {
    execCommand("foreColor", color);
    setTextColor(color);
  }, [execCommand]);

  // Alignment handler - cycles through left -> center -> right -> justify -> left
  // Applies text-align directly to the containing block element (p, div, li)
  // instead of using execCommand which can affect sibling paragraphs
  const handleAlignmentCycle = useCallback(() => {
    const canvasDoc = getCanvasDocument();
    if (!canvasDoc || !isRTEActive) return;

    const alignments: Array<'left' | 'center' | 'right' | 'justify'> = ['left', 'center', 'right', 'justify'];
    const currentIndex = alignments.indexOf(alignment);
    const nextIndex = (currentIndex + 1) % alignments.length;
    const nextAlignment = alignments[nextIndex];
    setAlignment(nextAlignment);

    // Find the block-level element containing the selection
    const selection = canvasDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let node: Node | null = selection.anchorNode;
    let blockElement: HTMLElement | null = null;

    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as HTMLElement).tagName;
        if (tag === "P" || tag === "DIV" || tag === "LI" || tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6") {
          blockElement = node as HTMLElement;
          break;
        }
      }
      node = node.parentNode;
    }

    if (blockElement) {
      if (nextAlignment === "left") {
        blockElement.style.removeProperty("text-align");
      } else {
        blockElement.style.textAlign = nextAlignment;
      }

      if (editor) {
        const selected = editor.getSelected();
        if (selected) {
          editor.trigger("component:update", selected);
        }
      }
    }
  }, [alignment, getCanvasDocument, isRTEActive, editor]);

  // List state
  const [listType, setListType] = useState<'none' | 'bullet' | 'numbered'>('none');

  // List handler - cycles through none -> bullet -> numbered -> none
  const handleListCycle = useCallback(() => {
    const types: Array<'none' | 'bullet' | 'numbered'> = ['none', 'bullet', 'numbered'];
    const currentIndex = types.indexOf(listType);
    const nextIndex = (currentIndex + 1) % types.length;
    const nextType = types[nextIndex];
    setListType(nextType);

    // Remove current list first if switching types
    if (listType === 'bullet') {
      execCommand("insertUnorderedList"); // Toggle off
    } else if (listType === 'numbered') {
      execCommand("insertOrderedList"); // Toggle off
    }

    // Apply new list type
    if (nextType === 'bullet') {
      execCommand("insertUnorderedList");
    } else if (nextType === 'numbered') {
      execCommand("insertOrderedList");
    }
  }, [listType, execCommand]);

  // Letter spacing handler
  const handleLetterSpacing = useCallback((delta: number) => {
    const newSpacing = Math.max(-2, Math.min(10, letterSpacing + delta));
    setLetterSpacing(newSpacing);
    wrapSelectionWithStyle("letter-spacing", `${newSpacing}px`);
  }, [letterSpacing, wrapSelectionWithStyle]);

  const handleLinkClick = useCallback(() => {
    const canvasDoc = getCanvasDocument();
    if (!canvasDoc || !isRTEActive || !editor) return;

    const selection = canvasDoc.getSelection();
    const text = selection?.toString() || "";

    if (text) {
      savedComponentRef.current = editor.getSelected();
      setSelectedText(text);
    }
    setIsLinkModalOpen(true);
  }, [getCanvasDocument, isRTEActive, editor]);

  const handleInsertLink = useCallback((url: string, text?: string) => {
    if (!editor) return;

    const component = savedComponentRef.current;
    const textToReplace = selectedText.trim().replace(/\s+/g, ' ');

    if (component && textToReplace) {
      const el = component.getEl();

      if (el) {
        const linkText = (text || selectedText).trim();
        const linkHtml = `<a href="${url}" target="_blank">${linkText}</a>`;

        const oldHtml = el.innerHTML;
        const normalizedHtml = oldHtml.replace(/\s+/g, ' ');

        if (normalizedHtml.includes(textToReplace)) {
          const escapedText = textToReplace
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/ /g, '\\s+');
          const regex = new RegExp(escapedText);

          const newHtml = oldHtml.replace(regex, linkHtml);

          if (newHtml !== oldHtml) {
            el.innerHTML = newHtml;
            editor.trigger('component:update', component);
          }
        }
      }
    }

    savedComponentRef.current = null;
    setIsLinkModalOpen(false);
    setSelectedText("");
  }, [editor, selectedText]);

  const stopEventPropagation = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);

  // Close dropdowns when clicking elsewhere
  const closeDropdowns = useCallback(() => {
    setShowFontDropdown(false);
    setShowColorPicker(false);
    setShowSpacingControl(false);
  }, []);

  const currentFontLabel = FONT_FAMILIES.find(f => f.value === fontFamily)?.label || "Arial";

  // Close all dropdowns when RTE is deactivated (user clicked away)
  useEffect(() => {
    if (!isRTEActive) {
      closeDropdowns();
    }
  }, [isRTEActive, closeDropdowns]);

  // Detect current font size from selection so +/- work relative to actual size
  useEffect(() => {
    if (!isRTEActive || !editor) return;
    const canvasDoc = getCanvasDocument();
    if (!canvasDoc) return;

    const handleSelectionChange = () => {
      const selection = canvasDoc.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;

      const element =
        anchorNode.nodeType === Node.TEXT_NODE
          ? anchorNode.parentElement
          : (anchorNode as HTMLElement);

      if (element) {
        const computed = canvasDoc.defaultView?.getComputedStyle(element);
        if (computed) {
          const size = parseFloat(computed.fontSize);
          if (!isNaN(size)) {
            setFontSize(Math.round(size));
          }
        }
      }
    };

    canvasDoc.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      canvasDoc.removeEventListener("selectionchange", handleSelectionChange);
  }, [isRTEActive, editor, getCanvasDocument]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="h-9 bg-gray-100 border-b border-gray-200 flex items-center justify-center px-3 gap-1"
        onMouseDown={stopEventPropagation}
        onMouseUp={stopEventPropagation}
        onClick={(e) => {
          stopEventPropagation(e);
          closeDropdowns();
        }}
      >
        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={!isRTEActive}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRTEActive) {
                setShowFontDropdown(!showFontDropdown);
                setShowColorPicker(false);
                setShowSpacingControl(false);
              }
            }}
            onClick={(e) => {
              // Stop click from bubbling to parent which would call closeDropdowns()
              e.stopPropagation();
            }}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs min-w-[80px]
              ${!isRTEActive
                ? "text-gray-300 cursor-not-allowed bg-gray-50"
                : "text-gray-700 hover:bg-gray-200 bg-white border border-gray-300"
              }
            `}
          >
            <span className="truncate">{currentFontLabel}</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>
          {showFontDropdown && isRTEActive && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[140px] max-h-[300px] overflow-y-auto"
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontFamily(font.value);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Font Size Controls */}
        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.preventDefault()}>
          <button
            type="button"
            disabled={!isRTEActive}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRTEActive) handleFontSizeChange(-1);
            }}
            className={`p-1 rounded ${!isRTEActive ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}`}
            title="Decrease font size"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            value={fontSize}
            disabled={!isRTEActive}
            min={6}
            max={72}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const newSize = Math.max(6, Math.min(72, parseInt(e.target.value) || 12));
              setFontSize(newSize);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                wrapSelectionWithStyle("font-size", `${fontSize}px`);
              }
            }}
            className={`text-xs w-[36px] text-center border rounded px-1 py-0.5
              ${!isRTEActive
                ? "text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed"
                : "text-gray-700 bg-white border-gray-300 focus:outline-none focus:border-blue-400"
              }
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            `}
          />
          <button
            type="button"
            disabled={!isRTEActive}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRTEActive) handleFontSizeChange(1);
            }}
            className={`p-1 rounded ${!isRTEActive ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}`}
            title="Increase font size"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            disabled={!isRTEActive}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRTEActive) {
                setShowColorPicker(!showColorPicker);
                setShowFontDropdown(false);
                setShowSpacingControl(false);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`
              p-1.5 rounded transition-colors flex flex-col items-center
              ${!isRTEActive ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}
            `}
            title="Text color"
          >
            <span className="text-xs font-bold leading-none">A</span>
            <div
              className="w-4 h-1 mt-0.5 rounded-sm"
              style={{ backgroundColor: isRTEActive ? textColor : "#d1d5db" }}
            />
          </button>
          {showColorPicker && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3"
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <div className="grid grid-cols-8 gap-1.5 place-items-center">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTextColor(color);
                    }}
                    className={`w-5 h-5 rounded-full hover:scale-125 transition-transform ${
                      textColor === color ? "ring-2 ring-blue-500 ring-offset-1" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <HexColorPicker
                  color={textColor}
                  onChange={handleTextColor}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: textColor }}
                />
                <input
                  type="text"
                  value={textColor}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTextColor(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      handleTextColor(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && /^#[0-9A-Fa-f]{6}$/.test(textColor)) {
                      handleTextColor(textColor);
                    }
                  }}
                  className="text-xs px-2 py-1 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-blue-500 font-mono flex-1"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <ToolbarButton
          icon={<Bold className="w-4 h-4" />}
          title="Bold (Ctrl+B)"
          disabled={!isRTEActive}
          onAction={handleBold}
        />

        <ToolbarButton
          icon={<Italic className="w-4 h-4" />}
          title="Italic (Ctrl+I)"
          disabled={!isRTEActive}
          onAction={handleItalic}
        />

        <ToolbarButton
          icon={<Underline className="w-4 h-4" />}
          title="Underline (Ctrl+U)"
          disabled={!isRTEActive}
          onAction={handleUnderline}
        />

        <ToolbarButton
          icon={<Strikethrough className="w-4 h-4" />}
          title="Strikethrough"
          disabled={!isRTEActive}
          onAction={handleStrikethrough}
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolbarButton
          icon={<LinkIcon className="w-4 h-4" />}
          title="Insert Link"
          disabled={!isRTEActive}
          onAction={handleLinkClick}
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Alignment - single button that cycles through alignments */}
        <ToolbarButton
          icon={
            alignment === 'left' ? <AlignLeft className="w-4 h-4" /> :
            alignment === 'center' ? <AlignCenter className="w-4 h-4" /> :
            alignment === 'right' ? <AlignRight className="w-4 h-4" /> :
            <AlignJustify className="w-4 h-4" />
          }
          title={`Align ${alignment.charAt(0).toUpperCase() + alignment.slice(1)} (click to cycle)`}
          disabled={!isRTEActive}
          onAction={handleAlignmentCycle}
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists - single button that cycles through none -> bullet -> numbered */}
        <ToolbarButton
          icon={
            listType === 'bullet' ? <List className="w-4 h-4" /> :
            listType === 'numbered' ? <ListOrdered className="w-4 h-4" /> :
            <List className="w-4 h-4" />
          }
          title={
            listType === 'none' ? "Add Bullet List" :
            listType === 'bullet' ? "Switch to Numbered List" :
            "Remove List"
          }
          disabled={!isRTEActive}
          onAction={handleListCycle}
          active={listType !== 'none'}
        />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Letter Spacing */}
        <div className="relative">
          <button
            type="button"
            disabled={!isRTEActive}
            onMouseDown={(e) => {
              e.preventDefault();
              if (isRTEActive) {
                setShowSpacingControl(!showSpacingControl);
                setShowFontDropdown(false);
                setShowColorPicker(false);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`
              p-1.5 rounded transition-colors flex items-center gap-0.5
              ${!isRTEActive ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}
            `}
            title="Letter spacing"
          >
            <CaseSensitive className="w-4 h-4" />
          </button>
          {showSpacingControl && isRTEActive && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-2"
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleLetterSpacing(-0.5);
                  }}
                  className="p-1 rounded text-gray-700 hover:bg-gray-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs min-w-[32px] text-center text-gray-700">
                  {letterSpacing}px
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleLetterSpacing(0.5);
                  }}
                  className="p-1 rounded text-gray-700 hover:bg-gray-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Remove Formatting */}
        <ToolbarButton
          icon={<RemoveFormatting className="w-4 h-4" />}
          title="Remove Formatting"
          disabled={!isRTEActive}
          onAction={handleRemoveFormat}
        />

      </div>

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSelectedText("");
        }}
        onInsert={handleInsertLink}
        initialText={selectedText}
      />
    </>
  );
}
