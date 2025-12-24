"use client";

import { useState } from "react";
import { StockData } from "@/types/stock";
import {
  formatPercentage,
  formatRatio,
  formatLargeNumber,
} from "@/lib/utils/formatters";

interface MetricsTabsProps {
  data: StockData;
}

type TabId = "profitability" | "debt" | "liquidity" | "efficiency" | "growth" | "cashflow" | "capital";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "profitability", label: "Profitability", icon: "💰" },
  { id: "liquidity", label: "Liquidity", icon: "💧" },
  { id: "efficiency", label: "Efficiency", icon: "⚡" },
  { id: "debt", label: "Debt", icon: "📊" },
  { id: "growth", label: "Growth", icon: "📈" },
  { id: "cashflow", label: "Cash Flow", icon: "💵" },
  { id: "capital", label: "Capital", icon: "🔄" },
];

export default function MetricsTabs({ data }: MetricsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profitability");
  const metrics = data.metrics;

  const MetricRow = ({
    label,
    value,
    isPercentage = false,
    isLarge = false,
    tooltip,
  }: {
    label: string;
    value: number | undefined | null;
    isPercentage?: boolean;
    isLarge?: boolean;
    tooltip?: string;
  }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-700">
      <td className="py-3 px-4 text-sm text-gray-200" title={tooltip}>
        {label}
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
        {isPercentage
          ? formatPercentage(value)
          : isLarge
          ? formatLargeNumber(value)
          : formatRatio(value)}
      </td>
    </tr>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profitability":
        return (
          <div>
            <h3 className="text-md font-semibold text-green-400 mb-3">
              Profitability Metrics
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Gross Margin"
                  value={metrics.grossMargin}
                  isPercentage={true}
                  tooltip="(Revenue - COGS) / Revenue"
                />
                <MetricRow
                  label="Operating Margin"
                  value={metrics.operatingMargin}
                  isPercentage={true}
                  tooltip="Operating Income / Revenue"
                />
                <MetricRow
                  label="Net Margin"
                  value={metrics.netMargin}
                  isPercentage={true}
                  tooltip="Net Income / Revenue"
                />
                <MetricRow
                  label="ROE (Return on Equity)"
                  value={metrics.roe}
                  isPercentage={true}
                  tooltip="Net Income / Shareholders Equity"
                />
                <MetricRow
                  label="ROA (Return on Assets)"
                  value={metrics.roa}
                  isPercentage={true}
                  tooltip="Net Income / Total Assets"
                />
                <MetricRow
                  label="ROIC (Return on Invested Capital)"
                  value={metrics.roic}
                  isPercentage={true}
                  tooltip="NOPAT / Invested Capital"
                />
              </tbody>
            </table>
          </div>
        );

      case "debt":
        return (
          <div>
            <h3 className="text-md font-semibold text-red-400 mb-3">
              Debt & Financial Health
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Debt / Equity"
                  value={metrics.debtToEquity}
                  tooltip="Total Debt / Shareholders Equity"
                />
                <MetricRow
                  label="Debt / Assets"
                  value={metrics.debtToAssets}
                  isPercentage={true}
                  tooltip="Total Debt / Total Assets"
                />
                <MetricRow
                  label="Interest Coverage"
                  value={metrics.interestCoverage}
                  tooltip="EBIT / Interest Expense"
                />
                <MetricRow
                  label="Total Debt"
                  value={metrics.totalDebt}
                  isLarge={true}
                  tooltip="Long-term + Short-term Debt"
                />
                <MetricRow
                  label="Net Debt"
                  value={metrics.netDebt}
                  isLarge={true}
                  tooltip="Total Debt - Cash"
                />
              </tbody>
            </table>
          </div>
        );

      case "liquidity":
        return (
          <div>
            <h3 className="text-md font-semibold text-blue-400 mb-3">
              Liquidity Ratios
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Current Ratio"
                  value={metrics.currentRatio}
                  tooltip="Current Assets / Current Liabilities"
                />
                <MetricRow
                  label="Quick Ratio"
                  value={metrics.quickRatio}
                  tooltip="(Current Assets - Inventory) / Current Liabilities"
                />
                <MetricRow
                  label="Cash Ratio"
                  value={metrics.cashRatio}
                  tooltip="Cash / Current Liabilities"
                />
                <MetricRow
                  label="Working Capital"
                  value={metrics.workingCapital}
                  isLarge={true}
                  tooltip="Current Assets - Current Liabilities"
                />
              </tbody>
            </table>
          </div>
        );

      case "efficiency":
        return (
          <div>
            <h3 className="text-md font-semibold text-orange-400 mb-3">
              Efficiency Ratios
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Asset Turnover"
                  value={metrics.assetTurnover}
                  tooltip="Revenue / Total Assets"
                />
                <MetricRow
                  label="Inventory Turnover"
                  value={metrics.inventoryTurnover}
                  tooltip="COGS / Inventory"
                />
                <MetricRow
                  label="Receivables Turnover"
                  value={metrics.receivablesTurnover}
                  tooltip="Revenue / Accounts Receivable"
                />
              </tbody>
            </table>
          </div>
        );

      case "growth":
        return (
          <div>
            <h3 className="text-md font-semibold text-green-400 mb-3">
              Growth Metrics (CAGR)
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Revenue Growth (3Y)"
                  value={metrics.revenueGrowth3Y}
                  isPercentage={true}
                  tooltip="3-year Compound Annual Growth Rate"
                />
                <MetricRow
                  label="Revenue Growth (5Y)"
                  value={metrics.revenueGrowth5Y}
                  isPercentage={true}
                  tooltip="5-year Compound Annual Growth Rate"
                />
                <MetricRow
                  label="Net Income Growth (3Y)"
                  value={metrics.netIncomeGrowth3Y}
                  isPercentage={true}
                  tooltip="3-year Net Income CAGR"
                />
                <MetricRow
                  label="Net Income Growth (5Y)"
                  value={metrics.netIncomeGrowth5Y}
                  isPercentage={true}
                  tooltip="5-year Net Income CAGR"
                />
              </tbody>
            </table>
          </div>
        );

      case "cashflow":
        return (
          <div>
            <h3 className="text-md font-semibold text-purple-400 mb-3">
              Cash Flow Metrics
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Free Cash Flow"
                  value={metrics.freeCashFlow}
                  isLarge={true}
                  tooltip="Operating CF - CapEx"
                />
                <MetricRow
                  label="FCF per Share"
                  value={metrics.freeCashFlowPerShare}
                  tooltip="Free Cash Flow / Shares Outstanding"
                />
                <MetricRow
                  label="Operating Cash Flow"
                  value={metrics.operatingCashFlow}
                  isLarge={true}
                  tooltip="Cash from operations"
                />
                <MetricRow
                  label="Capital Expenditure (CapEx)"
                  value={metrics.capex}
                  isLarge={true}
                  tooltip="Investment in fixed assets"
                />
              </tbody>
            </table>
          </div>
        );

      case "capital":
        return (
          <div>
            <h3 className="text-md font-semibold text-indigo-400 mb-3">
              Capital Management
            </h3>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Shares Outstanding"
                  value={metrics.sharesOutstanding}
                  isLarge={true}
                  tooltip="Total shares outstanding"
                />
                <MetricRow
                  label="Book Value per Share"
                  value={metrics.bookValuePerShare}
                  tooltip="Shareholders Equity / Shares"
                />
                <MetricRow
                  label="EPS (Earnings per Share)"
                  value={metrics.eps}
                  tooltip="Net Income / Shares Outstanding"
                />
              </tbody>
            </table>

            {/* Raw Financials */}
            <h4 className="text-sm font-semibold text-gray-300 mt-6 mb-3">
              Key Raw Financials (from 10-K)
            </h4>
            <table className="w-full">
              <tbody>
                <MetricRow
                  label="Revenue"
                  value={metrics.revenue}
                  isLarge={true}
                  tooltip="Total revenue"
                />
                <MetricRow
                  label="Net Income"
                  value={metrics.netIncome}
                  isLarge={true}
                  tooltip="Bottom line profit"
                />
                <MetricRow
                  label="EBITDA"
                  value={metrics.ebitda}
                  isLarge={true}
                  tooltip="Earnings Before Interest, Taxes, Depreciation & Amortization"
                />
                <MetricRow
                  label="Total Assets"
                  value={metrics.totalAssets}
                  isLarge={true}
                  tooltip="All company assets"
                />
                <MetricRow
                  label="Stockholders Equity"
                  value={metrics.stockholdersEquity}
                  isLarge={true}
                  tooltip="Net worth"
                />
                <MetricRow
                  label="Cash & Equivalents"
                  value={metrics.cash}
                  isLarge={true}
                  tooltip="Cash and cash equivalents"
                />
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Financial Metrics from SEC Filings
      </h2>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-700 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-400"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">{renderTabContent()}</div>
    </div>
  );
}
