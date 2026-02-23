"use client";

import { useRef } from "react";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function JsonEditor({ value, onChange, placeholder, className = "" }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Sync scroll between textarea and highlight
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Syntax highlight JSON
  const highlightJson = (json: string): string => {
    if (!json.trim()) {
      return `<span class="text-gray-400">${placeholder || ""}</span>`;
    }

    // Escape HTML
    const escaped = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Tokenize and colorize
    return escaped
      // Strings (keys and values)
      .replace(
        /("(?:[^"\\]|\\.)*")\s*:/g,
        '<span class="text-violet-800">$1</span>:'
      )
      // String values
      .replace(
        /:\s*("(?:[^"\\]|\\.)*")/g,
        ': <span class="text-green-700">$1</span>'
      )
      // Standalone strings in arrays
      .replace(
        /(\[|,)\s*("(?:[^"\\]|\\.)*")(?=\s*[,\]])/g,
        '$1 <span class="text-green-700">$2</span>'
      )
      // Numbers
      .replace(
        /:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
        ': <span class="text-blue-600">$1</span>'
      )
      // Numbers in arrays
      .replace(
        /(\[|,)\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)(?=\s*[,\]])/g,
        '$1 <span class="text-blue-600">$2</span>'
      )
      // Boolean true
      .replace(
        /:\s*(true)/g,
        ': <span class="text-green-500">$1</span>'
      )
      // Boolean false
      .replace(
        /:\s*(false)/g,
        ': <span class="text-red-700">$1</span>'
      )
      // Boolean true in arrays
      .replace(
        /(\[|,)\s*(true)(?=\s*[,\]])/g,
        '$1 <span class="text-green-500">$2</span>'
      )
      // Boolean false in arrays
      .replace(
        /(\[|,)\s*(false)(?=\s*[,\]])/g,
        '$1 <span class="text-red-700">$2</span>'
      )
      // Null
      .replace(
        /:\s*(null)/g,
        ': <span class="text-gray-400">$1</span>'
      )
      // Null in arrays
      .replace(
        /(\[|,)\s*(null)(?=\s*[,\]])/g,
        '$1 <span class="text-gray-400">$2</span>'
      );
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      {/* Highlighted display layer */}
      <pre
        ref={highlightRef}
        className="absolute inset-0 p-4 m-0 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap break-words bg-transparent"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlightJson(value) + "\n" }}
      />
      {/* Editable textarea layer */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="absolute inset-0 p-4 font-mono text-sm resize-none border-0 bg-transparent text-transparent caret-gray-800 focus:outline-none focus:ring-0 whitespace-pre-wrap break-words"
        placeholder=""
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  );
}
