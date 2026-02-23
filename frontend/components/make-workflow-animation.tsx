"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const workflows = [
  { input: { name: "Google Sheets", icon: "/make_google_sheet.png", color: "#97d1b0" }, output: { name: "Google Drive", icon: "/make_google_drive.png", color: "#fae3a6" } },
  { input: { name: "Shopify", icon: "/make_shopify.png", color: "#c7dda2" }, output: { name: "Gmail", icon: "/make_google_gmail.png", color: "#f6a099" } },
  { input: { name: "Airtable", icon: "/make_airtable.png", color: "#97dcfc" }, output: { name: "Google Drive", icon: "/make_google_drive.png", color: "#fae3a6" } },
  { input: { name: "HubSpot", icon: "/make_hubspot_crm.png", color: "#fdb9a9" }, output: { name: "Gmail", icon: "/make_google_gmail.png", color: "#f6a099" } },
];

const YOURAPP_COLOR = "#c2aaf7";

// Helper to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7));
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function MakeWorkflowAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % workflows.length);
        setIsTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentWorkflow = workflows[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-1 md:gap-2">
        {/* Left App Icon */}
        <div className="relative">
          <div
            className={`w-32 h-32 md:w-40 md:h-40 transition-all duration-300 ${
              isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <Image
              src={currentWorkflow.input.icon}
              alt={currentWorkflow.input.name}
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Connection Line 1 - gradient bubbles from input to yourapp */}
        <div className="flex items-center gap-2 md:gap-3 -mt-8 md:-mt-10">
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${currentWorkflow.input.color}, ${interpolateColor(currentWorkflow.input.color, YOURAPP_COLOR, 0.33)})`
            }}
          />
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${interpolateColor(currentWorkflow.input.color, YOURAPP_COLOR, 0.33)}, ${interpolateColor(currentWorkflow.input.color, YOURAPP_COLOR, 0.66)})`
            }}
          />
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${interpolateColor(currentWorkflow.input.color, YOURAPP_COLOR, 0.66)}, ${YOURAPP_COLOR})`
            }}
          />
        </div>

        {/* Middle YourApp Icon */}
        <div className="w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/make_yourapp_generate_pdf.png"
            alt="YourApp"
            width={160}
            height={160}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Connection Line 2 - gradient bubbles from yourapp to output */}
        <div className="flex items-center gap-2 md:gap-3 -mt-8 md:-mt-10">
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${YOURAPP_COLOR}, ${interpolateColor(YOURAPP_COLOR, currentWorkflow.output.color, 0.33)})`
            }}
          />
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${interpolateColor(YOURAPP_COLOR, currentWorkflow.output.color, 0.33)}, ${interpolateColor(YOURAPP_COLOR, currentWorkflow.output.color, 0.66)})`
            }}
          />
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              background: `linear-gradient(to right, ${interpolateColor(YOURAPP_COLOR, currentWorkflow.output.color, 0.66)}, ${currentWorkflow.output.color})`
            }}
          />
        </div>

        {/* Right Output Icon (Gmail/Drive) */}
        <div
          className={`w-32 h-32 md:w-40 md:h-40 transition-all duration-300 ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <Image
            src={currentWorkflow.output.icon}
            alt={currentWorkflow.output.name}
            width={160}
            height={160}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
