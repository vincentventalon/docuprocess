"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const workflows = [
  { input: { name: "Typeform", icon: "/zapier_typeform.png" }, output: { name: "Gmail", icon: "/zapier_gmail.png" } },
  { input: { name: "Google Sheets", icon: "/zapier_google_sheets.png" }, output: { name: "Google Drive", icon: "/zapier_google_drive.png" } },
  { input: { name: "Shopify", icon: "/zapier_shopify.png" }, output: { name: "Gmail", icon: "/zapier_gmail.png" } },
  { input: { name: "HubSpot", icon: "/zapier_hubspot.png" }, output: { name: "Google Drive", icon: "/zapier_google_drive.png" } },
];

export function ZapierWorkflowAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exiting" | "entering">("visible");

  useEffect(() => {
    const interval = setInterval(() => {
      // Phase 1: Exit to right
      setPhase("exiting");
      setTimeout(() => {
        // Phase 2: Change content, position at left
        setCurrentIndex((prev) => (prev + 1) % workflows.length);
        setPhase("entering");
        // Phase 3: Animate in from left
        setTimeout(() => {
          setPhase("visible");
        }, 50);
      }, 150);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentWorkflow = workflows[currentIndex];

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-0">
        {/* Trigger App */}
        <div
          className={`border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-32 bg-white dark:bg-slate-800 ${
            phase === "entering" ? "" : "transition-all duration-150"
          } ${
            phase === "exiting" ? "translate-x-full opacity-0" :
            phase === "entering" ? "-translate-x-full opacity-0" :
            "translate-x-0 opacity-100"
          }`}
        >
          <Image
            src={currentWorkflow.input.icon}
            alt={currentWorkflow.input.name}
            width={140}
            height={140}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Connector line */}
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />

        {/* YourApp */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-32 bg-white dark:bg-slate-800">
          <Image
            src="/zapier_yourapp.png"
            alt="YourApp"
            width={140}
            height={140}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Connector line */}
        <div className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600" />

        {/* Output App */}
        <div
          className={`border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-32 bg-white dark:bg-slate-800 ${
            phase === "entering" ? "" : "transition-all duration-150"
          } ${
            phase === "exiting" ? "translate-x-full opacity-0" :
            phase === "entering" ? "-translate-x-full opacity-0" :
            "translate-x-0 opacity-100"
          }`}
        >
          <Image
            src={currentWorkflow.output.icon}
            alt={currentWorkflow.output.name}
            width={140}
            height={140}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
