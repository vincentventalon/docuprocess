"use client";

import { useState } from "react";
import { CreditsBarChart } from "./CreditsBarChart";
import {
  TransactionsFilters,
  type FiltersState,
} from "./TransactionsFilters";
import { TransactionsTable } from "./TransactionsTable";

interface Transaction {
  transaction_ref: string;
  transaction_type: string;
  template_id: string | null;
  api_key_id: string | null;
  exec_tm: number | null;
  credits: number;
  created_at: string;
}

interface AnalyticsClientProps {
  transactions: Transaction[];
  templates: Record<string, string>;
  apiKeys: Record<string, string>;
  userEmail: string;
}

const initialFilters: FiltersState = {
  dateRange: undefined,
};

export function AnalyticsClient({
  transactions,
  templates,
  apiKeys,
  userEmail,
}: AnalyticsClientProps) {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [filterApplied, setFilterApplied] = useState(false);

  const handleApplyFilter = () => {
    setFilterApplied(true);
  };

  return (
    <>
      <CreditsBarChart transactions={transactions} />

      <div className="space-y-4">
        <TransactionsFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setFilterApplied(false);
          }}
          onApplyFilter={handleApplyFilter}
        />

        <TransactionsTable
          transactions={transactions}
          templates={templates}
          apiKeys={apiKeys}
          filters={filters}
          filterApplied={filterApplied}
        />
      </div>
    </>
  );
}
