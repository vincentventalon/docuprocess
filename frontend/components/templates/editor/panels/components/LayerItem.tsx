import React, { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Type,
  Image,
  Table,
  Barcode,
  QrCode,
  Box,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Square,
  ChevronRight,
  ChevronDown,
  FileText,
  Repeat,
  BringToFront,
  SendToBack,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LayerData {
  id: string;
  name: string;
  type: string;
  component: any;
  children: LayerData[];
  depth: number;
  parentId: string | null;
}

interface LayerItemProps {
  layer: LayerData;
  isSelected: boolean;
  isDragging: boolean;
  dragOverPosition: "before" | "after" | "inside" | null;
  isDraggable: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onRename: (_newName: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  canReorder?: boolean;
  onDragStart: (_event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (_event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (_event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  // For rendering children
  renderChildren?: () => React.ReactNode;
}

const typeIcons: Record<string, React.ReactNode> = {
  page: <FileText className="w-4 h-4 text-slate-600" />,
  header: <LayoutTemplate className="w-4 h-4 text-blue-500" />,
  footer: <LayoutTemplate className="w-4 h-4 text-blue-500" />,
  section: <Box className="w-4 h-4 text-purple-500" />,
  text: <Type className="w-4 h-4 text-gray-500" />,
  div: <Type className="w-4 h-4 text-gray-500" />,
  image: <Image className="w-4 h-4 text-green-500" />,
  table: <Table className="w-4 h-4 text-orange-500" />,
  barcode: <Barcode className="w-4 h-4 text-gray-700" />,
  qrcode: <QrCode className="w-4 h-4 text-gray-700" />,
};

function getLayerIcon(type: string) {
  return typeIcons[type] || <Square className="w-4 h-4 text-gray-400" />;
}

export function LayerItem({
  layer,
  isSelected,
  isDragging,
  dragOverPosition,
  isDraggable,
  isExpanded,
  onToggleExpand,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  canReorder,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  renderChildren,
}: LayerItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== layer.name) {
      onRename(trimmed);
    } else {
      setEditName(layer.name);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setEditName(layer.name);
      setIsRenaming(false);
    }
  };

  const startRename = () => {
    setEditName(layer.name);
    setIsRenaming(true);
  };

  const isProtected = layer.type === "header" || layer.type === "footer" || layer.type === "page";
  const hasChildren = layer.children.length > 0;
  const canHaveChildren = layer.type === "section" || layer.type === "header" || layer.type === "footer" || layer.type === "page";
  const indentPx = layer.depth * 16;

  const content = (
    <div
      className={cn(
        "flex items-center gap-1 py-1.5 pr-3 cursor-pointer hover:bg-gray-100 group",
        isSelected && "bg-blue-50 hover:bg-blue-100",
        isDragging && "opacity-60",
        dragOverPosition === "before" && "border-t-2 border-blue-400",
        dragOverPosition === "after" && "border-b-2 border-blue-400",
        dragOverPosition === "inside" && "bg-blue-100 ring-1 ring-blue-400 ring-inset"
      )}
      style={{ paddingLeft: `${12 + indentPx}px` }}
      onClick={onSelect}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Expand/collapse chevron */}
      {canHaveChildren ? (
        <button
          className="p-0.5 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
        </button>
      ) : (
        <span className="w-4" />
      )}

      {getLayerIcon(layer.type)}

      {layer.type === "section" && layer.component?.getAttributes?.()?.['data-repeat-source'] && (
        <Repeat className="w-3 h-3 text-indigo-400 flex-shrink-0" />
      )}

      {isRenaming ? (
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className="h-6 py-0 px-1 text-sm flex-1"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-sm truncate flex-1 ml-1" title={layer.name}>
          {layer.name}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity",
              isSelected && "opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={startRename} className="gap-2 cursor-pointer">
            <Pencil className="w-4 h-4" />
            Rename
          </DropdownMenuItem>
          {!isProtected && (
            <DropdownMenuItem onClick={onDuplicate} className="gap-2 cursor-pointer">
              <Copy className="w-4 h-4" />
              Duplicate
            </DropdownMenuItem>
          )}
          {canReorder && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBringToFront} className="gap-2 cursor-pointer">
                <BringToFront className="w-4 h-4" />
                Bring to Front
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSendToBack} className="gap-2 cursor-pointer">
                <SendToBack className="w-4 h-4" />
                Send to Back
              </DropdownMenuItem>
            </>
          )}
          {layer.type !== "page" && (
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem onClick={startRename} className="gap-2 cursor-pointer">
            <Pencil className="w-4 h-4" />
            Rename
          </ContextMenuItem>
          {!isProtected && (
            <ContextMenuItem onClick={onDuplicate} className="gap-2 cursor-pointer">
              <Copy className="w-4 h-4" />
              Duplicate
            </ContextMenuItem>
          )}
          {canReorder && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={onBringToFront} className="gap-2 cursor-pointer">
                <BringToFront className="w-4 h-4" />
                Bring to Front
              </ContextMenuItem>
              <ContextMenuItem onClick={onSendToBack} className="gap-2 cursor-pointer">
                <SendToBack className="w-4 h-4" />
                Send to Back
              </ContextMenuItem>
            </>
          )}
          {layer.type !== "page" && (
            <ContextMenuItem
              onClick={onDelete}
              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
      {/* Render children when expanded */}
      {isExpanded && renderChildren && renderChildren()}
    </>
  );
}
