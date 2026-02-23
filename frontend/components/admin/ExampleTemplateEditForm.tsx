"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/libs/supabase/client";

const CATEGORIES = [
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "certificate", label: "Certificate" },
  { value: "letter", label: "Letter" },
  { value: "report", label: "Report" },
  { value: "contract", label: "Contract" },
  { value: "packing_slip", label: "Packing Slip" },
  { value: "label", label: "Label" },
];

type Feature = { label: string; description: string };
type About = { heading: string; paragraphs: string[] };

type ExampleTemplateEditFormProps = {
  templateId: string;
};

export function ExampleTemplateEditForm({ templateId }: ExampleTemplateEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [seoFeatures, setSeoFeatures] = useState<Feature[]>([]);
  const [seoAbout, setSeoAbout] = useState<About>({ heading: "About This Template", paragraphs: [] });

  useEffect(() => {
    async function fetchTemplate() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("example_templates")
        .select("name, slug, description, category, tags, seo_features, seo_about")
        .eq("id", templateId)
        .single();

      if (error || !data) {
        setError("Template not found");
        setIsLoading(false);
        return;
      }

      setName(data.name || "");
      setSlug(data.slug || "");
      setDescription(data.description || "");
      setCategory(data.category || "");
      setTags(data.tags || []);
      setSeoFeatures(data.seo_features || []);
      setSeoAbout(data.seo_about || { heading: "About This Template", paragraphs: [] });
      setIsLoading(false);
    }
    fetchTemplate();
  }, [templateId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .update({
          name,
          slug: slug || null,
          description: description || null,
          category: category || null,
          tags: tags.length > 0 ? tags : null,
          seo_features: seoFeatures.length > 0 ? seoFeatures : null,
          seo_about: seoAbout.paragraphs.length > 0 ? seoAbout : null,
        })
        .eq("id", templateId);

      if (error) throw error;
      router.push("/dashboard/admin/example-templates");
      router.refresh();
    } catch {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addFeature = () => {
    setSeoFeatures([...seoFeatures, { label: "", description: "" }]);
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updated = [...seoFeatures];
    updated[index] = { ...updated[index], [field]: value };
    setSeoFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setSeoFeatures(seoFeatures.filter((_, i) => i !== index));
  };

  const addParagraph = () => {
    setSeoAbout({ ...seoAbout, paragraphs: [...seoAbout.paragraphs, ""] });
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...seoAbout.paragraphs];
    updated[index] = value;
    setSeoAbout({ ...seoAbout, paragraphs: updated });
  };

  const removeParagraph = (index: number) => {
    setSeoAbout({
      ...seoAbout,
      paragraphs: seoAbout.paragraphs.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-red-600">{error}</p>
        <Link href="/dashboard/admin/example-templates" className="text-blue-600 underline mt-2 inline-block">
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin/example-templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Template</h1>
      </div>

      {/* Section 1: Basic Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/--+/g, "-")
                )
              }
              placeholder="my-template-slug"
            />
            {slug && (
              <p className="text-xs text-gray-500">
                URL: /templates/{category ? <><span className="text-blue-600">{category.replace(/_/g, "-")}</span>/</> : ""}<span className="text-blue-600">{slug}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: SEO Features */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {seoFeatures.length === 0 && (
            <p className="text-sm text-gray-500">No features yet. Add features to display on the public template page.</p>
          )}
          {seoFeatures.map((feature, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={feature.label}
                  onChange={(e) => updateFeature(index, "label", e.target.value)}
                  placeholder="Feature label"
                />
                <Input
                  value={feature.description}
                  onChange={(e) => updateFeature(index, "description", e.target.value)}
                  placeholder="Feature description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(index)}
                className="text-gray-400 hover:text-red-500 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addFeature} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </CardContent>
      </Card>

      {/* Section 3: SEO About */}
      <Card>
        <CardHeader>
          <CardTitle>SEO About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about-heading">Heading</Label>
            <Input
              id="about-heading"
              value={seoAbout.heading}
              onChange={(e) => setSeoAbout({ ...seoAbout, heading: e.target.value })}
              placeholder="About This Template"
            />
          </div>

          {seoAbout.paragraphs.length === 0 && (
            <p className="text-sm text-gray-500">No paragraphs yet. Add paragraphs to display in the about section.</p>
          )}
          {seoAbout.paragraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                placeholder="Paragraph text"
                rows={3}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeParagraph(index)}
                className="text-gray-400 hover:text-red-500 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addParagraph} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Paragraph
          </Button>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/dashboard/admin/example-templates">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
