import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SectionTogglesProps {
  hasHeader: boolean;
  hasFooter: boolean;
  onHeaderToggle: (enabled: boolean) => void;
  onFooterToggle: (enabled: boolean) => void;
  onAddSection?: () => void;
}

export function SectionToggles({
  hasHeader,
  hasFooter,
  onHeaderToggle,
  onFooterToggle,
  onAddSection,
}: SectionTogglesProps) {
  return (
    <div className="px-3 py-3 border-b border-gray-200 space-y-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="header-toggle"
            checked={hasHeader}
            onCheckedChange={(checked) => onHeaderToggle(checked === true)}
          />
          <Label
            htmlFor="header-toggle"
            className="text-sm font-normal cursor-pointer"
          >
            Header
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="footer-toggle"
            checked={hasFooter}
            onCheckedChange={(checked) => onFooterToggle(checked === true)}
          />
          <Label
            htmlFor="footer-toggle"
            className="text-sm font-normal cursor-pointer"
          >
            Footer
          </Label>
        </div>
      </div>
      {onAddSection && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onAddSection}
        >
          <Plus className="w-4 h-4" />
          New Section
        </Button>
      )}
    </div>
  );
}
