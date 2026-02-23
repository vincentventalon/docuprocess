import {
  ArrowRight,
  CreditCard,
  FileText,
  Mail,
  FolderOpen,
  MessageSquare,
  Zap,
  ShoppingCart,
  Database,
  Globe,
  Send,
  Cloud,
  Webhook,
  Calendar,
  Users,
  Table,
  type LucideIcon,
} from "lucide-react";

// Map of icon names to components for serialization across server/client boundary
const iconMap: Record<string, LucideIcon> = {
  CreditCard,
  FileText,
  Mail,
  FolderOpen,
  MessageSquare,
  Zap,
  ShoppingCart,
  Database,
  Globe,
  Send,
  Cloud,
  Webhook,
  Calendar,
  Users,
  Table,
};

export interface WorkflowStep {
  icon: string; // Icon name from iconMap
  label: string;
  description: string;
  iconBg?: string;
  iconColor?: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title: string;
  subtitle?: string;
}

export function WorkflowDiagram({
  steps,
  title,
  subtitle,
}: WorkflowDiagramProps) {
  return (
    <div className="bg-background border rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2">
        {steps.map((step, index) => {
          const IconComponent = iconMap[step.icon] || FileText;
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-4 md:gap-2 flex-1"
            >
              {/* Step */}
              <div className="flex items-center gap-3 md:flex-col md:gap-2 md:text-center flex-1 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    step.iconBg || "bg-slate-100"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${step.iconColor || "text-slate-600"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground truncate md:whitespace-normal">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow (not after last step) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
