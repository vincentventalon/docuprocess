import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgePillProps {
  children: ReactNode;
  className?: string;
}

const BadgePill = ({ children, className }: BadgePillProps) => {
  return (
    <span className={cn(
      "inline-block bg-slate-100 dark:bg-slate-800 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-4",
      className
    )}>
      {children}
    </span>
  );
};

export default BadgePill;
