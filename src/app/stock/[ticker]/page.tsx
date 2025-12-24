import { Metadata } from "next";
import { Suspense } from "react";
import { StockData } from "@/types/stock";
import CompanyOverview from "@/components/stock/CompanyOverview";
import IncomeStatement from "@/components/stock/IncomeStatement";
import BalanceSheet from "@/components/stock/BalanceSheet";
import CashFlowStatement from "@/components/stock/CashFlowStatement";
import FinancialRatios from "@/components/stock/FinancialRatios";
import HistoricalData from "@/components/stock/HistoricalData";
import QuarterlyTrends from "@/components/stock/QuarterlyTrends";
import MaterialEvents from "@/components/stock/MaterialEvents";
import InsiderActivity from "@/components/stock/InsiderActivity";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Tabs from "@/components/ui/Tabs";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  Scale,
  Droplet,
  FileText,
  Users,
  Bell,
} from "lucide-react";
import Link from "next/link";
import type { Params } from "next/dist/server/request/params";

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const ticker = (params.ticker as string) || "";

  return {
    title: `${ticker.toUpperCase()} - SEC Filing Analyzer`,
    description: `Comprehensive financial analysis of ${ticker.toUpperCase()} from official SEC filings including quarterly data, material events, and insider trading`,
  };
}

async function getStockData(ticker: string): Promise<StockData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/stock/${ticker}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

export default async function StockPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const ticker = (params.ticker as string) || "";
  const normalizedTicker = ticker.toUpperCase().trim();

  const stockData = await getStockData(normalizedTicker);

  if (!stockData) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </Link>
          </div>
          <ErrorMessage type="not-found" ticker={normalizedTicker} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Search another ticker
          </Link>
        </div>

        {/* Company Overview - Always Visible */}
        <CompanyOverview data={stockData} />

        {/* Tabbed Content */}
        <div className="mt-6">
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                id: "overview",
                label: "Overview",
                icon: <BarChart3 />,
                content: (
                  <div className="space-y-6">
                    {/* Key Financial Ratios */}
                    <FinancialRatios data={stockData} />

                    {/* Quarterly Trends */}
                    {stockData.quarterly && (
                      <Suspense
                        fallback={
                          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                            <p className="text-sm text-gray-400">
                              Loading quarterly data...
                            </p>
                          </div>
                        }
                      >
                        <QuarterlyTrends data={stockData} />
                      </Suspense>
                    )}
                  </div>
                ),
              },
              {
                id: "income-statement",
                label: "Income Statement",
                icon: <DollarSign />,
                content: <IncomeStatement data={stockData} />,
              },
              {
                id: "balance-sheet",
                label: "Balance Sheet",
                icon: <Scale />,
                content: <BalanceSheet data={stockData} />,
              },
              {
                id: "cash-flow",
                label: "Cash Flow",
                icon: <Droplet />,
                content: <CashFlowStatement data={stockData} />,
              },
              {
                id: "historical",
                label: "Historical Data",
                icon: <TrendingUp />,
                content: stockData.historicalAnnual ? (
                  <HistoricalData data={stockData} />
                ) : (
                  <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <p className="text-sm text-gray-400">
                      No historical data available
                    </p>
                  </div>
                ),
              },
              {
                id: "events",
                label: "Material Events",
                icon: <Bell />,
                content: (
                  <Suspense
                    fallback={
                      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                        <p className="text-sm text-gray-400">
                          Loading material events...
                        </p>
                      </div>
                    }
                  >
                    <MaterialEvents
                      ticker={normalizedTicker}
                      cik={stockData.cik}
                    />
                  </Suspense>
                ),
              },
              {
                id: "insiders",
                label: "Insider Activity",
                icon: <Users />,
                content: (
                  <Suspense
                    fallback={
                      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                        <p className="text-sm text-gray-400">
                          Loading insider activity...
                        </p>
                      </div>
                    }
                  >
                    <InsiderActivity
                      ticker={normalizedTicker}
                      cik={stockData.cik}
                    />
                  </Suspense>
                ),
              },
            ]}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
          <h3 className="font-semibold text-yellow-400 mb-2">
            ⚠️ Important Notice
          </h3>
          <p className="text-sm text-yellow-200/80">
            All data presented is extracted from official SEC filings (10-K
            annual reports, 10-Q quarterly reports, 8-K material events, and
            Forms 4 insider trading). This information is for educational and
            informational purposes only. It does not constitute financial,
            investment, or legal advice. Always consult with a professional
            financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
