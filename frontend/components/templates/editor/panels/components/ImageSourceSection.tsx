import React, { useState, useEffect, useRef } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { Upload } from "lucide-react";
import { createClient } from "@/libs/supabase/client";

interface ImageSourceSectionProps {
  component: any;
}

export function ImageSourceSection({ component }: ImageSourceSectionProps) {
  const [source, setSource] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user ID for storage path
  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    fetchUserId();
  }, []);

  // Load current src from component
  useEffect(() => {
    if (component) {
      // Check model property first, then attributes
      const modelSrc = component.get('src');
      const attrs = component.getAttributes();
      setSource(modelSrc || attrs.src || "");
    }
  }, [component]);

  // Update component src attribute
  const handleSourceChange = (value: string) => {
    setSource(value);
    if (component) {
      // Set both as model property and as attribute to ensure GrapesJS picks it up
      component.set('src', value);
      component.setAttributes({ ...component.getAttributes(), src: value });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !component || !userId) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `template-images/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      handleSourceChange(urlData.publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <CollapsibleSection title="Image Source" defaultOpen>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Source URL or Variable
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => handleSourceChange(e.target.value)}
            placeholder="https://... or {{_image_url_1}}"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !userId}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
