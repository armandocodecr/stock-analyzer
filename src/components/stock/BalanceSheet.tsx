"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";

interface BalanceSheetProps {
  data: StockData;
}

export default function BalanceSheet({ data }: BalanceSheetProps) {
  const metrics = data.metrics;

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
  }) => (
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
          color: isTotal || isBold ? "var(--ink-primary)" : "var(--ink-secondary)",
          fontWeight: isTotal || isBold ? 600 : 400,
        }}
      >
        {formatLargeNumber(value)}
      </td>
    </tr>
  );

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
          Balance Sheet
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
            <SectionDivider label="Assets" />
            <DataRow label="Current Assets" value={metrics.currentAssets} isBold />
            <DataRow label="Cash & Equivalents" value={metrics.cash} isSubItem />
            <DataRow label="Accounts Receivable" value={metrics.accountsReceivable} isSubItem />
            <DataRow label="Inventory" value={metrics.inventory} isSubItem />
            <DataRow label="Property, Plant & Equipment" value={metrics.propertyPlantEquipment} isBold />
            <DataRow label="Total Assets" value={metrics.totalAssets} isTotal />

            <SectionDivider label="Liabilities" />
            <DataRow label="Current Liabilities" value={metrics.currentLiabilities} isBold />
            <DataRow label="Short-term Debt" value={metrics.shortTermDebt} isSubItem />
            <DataRow label="Accounts Payable" value={metrics.accountsPayable} isSubItem />
            <DataRow label="Long-term Debt" value={metrics.longTermDebt} isBold />
            <DataRow label="Total Liabilities" value={metrics.totalLiabilities} isTotal />

            <SectionDivider label="Equity" />
            <DataRow
              label="Total Shareholders' Equity"
              value={metrics.stockholdersEquity}
              isTotal
            />
          </tbody>
        </table>
      </div>

      {/* Balance equation */}
      {metrics.totalAssets && metrics.totalLiabilities && metrics.stockholdersEquity && (
        <div
          className="px-4 py-2.5"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-xs font-mono"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Assets = Liabilities + Equity &nbsp;·&nbsp;{" "}
            {formatLargeNumber(metrics.totalAssets)} ={" "}
            {formatLargeNumber(metrics.totalLiabilities)} +{" "}
            {formatLargeNumber(metrics.stockholdersEquity)}
          </p>
        </div>
      )}
    </div>
  );
}
