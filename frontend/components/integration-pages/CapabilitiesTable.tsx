import { Check, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Capability {
  label: string;
  value: string | boolean;
  tooltip?: string;
}

interface CapabilitiesTableProps {
  platformName: string;
  capabilities: Capability[];
  platformSpecific?: {
    title: string;
    items: string[];
  };
}

export function CapabilitiesTable({
  platformName,
  capabilities,
  platformSpecific,
}: CapabilitiesTableProps) {
  return (
    <div className="space-y-6">
      <div className="bg-background border rounded-2xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b">
          <h3 className="font-semibold">
            YourApp Capabilities in {platformName}
          </h3>
        </div>
        <div className="divide-y">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{cap.label}</span>
                {cap.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{cap.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div>
                {typeof cap.value === "boolean" ? (
                  cap.value ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300" />
                  )
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {cap.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {platformSpecific && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <h4 className="font-semibold text-sm mb-3">{platformSpecific.title}</h4>
          <ul className="space-y-2">
            {platformSpecific.items.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
