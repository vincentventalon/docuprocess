"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorCTABanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
      <div className="flex items-center justify-center gap-4 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>
            Like this template? Sign up free to edit and generate unlimited PDFs.
          </span>
        </div>
        <Link href="/signin?redirect=/dashboard/browse-examples">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            Get Started Free
          </Button>
        </Link>
      </div>
    </div>
  );
}
