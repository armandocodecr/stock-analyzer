import { StockData } from "@/types/stock";
import { Building2, FileText, Calendar, AlertTriangle } from "lucide-react";

interface CompanyOverviewProps {
  data: StockData;
}

export default function CompanyOverview({ data }: CompanyOverviewProps) {
  // Calculate days since last filing
  const daysOld = data.filingDate
    ? Math.floor(
        (Date.now() - new Date(data.filingDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{data.name}</h1>
              <p className="text-lg text-gray-300">{data.symbol}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">CIK Number</p>
              <p className="text-lg font-semibold text-white">{data.cik}</p>
            </div>

            {data.sector && (
              <div>
                <p className="text-sm text-gray-400">Sector</p>
                <p className="text-lg font-semibold text-white">
                  {data.sector}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-400">Data Source</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                <p className="text-lg font-semibold text-green-400">
                  SEC EDGAR
                </p>
              </div>
            </div>
          </div>

          {/* Filing Dates */}
          {data.filingDate && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last Filing Date
                </p>
                <p className="text-md font-semibold text-white">
                  {new Date(data.filingDate).toLocaleDateString()}
                </p>
                {daysOld !== null && (
                  <p className="text-xs text-gray-400">({daysOld} days ago)</p>
                )}
              </div>

              {data.periodEndDate && (
                <div>
                  <p className="text-sm text-gray-400">Period Ending</p>
                  <p className="text-md font-semibold text-white">
                    {new Date(data.periodEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {data.fiscalYear && (
                <div>
                  <p className="text-sm text-gray-400">Fiscal Year</p>
                  <p className="text-md font-semibold text-white">
                    FY {data.fiscalYear}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Data from official SEC filings (10-K Annual Reports).</strong> All financial data displayed is extracted directly from the company's most recent 10-K annual report filed with the US Securities and Exchange Commission. No calculations or adjustments have been made to ensure maximum accuracy.
        </p>
      </div>

      {/* Outdated Data Warning */}
      {daysOld !== null && daysOld > 180 && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-300 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">
              Data May Be Outdated
            </p>
            <p className="text-sm text-yellow-200/80 mt-1">
              The last filing was {daysOld} days ago. More recent quarterly data
              may be available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
