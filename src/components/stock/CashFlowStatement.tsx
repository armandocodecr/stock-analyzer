"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";

interface CashFlowStatementProps {
  data: StockData;
}

export default function CashFlowStatement({ data }: CashFlowStatementProps) {
  const metrics = data.metrics;

  const netChangeInCash =
    metrics.operatingCashFlow !== undefined &&
    metrics.investingCashFlow !== undefined &&
    metrics.financingCashFlow !== undefined
      ? metrics.operatingCashFlow +
        metrics.investingCashFlow +
        metrics.financingCashFlow
      : undefined;

  const DataRow = ({
    label,
    value,
    isSubItem = false,
    isBold = false,
    isTotal = false,
  }: {
    label: string;
    value: number | undefined | null;
    isSubItem?: boolean;
    isBold?: boolean;
    isTotal?: boolean;
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
            color: isTotal || isBold
              ? isNeg
                ? "var(--negative-text)"
                : "var(--ink-primary)"
              : isNeg
              ? "var(--negative-text)"
              : "var(--ink-secondary)",
            fontWeight: isTotal || isBold ? 600 : 400,
          }}
        >
          {formatLargeNumber(value)}
        </td>
      </tr>
    );
  };

  const SectionDivider = ({ label }: { label: string }) => (
    <tr>
      <td
        colSpan={2}
        className="px-4 pt-5 pb-1.5 text-xs font-semibold uppercase tracking-widest"
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
          Cash Flow Statement
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
            </tr>
          </thead>
          <tbody>
            <SectionDivider label="Operating Activities" />
            <DataRow label="Net Income" value={metrics.netIncome} isSubItem />
            <DataRow label="Depreciation & Amortization" value={metrics.depreciationAmortization} isSubItem />
            <DataRow label="Cash Flow from Operations" value={metrics.operatingCashFlow} isBold />

            <SectionDivider label="Investing Activities" />
            <DataRow
              label="Capital Expenditures (CapEx)"
              value={metrics.capex ? -Math.abs(metrics.capex) : undefined}
              isSubItem
            />
            <DataRow label="Cash Flow from Investing" value={metrics.investingCashFlow} isBold />

            <SectionDivider label="Financing Activities" />
            <DataRow
              label="Dividends Paid"
              value={metrics.dividendsPaid ? -Math.abs(metrics.dividendsPaid) : undefined}
              isSubItem
            />
            <DataRow
              label="Stock Repurchases"
              value={metrics.stockRepurchases ? -Math.abs(metrics.stockRepurchases) : undefined}
              isSubItem
            />
            <DataRow label="Cash Flow from Financing" value={metrics.financingCashFlow} isBold />

            {netChangeInCash !== undefined && (
              <>
                <tr><td colSpan={2} className="py-1" /></tr>
                <DataRow label="Net Change in Cash" value={netChangeInCash} isTotal />
              </>
            )}

            {metrics.freeCashFlow !== undefined && (
              <>
                <SectionDivider label="Free Cash Flow" />
                <DataRow
                  label="Free Cash Flow (OCF − CapEx)"
                  value={metrics.freeCashFlow}
                  isTotal
                />
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
