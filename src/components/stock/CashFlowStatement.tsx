"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface CashFlowStatementProps {
  data: StockData;
}

export default function CashFlowStatement({ data }: CashFlowStatementProps) {
  const metrics = data.metrics;

  const DataRow = ({
    label,
    value,
    isSubItem = false,
    isBold = false,
    isTotal = false,
    showIcon = false,
  }: {
    label: string;
    value: number | undefined | null;
    isSubItem?: boolean;
    isBold?: boolean;
    isTotal?: boolean;
    showIcon?: boolean;
  }) => {
    const isPositive = value !== undefined && value !== null && value >= 0;

    return (
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
          className={`py-3 px-4 text-sm text-right flex items-center justify-end gap-2 ${
            isBold || isTotal
              ? "font-bold text-white"
              : "font-semibold text-gray-200"
          }`}
        >
          {showIcon &&
            (isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ))}
          <span className={showIcon && !isPositive ? "text-red-400" : ""}>
            {formatLargeNumber(value)}
          </span>
        </td>
      </tr>
    );
  };

  // Calculate net change in cash if all components are available
  const netChangeInCash =
    metrics.operatingCashFlow !== undefined &&
    metrics.investingCashFlow !== undefined &&
    metrics.financingCashFlow !== undefined
      ? metrics.operatingCashFlow +
        metrics.investingCashFlow +
        metrics.financingCashFlow
      : undefined;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-400" />
        Cash Flow Statement (from 10-K Filing)
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
            </tr>
          </thead>
          <tbody>
            {/* OPERATING ACTIVITIES */}
            <tr className="bg-green-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-green-400 uppercase"
              >
                Operating Activities
              </td>
            </tr>

            <DataRow
              label="Net Income"
              value={metrics.netIncome}
              isSubItem
            />
            <DataRow
              label="Depreciation & Amortization"
              value={metrics.depreciationAmortization}
              isSubItem
            />
            <DataRow
              label="Cash Flow from Operations"
              value={metrics.operatingCashFlow}
              isBold
              showIcon
            />

            {/* INVESTING ACTIVITIES */}
            <tr className="bg-blue-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-blue-300 uppercase"
              >
                Investing Activities
              </td>
            </tr>

            <DataRow
              label="Capital Expenditures (CapEx)"
              value={metrics.capex ? -Math.abs(metrics.capex) : undefined}
              isSubItem
            />
            <DataRow
              label="Cash Flow from Investing"
              value={metrics.investingCashFlow}
              isBold
              showIcon
            />

            {/* FINANCING ACTIVITIES */}
            <tr className="bg-purple-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-purple-300 uppercase"
              >
                Financing Activities
              </td>
            </tr>

            <DataRow
              label="Dividends Paid"
              value={
                metrics.dividendsPaid ? -Math.abs(metrics.dividendsPaid) : undefined
              }
              isSubItem
            />
            <DataRow
              label="Stock Repurchases"
              value={
                metrics.stockRepurchases
                  ? -Math.abs(metrics.stockRepurchases)
                  : undefined
              }
              isSubItem
            />
            <DataRow
              label="Cash Flow from Financing"
              value={metrics.financingCashFlow}
              isBold
              showIcon
            />

            {/* NET CHANGE IN CASH */}
            {netChangeInCash !== undefined && (
              <>
                <tr className="h-2"></tr>
                <DataRow
                  label="NET CHANGE IN CASH"
                  value={netChangeInCash}
                  isTotal
                  showIcon
                />
              </>
            )}

            {/* FREE CASH FLOW */}
            {metrics.freeCashFlow !== undefined && (
              <>
                <tr className="h-2"></tr>
                <tr className="bg-yellow-900/30">
                  <td
                    colSpan={2}
                    className="py-2 px-4 text-sm font-bold text-yellow-300 uppercase"
                  >
                    Free Cash Flow
                  </td>
                </tr>
                <DataRow
                  label="Free Cash Flow (OCF - CapEx)"
                  value={metrics.freeCashFlow}
                  isTotal
                  showIcon
                />
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Cash Flow Info */}
      <div className="mt-6 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
        <p className="text-sm text-green-300 font-semibold mb-2">
          💡 Cash Flow Insights:
        </p>
        <ul className="text-xs text-green-400 space-y-1">
          <li>
            <strong>Operating Cash Flow:</strong> Cash generated from core
            business operations
          </li>
          <li>
            <strong>Investing Cash Flow:</strong> Cash used for investments
            (usually negative)
          </li>
          <li>
            <strong>Financing Cash Flow:</strong> Cash from/to investors and
            creditors
          </li>
          <li>
            <strong>Free Cash Flow:</strong> Cash available after capital
            expenditures
          </li>
        </ul>
      </div>
    </div>
  );
}
