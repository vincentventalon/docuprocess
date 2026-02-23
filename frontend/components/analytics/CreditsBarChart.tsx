"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface Transaction {
  transaction_ref: string;
  transaction_type: string;
  template_id: string | null;
  exec_tm: number | null;
  credits: number;
  created_at: string;
}

interface CreditsBarChartProps {
  transactions: Transaction[];
}

const chartConfig = {
  success: {
    label: "Success",
    color: "#22c55e", // green-500
  },
  failed: {
    label: "Failed",
    color: "#ef4444", // red-500
  },
} satisfies ChartConfig;

type Period = "24h" | "7d" | "15d" | "30d" | "90d";

const periods: { value: Period; label: string }[] = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "15d", label: "15D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export function CreditsBarChart({ transactions }: CreditsBarChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const chartData = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    // Calculate rolling window
    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "15d":
        startDate.setDate(startDate.getDate() - 15);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Filter transactions within the period
    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.created_at);
      return (
        txDate >= startDate &&
        txDate <= now &&
        (t.transaction_type === "PDFGEN" || t.transaction_type === "REFUND")
      );
    });

    // Determine aggregation level based on period
    const aggregateBy = period === "24h" ? "hour" : "day";

    // Group and aggregate - track both success and failed
    const groups = new Map<string, { success: number; failed: number; timestamp: number }>();

    filtered.forEach((t) => {
      const date = new Date(t.created_at);
      let key: string;
      let sortKey: number;

      if (aggregateBy === "hour") {
        // Aggregate by hour for 24H view
        const hourStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        sortKey = hourStart.getTime();
        key = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hour12: true,
        }).format(date);
      } else {
        // Aggregate by day
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        sortKey = dayStart.getTime();
        key = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date);
      }

      const existing = groups.get(key) || { success: 0, failed: 0, timestamp: sortKey };

      if (t.transaction_type === "PDFGEN") {
        existing.success += t.credits;
      } else if (t.transaction_type === "REFUND") {
        existing.failed += t.credits;
      }

      groups.set(key, existing);
    });

    // Convert to array and sort chronologically (oldest first)
    const result = Array.from(groups.entries())
      .map(([date, data]) => ({
        date,
        success: data.success,
        failed: data.failed,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return result;
  }, [transactions, period]);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Credits used</h3>
        <div className="flex items-center rounded-lg border bg-gray-50 p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={<ChartTooltipContent />}
          />
          <Bar
            dataKey="success"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            stackId="stack"
          />
          <Bar
            dataKey="failed"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
            stackId="stack"
          />
        </BarChart>
      </ChartContainer>

      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600">Success</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-600">Failed</span>
        </div>
      </div>
    </div>
  );
}
