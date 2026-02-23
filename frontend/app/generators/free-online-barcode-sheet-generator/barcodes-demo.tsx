"use client";

import { useEffect, useState } from "react";

const demoBarcodes = [
  { code: "SKU-001234", label: "Widget A" },
  { code: "SKU-005678", label: "Widget B" },
  { code: "SKU-009012", label: "Widget C" },
];

export default function BarcodesDemo() {
  const [visibleCodes, setVisibleCodes] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCodes((prev) => (prev >= demoBarcodes.length ? 1 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-2 border-gray-300 rounded-lg px-4 py-3 mb-2 max-w-sm overflow-hidden">
      <div className="grid grid-cols-3 gap-3">
        {demoBarcodes.slice(0, visibleCodes).map((item, i) => (
          <div
            key={i}
            className="text-center animate-in fade-in duration-300"
          >
            <div className="w-16 h-12 mx-auto bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
              {/* Simple barcode SVG representation */}
              <svg viewBox="0 0 48 24" className="w-14 h-8">
                <rect x="2" y="2" width="2" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="6" y="2" width="1" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="9" y="2" width="3" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="14" y="2" width="1" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="17" y="2" width="2" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="21" y="2" width="1" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="24" y="2" width="3" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="29" y="2" width="1" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="32" y="2" width="2" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="36" y="2" width="1" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="39" y="2" width="3" height="20" fill="currentColor" className="text-gray-800" />
                <rect x="44" y="2" width="2" height="20" fill="currentColor" className="text-gray-800" />
              </svg>
            </div>
            <span className="text-xs text-gray-600 mt-1 block truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
