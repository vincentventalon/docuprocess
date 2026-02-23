"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CreditsUsageChartProps {
  creditsUsed: number;
  creditsLimit: number;
}

export function CreditsUsageChart({
  creditsUsed,
  creditsLimit,
}: CreditsUsageChartProps) {
  const percentage = (creditsUsed / creditsLimit) * 100;
  const remaining = creditsLimit - creditsUsed;

  // Determine color based on usage
  const getStatusColor = () => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Calls</CardTitle>
        <CardDescription>Your monthly API usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credits Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Credits Used</p>
            <p className={cn("text-3xl font-bold", getStatusColor())}>
              {creditsUsed.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-3xl font-bold text-muted-foreground">
              {remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={percentage} className="h-3" />
            <div
              className={cn(
                "absolute inset-0 h-3 rounded-full transition-all",
                getProgressColor()
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{creditsLimit.toFixed(0)} credits</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="flex items-end justify-between gap-2 h-40">
            {/* Used Credits Bar */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className={cn(
                  "w-full rounded-t-lg transition-all",
                  getProgressColor()
                )}
                style={{ height: `${percentage}%` }}
              />
              <p className="text-xs font-medium mt-2">Used</p>
              <p className="text-xs text-muted-foreground">
                {creditsUsed.toFixed(0)}
              </p>
            </div>

            {/* Remaining Credits Bar */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-muted rounded-t-lg transition-all"
                style={{ height: `${100 - percentage}%` }}
              />
              <p className="text-xs font-medium mt-2">Remaining</p>
              <p className="text-xs text-muted-foreground">
                {remaining.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {percentage >= 90 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Warning:</span> You&apos;ve used{" "}
              {percentage.toFixed(0)}% of your credits. Consider upgrading your
              plan.
            </p>
          </div>
        )}
        {percentage >= 70 && percentage < 90 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              You&apos;ve used {percentage.toFixed(0)}% of your credits.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
