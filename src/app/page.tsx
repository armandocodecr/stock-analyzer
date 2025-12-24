import TickerSearch from "@/components/search/TickerSearch";
import { BarChart3, TrendingUp, DollarSign, Newspaper } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Stock Analyzer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-2">
            Analyze publicly traded companies with real-time financial data
          </p>
          <p className="text-sm text-gray-400">
            Price information, fundamental metrics, valuation, and news
          </p>
        </div>

        {/* Search Component */}
        <div className="mb-16">
          <TickerSearch />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Real-Time Data
            </h3>
            <p className="text-sm text-gray-300">
              Up-to-date prices and fundamental metrics for publicly traded companies.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              DCF Valuation
            </h3>
            <p className="text-sm text-gray-300">
              Intrinsic value calculation using simplified DCF model based on Free Cash Flow.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Newspaper className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Latest News
            </h3>
            <p className="text-sm text-gray-300">
              Recent financial news relevant to each company.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 mt-16 pt-8 border-t border-gray-700">
          <p className="mb-2">
            Powered by{" "}
            <a
              href="https://finnhub.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Finnhub API
            </a>
          </p>
          <p className="text-xs text-gray-400">
            ⚠️ This tool is for educational and informational purposes only. It does not
            constitute financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
