"use client";

import { StockData } from "@/types/stock";
import { formatPercentage, formatRatio } from "@/lib/utils/formatters";

interface FinancialRatiosProps {
  data: StockData;
}

export default function FinancialRatios({ data }: FinancialRatiosProps) {
  const latest = data.latestMetrics;

  if (!latest) return null;

  const ratios = {
    grossMargin:
      latest.ttmRevenue && latest.ttmGrossProfit
        ? (latest.ttmGrossProfit / latest.ttmRevenue) * 100
        : latest.ttmRevenue && latest.ttmCostOfRevenue
        ? ((latest.ttmRevenue - latest.ttmCostOfRevenue) / latest.ttmRevenue) *
          100
        : undefined,
    operatingMargin:
      latest.ttmRevenue && latest.ttmOperatingIncome
        ? (latest.ttmOperatingIncome / latest.ttmRevenue) * 100
        : undefined,
    netMargin:
      latest.ttmRevenue && latest.ttmNetIncome
        ? (latest.ttmNetIncome / latest.ttmRevenue) * 100
        : undefined,
    roe:
      latest.latestStockholdersEquity &&
      latest.ttmNetIncome &&
      latest.latestStockholdersEquity > 0
        ? (latest.ttmNetIncome / latest.latestStockholdersEquity) * 100
        : undefined,
    roa:
      latest.latestTotalAssets &&
      latest.ttmNetIncome &&
      latest.latestTotalAssets > 0
        ? (latest.ttmNetIncome / latest.latestTotalAssets) * 100
        : undefined,
    currentRatio:
      latest.latestCurrentLiabilities &&
      latest.latestCurrentAssets &&
      latest.latestCurrentLiabilities > 0
        ? latest.latestCurrentAssets / latest.latestCurrentLiabilities
        : undefined,
    quickRatio:
      latest.latestCurrentLiabilities &&
      latest.latestCurrentAssets &&
      latest.latestCurrentLiabilities > 0
        ? (latest.latestCurrentAssets - (latest.latestInventory || 0)) /
          latest.latestCurrentLiabilities
        : undefined,
    cashRatio:
      latest.latestCurrentLiabilities &&
      latest.latestCash &&
      latest.latestCurrentLiabilities > 0
        ? latest.latestCash / latest.latestCurrentLiabilities
        : undefined,
    debtToEquity:
      latest.latestStockholdersEquity &&
      latest.latestTotalDebt &&
      latest.latestStockholdersEquity > 0
        ? latest.latestTotalDebt / latest.latestStockholdersEquity
        : undefined,
    debtToAssets:
      latest.latestTotalAssets &&
      latest.latestTotalDebt &&
      latest.latestTotalAssets > 0
        ? (latest.latestTotalDebt / latest.latestTotalAssets) * 100
        : undefined,
    equityMultiplier:
      latest.latestStockholdersEquity &&
      latest.latestTotalAssets &&
      latest.latestStockholdersEquity > 0
        ? latest.latestTotalAssets / latest.latestStockholdersEquity
        : undefined,
    assetTurnover:
      latest.latestTotalAssets &&
      latest.ttmRevenue &&
      latest.latestTotalAssets > 0
        ? latest.ttmRevenue / latest.latestTotalAssets
        : undefined,
  };

  const RatioRow = ({
    label,
    value,
    isPercentage = false,
    tooltip,
  }: {
    label: string;
    value: number | undefined;
    isPercentage?: boolean;
    tooltip: string;
  }) => (
    <tr
      title={tooltip}
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <td
        className="py-2.5 px-4 text-xs"
        style={{ color: "var(--ink-secondary)" }}
      >
        {label}
      </td>
      <td
        className="py-2.5 px-4 text-xs text-right font-mono tabular-nums"
        style={{ color: "var(--ink-primary)" }}
      >
        {value !== undefined && value !== null
          ? isPercentage
            ? formatPercentage(value)
            : formatRatio(value)
          : <span style={{ color: "var(--ink-disabled)" }}>—</span>}
      </td>
    </tr>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <tr>
      <td
        colSpan={2}
        className="px-4 pt-5 pb-1.5 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--ink-tertiary)" }}
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
          Key Financial Ratios
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          10-K Annual
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left column */}
        <div style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <table className="w-full">
            <tbody>
              <SectionHeader label="Profitability" />
              <RatioRow
                label="Gross Margin"
                value={ratios.grossMargin}
                isPercentage
                tooltip="(Revenue − COGS) / Revenue"
              />
              <RatioRow
                label="Operating Margin"
                value={ratios.operatingMargin}
                isPercentage
                tooltip="Operating Income / Revenue"
              />
              <RatioRow
                label="Net Margin"
                value={ratios.netMargin}
                isPercentage
                tooltip="Net Income / Revenue"
              />
              <RatioRow
                label="ROE"
                value={ratios.roe}
                isPercentage
                tooltip="Net Income / Shareholders' Equity"
              />
              <RatioRow
                label="ROA"
                value={ratios.roa}
                isPercentage
                tooltip="Net Income / Total Assets"
              />

              <SectionHeader label="Efficiency" />
              <RatioRow
                label="Asset Turnover"
                value={ratios.assetTurnover}
                tooltip="Revenue / Total Assets"
              />
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div>
          <table className="w-full">
            <tbody>
              <SectionHeader label="Liquidity" />
              <RatioRow
                label="Current Ratio"
                value={ratios.currentRatio}
                tooltip="Current Assets / Current Liabilities"
              />
              <RatioRow
                label="Quick Ratio"
                value={ratios.quickRatio}
                tooltip="(Current Assets − Inventory) / Current Liabilities"
              />
              <RatioRow
                label="Cash Ratio"
                value={ratios.cashRatio}
                tooltip="Cash / Current Liabilities"
              />

              <SectionHeader label="Leverage" />
              <RatioRow
                label="Debt / Equity"
                value={ratios.debtToEquity}
                tooltip="Total Debt / Shareholders' Equity"
              />
              <RatioRow
                label="Debt / Assets"
                value={ratios.debtToAssets}
                isPercentage
                tooltip="Total Debt / Total Assets"
              />
              <RatioRow
                label="Equity Multiplier"
                value={ratios.equityMultiplier}
                tooltip="Total Assets / Shareholders' Equity"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
