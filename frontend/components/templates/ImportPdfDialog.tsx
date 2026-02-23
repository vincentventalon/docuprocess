"use client";

import * as React from "react";
import { useState } from "react";
import { FileText, Infinity as InfinityIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type TemplateMode = "fixed" | "infinite";

export function ImportPdfDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"mode" | "upload">("mode");
  const [selectedMode, setSelectedMode] = useState<TemplateMode | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedMode) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", selectedMode === "infinite" ? "infinity" : "fixed");

      const response = await fetch("/api/templates/import-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import PDF");
      }

      if (data.import_details?.warnings?.length > 0) {
        data.import_details.warnings.forEach((warning: string) => {
          toast(warning, { icon: "⚠️", duration: 5000 });
        });
      }

      toast.success(`Template created: ${data.template.name}`);
      handleClose();
      // Redirect to designer with the new template (use short_id)
      window.location.href = `/dashboard/templates/designer?template_id=${data.template.short_id}`;
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setStep("mode");
    setSelectedMode(null);
    setFile(null);
    setOpen(false);
  };

  const handleContinue = () => {
    if (selectedMode) {
      setStep("upload");
    }
  };

  const handleBack = () => {
    setStep("mode");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {step === "mode" ? (
          <>
            <DialogHeader>
              <DialogTitle>Import Template from PDF</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose a template mode. This cannot be changed later.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Fixed Mode Card */}
                <button
                  onClick={() => setSelectedMode("fixed")}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all text-left",
                    selectedMode === "fixed"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                    selectedMode === "fixed" ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <FileText className={cn(
                      "w-6 h-6",
                      selectedMode === "fixed" ? "text-blue-600" : "text-gray-600"
                    )} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Fixed</h3>
                  <p className="text-xs text-gray-500 text-center">
                    Best for certificates, simple invoices, and fixed layout documents
                  </p>
                </button>

                {/* Infinite Mode Card */}
                <button
                  onClick={() => setSelectedMode("infinite")}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all text-left",
                    selectedMode === "infinite"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                    selectedMode === "infinite" ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <InfinityIcon className={cn(
                      "w-6 h-6",
                      selectedMode === "infinite" ? "text-blue-600" : "text-gray-600"
                    )} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Infinite</h3>
                  <p className="text-xs text-gray-500 text-center">
                    Best for invoices, reports, and documents with repeating sections
                  </p>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleContinue} disabled={!selectedMode}>
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Upload PDF</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload a PDF file to convert it into an editable template.
                Max 10 pages, 10MB.
              </p>

              {!file ? (
                <label
                  htmlFor="pdf-file"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only</p>
                  </div>
                  <input
                    id="pdf-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={isUploading}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!file || isUploading}>
                  {isUploading ? "Importing..." : "Import"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
