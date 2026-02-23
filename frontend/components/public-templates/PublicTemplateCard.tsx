import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ExternalLink } from "lucide-react";
import {
  getTemplateUrl,
  getTemplateEditorUrl,
  type PublicTemplate,
} from "@/libs/templates";

type PublicTemplateCardProps = {
  template: PublicTemplate;
};

export function PublicTemplateCard({ template }: PublicTemplateCardProps) {
  const templateUrl = getTemplateUrl(template);
  const editorUrl = getTemplateEditorUrl(template);
  const isLandscape = template.page_orientation === "landscape";

  return (
    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden !py-0 !gap-0">
      <Link href={templateUrl} className="block group">
        <div className="px-2 py-2 bg-gray-50">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">
              {template.name}
            </h3>
          </div>

          <div className="w-full flex items-center justify-center">
            <div
              className={`relative w-full ${isLandscape ? "aspect-[297/210]" : "aspect-[210/297]"}`}
            >
              {(template.thumbnail_sm_url || template.thumbnail_url) ? (
                <div className="w-full h-full shadow-md border border-gray-200 rounded overflow-hidden">
                  <img
                    src={template.thumbnail_sm_url || template.thumbnail_url!}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-full shadow-md border border-gray-200 rounded bg-white flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="px-2 pb-2 pt-1 bg-gray-50 flex flex-col gap-1.5">
        <Link href={editorUrl} className="w-full">
          <Button size="sm" variant="outline" className="w-full text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Open in Editor
          </Button>
        </Link>
        {template.preview_url && (
          <Link
            href={template.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1"
          >
            View PDF
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </Card>
  );
}
