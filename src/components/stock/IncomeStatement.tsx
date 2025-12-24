"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";
import { FileText } from "lucide-react";

interface IncomeStatementProps {
  data: StockData;
}

export default function IncomeStatement({ data }: IncomeStatementProps) {
  const metrics = data.metrics;

  // Calculate margins client-side
  const grossMargin =
    metrics.revenue && metrics.grossProfit
      ? (metrics.grossProfit / metrics.revenue) * 100
      : undefined;

  const operatingMargin =
    metrics.revenue && metrics.operatingIncome
      ? (metrics.operatingIncome / metrics.revenue) * 100
      : undefined;

  const netMargin =
    metrics.revenue && metrics.netIncome
      ? (metrics.netIncome / metrics.revenue) * 100
      : undefined;

  const eps =
    metrics.netIncome && metrics.sharesOutstanding
      ? metrics.netIncome / metrics.sharesOutstanding
      : undefined;

  const DataRow = ({
    label,
    value,
    isSubItem = false,
    isBold = false,
    isTotal = false,
    showMargin = false,
    marginValue,
  }: {
    label: string;
    value: number | undefined | null;
    isSubItem?: boolean;
    isBold?: boolean;
    isTotal?: boolean;
    showMargin?: boolean;
    marginValue?: number | null;
  }) => (
    <tr
      className={`border-b border-gray-700 hover:bg-gray-900 ${
        isTotal ? "bg-blue-900/30 font-bold" : ""
      }`}
    >
      <td
        className={`py-3 px-4 text-sm ${
          isSubItem ? "pl-8 text-gray-300" : "text-gray-200"
        } ${isBold || isTotal ? "font-semibold" : ""}`}
      >
        {label}
      </td>
      <td
        className={`py-3 px-4 text-sm text-right ${
          isBold || isTotal
            ? "font-bold text-white"
            : "font-semibold text-gray-200"
        } ${value !== undefined && value !== null && value < 0 ? "text-red-400" : ""}`}
      >
        {formatLargeNumber(value)}
      </td>
      {showMargin && (
        <td className="py-3 px-4 text-sm text-right font-semibold text-blue-400">
          {marginValue !== undefined && marginValue !== null
            ? formatPercentage(marginValue)
            : "-"}
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        Income Statement (from 10-K Filing)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-600">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                Item
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                Amount (USD)
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                Margin %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Revenue */}
            <DataRow
              label="Revenue (Sales)"
              value={metrics.revenue}
              isBold
              showMargin
              marginValue={100}
            />

            {/* COGS */}
            <DataRow
              label="Cost of Revenue (COGS)"
              value={
                metrics.costOfRevenue
                  ? -Math.abs(metrics.costOfRevenue)
                  : undefined
              }
              isSubItem
              showMargin
            />

            {/* Gross Profit */}
            <DataRow
              label="Gross Profit"
              value={metrics.grossProfit}
              isBold
              showMargin
              marginValue={grossMargin}
            />

            {/* Operating Expenses */}
            <tr className="bg-gray-800/50">
              <td
                colSpan={3}
                className="py-2 px-4 text-sm font-semibold text-gray-300"
              >
                Operating Expenses:
              </td>
            </tr>
            <DataRow
              label="Research & Development (R&D)"
              value={
                metrics.rdExpense ? -Math.abs(metrics.rdExpense) : undefined
              }
              isSubItem
              showMargin
            />
            <DataRow
              label="Selling, General & Administrative (SG&A)"
              value={
                metrics.sgaExpense
                  ? -Math.abs(metrics.sgaExpense)
                  : undefined
              }
              isSubItem
              showMargin
            />
            <DataRow
              label="Total Operating Expenses"
              value={
                metrics.operatingExpenses
                  ? -Math.abs(metrics.operatingExpenses)
                  : undefined
              }
              isBold
              showMargin
            />

            {/* Operating Income (EBIT) */}
            <DataRow
              label="Operating Income (EBIT)"
              value={metrics.operatingIncome}
              isBold
              showMargin
              marginValue={operatingMargin}
            />

            {/* Non-Operating Items */}
            <DataRow
              label="Interest Expense"
              value={
                metrics.interestExpense
                  ? -Math.abs(metrics.interestExpense)
                  : undefined
              }
              isSubItem
              showMargin
            />

            {/* Income Before Tax */}
            <DataRow
              label="Income Before Tax (EBT)"
              value={
                metrics.operatingIncome !== undefined &&
                metrics.interestExpense !== undefined
                  ? metrics.operatingIncome - Math.abs(metrics.interestExpense)
                  : undefined
              }
              isBold
              showMargin
            />

            {/* Tax Expense */}
            <DataRow
              label="Income Tax Expense"
              value={
                metrics.incomeTaxExpense
                  ? -Math.abs(metrics.incomeTaxExpense)
                  : undefined
              }
              isSubItem
              showMargin
            />

            {/* Net Income */}
            <DataRow
              label="NET INCOME"
              value={metrics.netIncome}
              isTotal
              showMargin
              marginValue={netMargin}
            />

            {/* EBITDA (if available) */}
            {metrics.ebitda !== undefined && metrics.ebitda !== null && (
              <>
                <tr className="h-4"></tr>
                <tr className="bg-yellow-900/30">
                  <td
                    colSpan={3}
                    className="py-2 px-4 text-sm font-bold text-yellow-300 uppercase"
                  >
                    EBITDA (Operating Metric)
                  </td>
                </tr>
                <DataRow
                  label="EBITDA"
                  value={metrics.ebitda}
                  isBold
                  showMargin
                />
              </>
            )}

            {/* Per Share Metrics */}
            {eps !== undefined && eps !== null && (
              <>
                <tr className="h-4"></tr>
                <tr className="bg-indigo-900/30">
                  <td
                    colSpan={3}
                    className="py-2 px-4 text-sm font-bold text-indigo-300 uppercase"
                  >
                    Per Share Metrics
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-200 font-semibold">
                    Earnings Per Share (EPS)
                  </td>
                  <td
                    className="py-3 px-4 text-sm text-right font-bold text-white"
                    colSpan={2}
                  >
                    ${eps.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Income Statement Info */}
      <div className="mt-6 p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
        <p className="text-sm text-purple-300 font-semibold mb-2">
          📊 Key Profitability Margins:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-purple-300">
          {grossMargin !== undefined && (
            <div>
              <strong>Gross Margin:</strong> {formatPercentage(grossMargin)}
            </div>
          )}
          {operatingMargin !== undefined && (
            <div>
              <strong>Operating Margin:</strong>{" "}
              {formatPercentage(operatingMargin)}
            </div>
          )}
          {netMargin !== undefined && (
            <div>
              <strong>Net Margin:</strong> {formatPercentage(netMargin)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
