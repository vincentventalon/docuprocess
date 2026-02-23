"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { FiltersState } from "./TransactionsFilters";

interface Transaction {
  transaction_ref: string;
  transaction_type: string;
  template_id: string | null;
  api_key_id: string | null;
  exec_tm: number | null;
  credits: number;
  created_at: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  templates: Record<string, string>;
  apiKeys: Record<string, string>;
  filters: FiltersState;
  filterApplied: boolean;
}

type SortDirection = "asc" | "desc";

export function TransactionsTable({
  transactions,
  templates,
  apiKeys,
  filters,
  filterApplied,
}: TransactionsTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by date range
    if (filters.dateRange?.from) {
      result = result.filter((t) => {
        const txDate = new Date(t.created_at);
        if (filters.dateRange?.from && txDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange?.to) {
          const endOfDay = new Date(filters.dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (txDate > endOfDay) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [transactions, filters, sortDirection]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">STATUS</TableHead>
            <TableHead>TEMPLATE</TableHead>
            <TableHead>API KEY</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead className="text-right">CREDITS</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2"
                onClick={toggleSort}
              >
                DATE
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!filterApplied ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-gray-500"
              >
                Select a date range and click Filter to view transactions
              </TableCell>
            </TableRow>
          ) : filteredTransactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-gray-500"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            filteredTransactions.map((transaction) => (
              <TableRow key={transaction.transaction_ref}>
                <TableCell>
                  {transaction.transaction_type === "REFUND" ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.template_id
                    ? templates[transaction.template_id] ||
                      transaction.template_id
                    : "-"}
                </TableCell>
                <TableCell className="text-gray-600">
                  {transaction.api_key_id
                    ? apiKeys[transaction.api_key_id] || "Unknown"
                    : "-"}
                </TableCell>
                <TableCell>{getTypeName(transaction.transaction_type)}</TableCell>
                <TableCell className="text-right">
                  {transaction.credits}
                </TableCell>
                <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function getTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    PDFGEN: "PDF Generation",
    REFUND: "Refund",
    PURCHASE: "Purchase",
    BONUS: "Bonus",
  };
  return typeNames[type] || type;
}
