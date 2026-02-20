"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";

interface IncomeStatementProps {
  data: StockData;
}

export default function IncomeStatement({ data }: IncomeStatementProps) {
  const metrics = data.metrics;

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
  }) => {
    const isNeg = value !== undefined && value !== null && value < 0;
    return (
      <tr
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: isTotal ? "var(--surface-inset)" : "transparent",
        }}
      >
        <td
          className={`py-2.5 px-4 text-xs ${isSubItem ? "pl-8" : ""}`}
          style={{
            color: isTotal || isBold
              ? "var(--ink-primary)"
              : isSubItem
              ? "var(--ink-tertiary)"
              : "var(--ink-secondary)",
            fontWeight: isTotal || isBold ? 600 : 400,
          }}
        >
          {label}
        </td>
        <td
          className="py-2.5 px-4 text-xs text-right font-mono tabular-nums"
          style={{
            color: isNeg
              ? "var(--negative-text)"
              : isTotal || isBold
              ? "var(--ink-primary)"
              : "var(--ink-secondary)",
            fontWeight: isTotal || isBold ? 600 : 400,
          }}
        >
          {formatLargeNumber(value)}
        </td>
        {showMargin && (
          <td
            className="py-2.5 px-4 text-xs text-right font-mono tabular-nums"
            style={{ color: "var(--ink-tertiary)", minWidth: "72px" }}
          >
            {marginValue !== undefined && marginValue !== null
              ? formatPercentage(marginValue)
              : ""}
          </td>
        )}
      </tr>
    );
  };

  const SectionDivider = ({ label }: { label: string }) => (
    <tr>
      <td
        colSpan={3}
        className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest"
        style={{
          color: "var(--ink-tertiary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {label}
      </td>
    </tr>
  );

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--ink-secondary)" }}
        >
          Income Statement
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          10-K Annual
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              <th
                className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--ink-tertiary)" }}
              >
                Line Item
              </th>
              <th
                className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--ink-tertiary)" }}
              >
                USD
              </th>
              <th
                className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--ink-tertiary)" }}
              >
                Margin
              </th>
            </tr>
          </thead>
          <tbody>
            <DataRow
              label="Revenue"
              value={metrics.revenue}
              isBold
              showMargin
              marginValue={100}
            />
            <DataRow
              label="Cost of Revenue (COGS)"
              value={metrics.costOfRevenue ? -Math.abs(metrics.costOfRevenue) : undefined}
              isSubItem
              showMargin
            />
            <DataRow
              label="Gross Profit"
              value={metrics.grossProfit}
              isBold
              showMargin
              marginValue={grossMargin}
            />

            <SectionDivider label="Operating Expenses" />
            <DataRow
              label="Research & Development"
              value={metrics.rdExpense ? -Math.abs(metrics.rdExpense) : undefined}
              isSubItem
              showMargin
            />
            <DataRow
              label="Selling, General & Administrative"
              value={metrics.sgaExpense ? -Math.abs(metrics.sgaExpense) : undefined}
              isSubItem
              showMargin
            />
            <DataRow
              label="Total Operating Expenses"
              value={metrics.operatingExpenses ? -Math.abs(metrics.operatingExpenses) : undefined}
              isBold
              showMargin
            />

            <DataRow
              label="Operating Income (EBIT)"
              value={metrics.operatingIncome}
              isBold
              showMargin
              marginValue={operatingMargin}
            />
            <DataRow
              label="Interest Expense"
              value={metrics.interestExpense ? -Math.abs(metrics.interestExpense) : undefined}
              isSubItem
              showMargin
            />
            <DataRow
              label="Income Before Tax"
              value={
                metrics.operatingIncome !== undefined &&
                metrics.interestExpense !== undefined
                  ? metrics.operatingIncome - Math.abs(metrics.interestExpense)
                  : undefined
              }
              isBold
              showMargin
            />
            <DataRow
              label="Income Tax Expense"
              value={metrics.incomeTaxExpense ? -Math.abs(metrics.incomeTaxExpense) : undefined}
              isSubItem
              showMargin
            />
            <DataRow
              label="Net Income"
              value={metrics.netIncome}
              isTotal
              showMargin
              marginValue={netMargin}
            />

            {metrics.ebitda !== undefined && metrics.ebitda !== null && (
              <>
                <SectionDivider label="Operating Metric" />
                <DataRow
                  label="EBITDA"
                  value={metrics.ebitda}
                  isBold
                  showMargin
                />
              </>
            )}

            {eps !== undefined && eps !== null && (
              <>
                <SectionDivider label="Per Share" />
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td
                    className="py-2.5 px-4 text-xs"
                    style={{ color: "var(--ink-secondary)" }}
                  >
                    Earnings Per Share (EPS)
                  </td>
                  <td
                    className="py-2.5 px-4 text-xs text-right font-mono tabular-nums font-semibold"
                    style={{ color: "var(--ink-primary)" }}
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
    </div>
  );
}
