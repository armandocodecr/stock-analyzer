"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface QuarterlyTrendsProps {
  data: StockData;
}

export default function QuarterlyTrends({ data }: QuarterlyTrendsProps) {
  if (!data.quarterly) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-2">
          Quarterly Trends
        </h2>
        <p className="text-sm text-gray-400">
          No quarterly data available for this company
        </p>
      </div>
    );
  }

  const { quarterly } = data;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-400" />
        Quarterly Trends (10-Q Filings)
      </h2>

      {/* Latest Quarter Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-700/50 rounded-lg">
        <p className="text-sm text-blue-400 font-semibold mb-1">
          Latest Quarter
        </p>
        <p className="text-2xl font-bold text-blue-300 mb-1">
          {quarterly.latestQuarter}
        </p>
        <p className="text-xs text-blue-400">
          Filed:{" "}
          {new Date(quarterly.latestQuarterFiledDate).toLocaleDateString()}
        </p>
        <p className="text-xs text-blue-400">
          Period Ended:{" "}
          {new Date(quarterly.latestQuarterEndDate).toLocaleDateString()}
        </p>
      </div>

      {/* QoQ Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-700 rounded-lg hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-300 mb-2">Revenue Growth (QoQ)</p>
          <div className="flex items-center gap-2">
            {quarterly.revenueQoQ !== undefined && quarterly.revenueQoQ > 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
            <p
              className={`text-3xl font-bold ${
                quarterly.revenueQoQ !== undefined && quarterly.revenueQoQ > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatPercentage(quarterly.revenueQoQ)}
            </p>
          </div>
        </div>

        <div className="p-4 border border-gray-700 rounded-lg hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-300 mb-2">Net Income Growth (QoQ)</p>
          <div className="flex items-center gap-2">
            {quarterly.netIncomeQoQ !== undefined &&
            quarterly.netIncomeQoQ > 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
            <p
              className={`text-3xl font-bold ${
                quarterly.netIncomeQoQ !== undefined &&
                quarterly.netIncomeQoQ > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatPercentage(quarterly.netIncomeQoQ)}
            </p>
          </div>
        </div>
      </div>

      {/* Quarterly Revenue Table */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-200 mb-3">
          Revenue by Quarter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                  Quarter
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {quarterly.quarterlyRevenue.map((q, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-900 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-200">
                    {q.quarter}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                    {formatLargeNumber(q.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quarterly Net Income Table */}
      <div>
        <h3 className="text-md font-semibold text-gray-200 mb-3">
          Net Income by Quarter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-600">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                  Quarter
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                  Net Income
                </th>
              </tr>
            </thead>
            <tbody>
              {quarterly.quarterlyNetIncome.map((q, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-900 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-200">
                    {q.quarter}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-semibold text-right ${
                      q.value >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatLargeNumber(q.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
