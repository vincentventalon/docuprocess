import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Plus, Type, Image, Table, Barcode, QrCode, Minus, Circle, Square, Shapes } from "lucide-react";

export type ElementType = "text" | "image" | "table" | "barcode" | "qrcode" | "section" | "shape-line" | "shape-circle" | "shape-rectangle";

interface NewElementDropdownProps {
  onAddElement: (type: ElementType) => void;
}

const elements: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
  { type: "image", label: "Image", icon: <Image className="w-4 h-4" /> },
  { type: "table", label: "Table", icon: <Table className="w-4 h-4" /> },
  { type: "barcode", label: "Barcode", icon: <Barcode className="w-4 h-4" /> },
  { type: "qrcode", label: "QR Code", icon: <QrCode className="w-4 h-4" /> },
];

const shapeElements: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  { type: "shape-line", label: "Line", icon: <Minus className="w-4 h-4" /> },
  { type: "shape-circle", label: "Circle", icon: <Circle className="w-4 h-4" /> },
  { type: "shape-rectangle", label: "Rectangle", icon: <Square className="w-4 h-4" /> },
];

export function NewElementDropdown({ onAddElement }: NewElementDropdownProps) {
  return (
    <div className="px-3 py-3 border-b border-gray-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            New Element
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {elements.map((element) => (
            <DropdownMenuItem
              key={element.type}
              onClick={() => onAddElement(element.type)}
              className="gap-2 cursor-pointer"
            >
              {element.icon}
              {element.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <Shapes className="w-4 h-4" />
              Decorations
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              {shapeElements.map((element) => (
                <DropdownMenuItem
                  key={element.type}
                  onClick={() => onAddElement(element.type)}
                  className="gap-2 cursor-pointer"
                >
                  {element.icon}
                  {element.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
