"use client";

import { useEffect, useState } from "react";

const columnCounts = [2, 3, 4, 6];

export default function ColumnsDemo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % columnCounts.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const current = columnCounts[index];

  return (
    <h3 className="text-2xl font-semibold text-gray-900 mb-2 h-[36px] flex items-center">
      <span className="text-primary">{current} Columns</span>
      <span className="mx-2 text-gray-400">|</span>
      <span className="font-mono text-lg">{current * 6} barcodes per page</span>
    </h3>
  );
}
