"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";
import { Scale } from "lucide-react";

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
        }`}
      >
        {formatLargeNumber(value)}
      </td>
    </tr>
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Scale className="w-5 h-5 text-blue-400" />
        Balance Sheet (from 10-K Filing)
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
            {/* ASSETS SECTION */}
            <tr className="bg-green-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-green-400 uppercase"
              >
                Assets
              </td>
            </tr>

            {/* Current Assets */}
            <DataRow
              label="Current Assets"
              value={metrics.currentAssets}
              isBold
            />
            <DataRow
              label="Cash & Cash Equivalents"
              value={metrics.cash}
              isSubItem
            />
            <DataRow
              label="Accounts Receivable"
              value={metrics.accountsReceivable}
              isSubItem
            />
            <DataRow
              label="Inventory"
              value={metrics.inventory}
              isSubItem
            />

            {/* Non-Current Assets */}
            <DataRow
              label="Property, Plant & Equipment (PP&E)"
              value={metrics.propertyPlantEquipment}
              isBold
            />

            {/* Total Assets */}
            <DataRow
              label="TOTAL ASSETS"
              value={metrics.totalAssets}
              isTotal
            />

            {/* LIABILITIES SECTION */}
            <tr className="bg-red-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-red-400 uppercase"
              >
                Liabilities
              </td>
            </tr>

            {/* Current Liabilities */}
            <DataRow
              label="Current Liabilities"
              value={metrics.currentLiabilities}
              isBold
            />
            <DataRow
              label="Short-term Debt"
              value={metrics.shortTermDebt}
              isSubItem
            />
            <DataRow
              label="Accounts Payable"
              value={metrics.accountsPayable}
              isSubItem
            />

            {/* Long-term Liabilities */}
            <DataRow
              label="Long-term Debt"
              value={metrics.longTermDebt}
              isBold
            />

            {/* Total Liabilities */}
            <DataRow
              label="TOTAL LIABILITIES"
              value={metrics.totalLiabilities}
              isTotal
            />

            {/* EQUITY SECTION */}
            <tr className="bg-indigo-900/30">
              <td
                colSpan={2}
                className="py-2 px-4 text-sm font-bold text-indigo-300 uppercase"
              >
                Shareholders' Equity
              </td>
            </tr>

            <DataRow
              label="TOTAL SHAREHOLDERS' EQUITY"
              value={metrics.stockholdersEquity}
              isTotal
            />
          </tbody>
        </table>
      </div>

      {/* Balance Sheet Equation Verification */}
      {metrics.totalAssets &&
        metrics.totalLiabilities &&
        metrics.stockholdersEquity && (
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300 font-semibold mb-2">
              📐 Balance Sheet Equation:
            </p>
            <p className="text-sm text-blue-300">
              <strong>Assets</strong> = <strong>Liabilities</strong> +{" "}
              <strong>Equity</strong>
            </p>
            <p className="text-xs text-blue-300 mt-1">
              {formatLargeNumber(metrics.totalAssets)} ={" "}
              {formatLargeNumber(metrics.totalLiabilities)} +{" "}
              {formatLargeNumber(metrics.stockholdersEquity)}
            </p>
          </div>
        )}
    </div>
  );
}
