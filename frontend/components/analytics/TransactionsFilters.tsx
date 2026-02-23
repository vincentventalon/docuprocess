"use client";

import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export interface FiltersState {
  dateRange: DateRange | undefined;
}

interface TransactionsFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  onApplyFilter: () => void;
}

export function TransactionsFilters({
  filters,
  onFiltersChange,
  onApplyFilter,
}: TransactionsFiltersProps) {
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Select date range";
    if (!range.to) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(range.from);
    }
    return `${new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(range.from)} - ${new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(range.to)}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[260px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(filters.dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={filters.dateRange}
            onSelect={(range) =>
              onFiltersChange({ ...filters, dateRange: range })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        onClick={onApplyFilter}
        disabled={!filters.dateRange?.from}
      >
        Filter
      </Button>
    </div>
  );
}
