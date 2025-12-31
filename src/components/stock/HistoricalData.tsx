"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HistoricalDataProps {
  data: StockData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-gray-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatLargeNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const deduplicateByFiscalYear = <T extends { fiscalYear: number; endDate: string }>(
  data: T[]
): T[] => {
  const map = new Map<number, T>();
  
  data.forEach((item) => {
    const existing = map.get(item.fiscalYear);
    if (!existing || new Date(item.endDate) > new Date(existing.endDate)) {
      map.set(item.fiscalYear, item);
    }
  });
  
  return Array.from(map.values()).sort((a, b) => a.fiscalYear - b.fiscalYear);
};

export default function HistoricalData({ data }: HistoricalDataProps) {
  const historical = data.historicalAnnual;

  if (!historical) {
    return null;
  }

  const uniqueRevenue = historical.revenue ? deduplicateByFiscalYear(historical.revenue) : [];
  const uniqueNetIncome = historical.netIncome ? deduplicateByFiscalYear(historical.netIncome) : [];
  const uniqueTotalAssets = historical.totalAssets ? deduplicateByFiscalYear(historical.totalAssets) : [];
  const uniqueOperatingCashFlow = historical.operatingCashFlow ? deduplicateByFiscalYear(historical.operatingCashFlow) : [];
  const uniqueFreeCashFlow = historical.freeCashFlow ? deduplicateByFiscalYear(historical.freeCashFlow) : [];

  // Reversed arrays for tables (newest to oldest)
  const reversedRevenue = [...uniqueRevenue].reverse();
  const reversedNetIncome = [...uniqueNetIncome].reverse();
  const reversedTotalAssets = [...uniqueTotalAssets].reverse();
  const reversedOperatingCashFlow = [...uniqueOperatingCashFlow].reverse();
  const reversedFreeCashFlow = [...uniqueFreeCashFlow].reverse();

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        Historical Annual Data (10-K Filings)
      </h2>

      <p className="text-sm text-gray-300 mb-6">
        Official data from annual 10-K filings. All values are as reported by the company to the SEC.
      </p>

      <div className="space-y-8">
        {/* Revenue History */}
        {uniqueRevenue.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Revenue (Annual)
            </h3>
            
            {/* Revenue Chart */}
            <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={uniqueRevenue.map((item) => ({
                      year: `FY ${item.fiscalYear}`,
                      value: item.value,
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatLargeNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                      Fiscal Year
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reversedRevenue.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        FY {item.fiscalYear}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                        {formatLargeNumber(item.value)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 text-right">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Net Income History */}
        {uniqueNetIncome.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Net Income (Annual)
            </h3>

            {/* Net Income Chart */}
            <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={uniqueNetIncome.map((item) => ({
                      year: `FY ${item.fiscalYear}`,
                      value: item.value,
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatLargeNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Net Income"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Net Income Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                      Fiscal Year
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Net Income
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reversedNetIncome.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        FY {item.fiscalYear}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatLargeNumber(item.value)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 text-right">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Assets History */}
        {uniqueTotalAssets.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Total Assets (Annual)
            </h3>

            {/* Total Assets Chart */}
            <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={uniqueTotalAssets.map((item) => ({
                      year: `FY ${item.fiscalYear}`,
                      value: item.value,
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatLargeNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Total Assets"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Total Assets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                      Fiscal Year
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Total Assets
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reversedTotalAssets.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        FY {item.fiscalYear}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-white text-right">
                        {formatLargeNumber(item.value)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 text-right">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Operating Cash Flow History */}
        {uniqueOperatingCashFlow.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Operating Cash Flow (Annual)
            </h3>

            {/* Operating Cash Flow Chart */}
            <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={uniqueOperatingCashFlow.map((item) => ({
                      year: `FY ${item.fiscalYear}`,
                      value: item.value,
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatLargeNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Operating Cash Flow"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Operating Cash Flow Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                      Fiscal Year
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Operating Cash Flow
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reversedOperatingCashFlow.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        FY {item.fiscalYear}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatLargeNumber(item.value)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 text-right">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Free Cash Flow History */}
        {uniqueFreeCashFlow.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Free Cash Flow (Annual)
            </h3>

            {/* Free Cash Flow Chart */}
            <div className="mb-6 bg-gray-900/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={uniqueFreeCashFlow.map((item) => ({
                      year: `FY ${item.fiscalYear}`,
                      value: item.value,
                    }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatLargeNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Free Cash Flow"
                    stroke="#EC4899"
                    strokeWidth={2}
                    dot={{ fill: '#EC4899', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Free Cash Flow Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-200">
                      Fiscal Year
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Free Cash Flow
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-200">
                      Period End
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reversedFreeCashFlow.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-white">
                        FY {item.fiscalYear}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatLargeNumber(item.value)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 text-right">
                        {new Date(item.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-indigo-900/30 border border-indigo-700/50 rounded-lg">
        <p className="text-sm text-indigo-300">
          <strong>📊 About this data:</strong> All values come directly from annual 10-K filings submitted to the SEC. 
          This data represents official company reports and has not been adjusted or calculated by this application.
        </p>
      </div>
    </div>
  );
}
