"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";
import { TrendingUp } from "lucide-react";

interface HistoricalDataProps {
  data: StockData;
}

export default function HistoricalData({ data }: HistoricalDataProps) {
  const historical = data.historicalAnnual;

  if (!historical) {
    return null;
  }

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
        {historical.revenue && historical.revenue.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Revenue (Annual)
            </h3>
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
                  {historical.revenue.map((item, idx) => (
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
        {historical.netIncome && historical.netIncome.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Net Income (Annual)
            </h3>
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
                  {historical.netIncome.map((item, idx) => (
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
        {historical.totalAssets && historical.totalAssets.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Total Assets (Annual)
            </h3>
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
                  {historical.totalAssets.map((item, idx) => (
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
        {historical.operatingCashFlow && historical.operatingCashFlow.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Operating Cash Flow (Annual)
            </h3>
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
                  {historical.operatingCashFlow.map((item, idx) => (
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
        {historical.freeCashFlow && historical.freeCashFlow.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-gray-200 mb-3">
              Free Cash Flow (Annual)
            </h3>
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
                  {historical.freeCashFlow.map((item, idx) => (
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
