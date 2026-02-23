import React, { useState, useRef, useEffect } from "react";
import { PageFormat, PageOrientation, PAGE_FORMATS, PAGE_DIMENSIONS_MM } from "@/types/page-settings";
import { cn } from "@/lib/utils";

interface TemplateInfoProps {
  name: string;
  format: PageFormat;
  orientation: PageOrientation;
  onNameChange?: (name: string) => void;
  onFormatChange?: (format: PageFormat) => void;
  onOrientationChange?: (orientation: PageOrientation) => void;
}

export function TemplateInfo({
  name,
  format,
  orientation,
  onNameChange,
  onFormatChange,
  onOrientationChange,
}: TemplateInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when name prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(name);
    }
  }, [name, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name && onNameChange) {
      onNameChange(trimmed);
    } else {
      setEditValue(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditValue(name);
      setIsEditing(false);
    }
  };

  return (
    <div className="px-3 py-3 border-b border-gray-200">
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Nom du template"
        className={cn(
          "w-full px-2 py-1.5 text-sm font-medium rounded border transition-colors",
          "outline-none focus:ring-2 focus:ring-blue-500",
          isEditing
            ? "bg-white border-gray-300 text-gray-900"
            : "bg-gray-100 border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50"
        )}
      />
      <div className="flex gap-2 mt-2">
        <select
          value={format}
          onChange={(e) => onFormatChange?.(e.target.value as PageFormat)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-white focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
        >
          {PAGE_FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={orientation}
          onChange={(e) => onOrientationChange?.(e.target.value as PageOrientation)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-white focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-center">
        {orientation === "portrait"
          ? `${PAGE_DIMENSIONS_MM[format].width} × ${PAGE_DIMENSIONS_MM[format].height} mm`
          : `${PAGE_DIMENSIONS_MM[format].height} × ${PAGE_DIMENSIONS_MM[format].width} mm`}
      </div>
    </div>
  );
}
