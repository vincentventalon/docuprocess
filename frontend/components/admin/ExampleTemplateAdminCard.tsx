"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Settings2,
  Copy,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";

type ExampleTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  page_orientation?: string;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
};

type ExampleTemplateAdminCardProps = {
  template: ExampleTemplate;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
};

export function ExampleTemplateAdminCard({
  template,
  isSelected,
  onToggleSelect,
}: ExampleTemplateAdminCardProps) {
  const router = useRouter();
  const isLandscape = template.page_orientation === "landscape";
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      invoice: "bg-blue-100 text-blue-800",
      receipt: "bg-green-100 text-green-800",
      certificate: "bg-purple-100 text-purple-800",
      letter: "bg-yellow-100 text-yellow-800",
      packing_slip: "bg-orange-100 text-orange-800",
      label: "bg-indigo-100 text-indigo-800",
      shipping_label: "bg-cyan-100 text-cyan-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .delete()
        .eq("id", template.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      alert("Failed to delete template");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      alert("Failed to update status");
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const supabase = createClient();

      // Fetch the full template data
      const { data: fullTemplate, error: fetchError } = await supabase
        .from("example_templates")
        .select("*")
        .eq("id", template.id)
        .single();

      if (fetchError || !fullTemplate) throw fetchError;

      // Create a duplicate with modified name
      const { error: insertError } = await supabase
        .from("example_templates")
        .insert({
          name: `Copy of ${fullTemplate.name}`,
          description: fullTemplate.description,
          category: fullTemplate.category,
          tags: fullTemplate.tags,
          html_content: fullTemplate.html_content,
          css_content: fullTemplate.css_content,
          sample_data: fullTemplate.sample_data,
          paper_format: fullTemplate.paper_format,
          page_orientation: fullTemplate.page_orientation,
          page_padding: fullTemplate.page_padding,
          infinite_mode: fullTemplate.infinite_mode,
          thumbnail_url: fullTemplate.thumbnail_url,
          seo_features: fullTemplate.seo_features,
          seo_about: fullTemplate.seo_about,
          is_active: false, // Default to draft
        });

      if (insertError) throw insertError;
      router.refresh();
    } catch (error) {
      alert("Failed to duplicate template");
      console.error(error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleToggleLock = async () => {
    setIsLocking(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .update({ is_locked: !template.is_locked })
        .eq("id", template.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      alert("Failed to update lock status");
      console.error(error);
    } finally {
      setIsLocking(false);
    }
  };


  return (
    <Card className={`h-full flex flex-col transition-all ${
      isSelected ? "ring-2 ring-blue-500" : ""
    } ${!template.is_active ? "opacity-70" : ""}`}>
      <CardHeader className="space-y-2 relative pb-2">
        {/* Selection checkbox */}
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(template.id)}
            className="bg-white"
          />
        </div>

        {/* Status badges */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
          {/* Lock badge */}
          {isLocking ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          ) : template.is_locked ? (
            <Badge
              className="bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
              onClick={handleToggleLock}
            >
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleToggleLock}
            >
              <Unlock className="h-3 w-3 mr-1" />
              Unlocked
            </Badge>
          )}
          {/* Active/Draft badge */}
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : template.is_active ? (
            <Badge
              className={`bg-green-100 text-green-800 transition-colors ${template.is_locked ? "cursor-default" : "cursor-pointer hover:bg-green-200"}`}
              onClick={template.is_locked ? undefined : handleToggleActive}
            >
              <Eye className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={`transition-colors ${template.is_locked ? "cursor-default" : "cursor-pointer hover:bg-gray-100"}`}
              onClick={template.is_locked ? undefined : handleToggleActive}
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
        </div>

        {/* Thumbnail */}
        <div className="w-full flex items-center justify-center mt-4 px-2">
          <div
            className={`relative w-full ${isLandscape ? "aspect-[297/210]" : "aspect-[210/297]"}`}
          >
            {template.thumbnail_url ? (
              <div className="w-full h-full shadow-md border border-gray-200 rounded overflow-hidden">
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full shadow-md border border-gray-200 rounded bg-white flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                  <span className="text-xs text-gray-400 mt-2 block">No preview</span>
                </div>
              </div>
            )}
            {/* Category badge on thumbnail */}
            {template.category && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                <Badge variant="secondary" className={`${getCategoryColor(template.category)} text-xs shadow-sm`}>
                  {template.category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-2">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{template.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {template.description || "No description"}
        </p>
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2 gap-2">
        <div className="flex gap-2">
          {template.is_locked ? (
            <Button size="sm" variant="outline" disabled>
              <Settings2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Link href={`/dashboard/admin/example-templates/${template.id}/edit`}>
              <Button size="sm" variant="outline">
                <Settings2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          )}
          {template.is_locked ? (
            <Button size="sm" variant="default" disabled>
              <Pencil className="h-4 w-4 mr-1" />
              Template
            </Button>
          ) : (
            <Link href={`/dashboard/admin/example-templates/designer?id=${template.id}`}>
              <Button size="sm" variant="default">
                <Pencil className="h-4 w-4 mr-1" />
                Template
              </Button>
            </Link>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleLock} disabled={isLocking}>
              {isLocking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : template.is_locked ? (
                <Unlock className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {template.is_locked ? "Unlock" : "Lock"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling || template.is_locked}>
              {template.is_active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Set as Draft
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Set as Active
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting || template.is_locked}
              className="text-red-600 focus:text-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

    </Card>
  );
}
