"use client";

import { StockData } from "@/types/stock";
import { formatPercentage, formatRatio } from "@/lib/utils/formatters";
import { Calculator } from "lucide-react";

interface FinancialRatiosProps {
  data: StockData;
}

export default function FinancialRatios({ data }: FinancialRatiosProps) {
  const metrics = data.metrics;
  const latest = data.latestMetrics;

  // If no latest metrics available, return null
  if (!latest) {
    return null;
  }

  // Calculate key financial ratios from most recent annual report (10-K)
  // All ratios use data from the same fiscal year for consistency
  const ratios = {
    // Profitability Ratios (using annual 10-K data)
    grossMargin:
      latest.ttmRevenue && latest.ttmGrossProfit
        ? (latest.ttmGrossProfit / latest.ttmRevenue) * 100
        : latest.ttmRevenue && latest.ttmCostOfRevenue
        ? ((latest.ttmRevenue - latest.ttmCostOfRevenue) / latest.ttmRevenue) * 100
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

    // Liquidity Ratios (using annual 10-K Balance Sheet)
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

    // Leverage Ratios (using annual 10-K Balance Sheet)
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

    // Efficiency Ratios (using annual 10-K data)
    assetTurnover:
      latest.latestTotalAssets && latest.ttmRevenue && latest.latestTotalAssets > 0
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
    <tr className="border-b border-gray-700 hover:bg-gray-700">
      <td className="py-3 px-4 text-sm text-gray-200" title={tooltip}>
        {label}
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
        {value !== undefined && value !== null
          ? isPercentage
            ? formatPercentage(value)
            : formatRatio(value)
          : "N/A"}
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-green-400" />
        Key Financial Ratios
      </h2>
      
      {/* Info banner explaining data source */}
      <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Data Source:</strong> All ratios use data from the{" "}
          <strong>most recent annual report (10-K)</strong> which contains 12 months
          of complete financial data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profitability Ratios */}
        <div>
          <h3 className="text-md font-semibold text-green-400 mb-3">
            Profitability Ratios
          </h3>
          <table className="w-full">
            <tbody>
              <RatioRow
                label="Gross Margin"
                value={ratios.grossMargin}
                isPercentage={true}
                tooltip="(Revenue - COGS) / Revenue"
              />
              <RatioRow
                label="Operating Margin"
                value={ratios.operatingMargin}
                isPercentage={true}
                tooltip="Operating Income / Revenue"
              />
              <RatioRow
                label="Net Margin"
                value={ratios.netMargin}
                isPercentage={true}
                tooltip="Net Income / Revenue"
              />
              <RatioRow
                label="ROE (Return on Equity)"
                value={ratios.roe}
                isPercentage={true}
                tooltip="Net Income / Shareholders' Equity"
              />
              <RatioRow
                label="ROA (Return on Assets)"
                value={ratios.roa}
                isPercentage={true}
                tooltip="Net Income / Total Assets"
              />
            </tbody>
          </table>
        </div>

        {/* Liquidity Ratios */}
        <div>
          <h3 className="text-md font-semibold text-blue-400 mb-3">
            Liquidity Ratios
          </h3>
          <table className="w-full">
            <tbody>
              <RatioRow
                label="Current Ratio"
                value={ratios.currentRatio}
                tooltip="Current Assets / Current Liabilities"
              />
              <RatioRow
                label="Quick Ratio"
                value={ratios.quickRatio}
                tooltip="(Current Assets - Inventory) / Current Liabilities"
              />
              <RatioRow
                label="Cash Ratio"
                value={ratios.cashRatio}
                tooltip="Cash / Current Liabilities"
              />
            </tbody>
          </table>

          <h3 className="text-md font-semibold text-red-400 mb-3 mt-6">
            Leverage Ratios
          </h3>
          <table className="w-full">
            <tbody>
              <RatioRow
                label="Debt-to-Equity"
                value={ratios.debtToEquity}
                tooltip="Total Debt / Shareholders' Equity"
              />
              <RatioRow
                label="Debt-to-Assets"
                value={ratios.debtToAssets}
                isPercentage={true}
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

      {/* Additional Ratios */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-purple-400 mb-3">
          Efficiency Ratios
        </h3>
        <table className="w-full">
          <tbody>
            <RatioRow
              label="Asset Turnover"
              value={ratios.assetTurnover}
              tooltip="Revenue / Total Assets"
            />
          </tbody>
        </table>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
        <p className="text-sm text-green-300">
          <strong>📊 About these ratios:</strong> All ratios are calculated
          using official data from the most recent 10-K annual filing. These are
          standard financial ratios used in fundamental analysis.
        </p>
      </div>
    </div>
  );
}
