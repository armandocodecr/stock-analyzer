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
import AIAnalysis from "@/components/stock/AIAnalysis";
import TradingViewChart from "@/components/stock/TradingViewChart";
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
  Brain,
  Lock,
} from "lucide-react";
import Link from "next/link";
import type { Params } from "next/dist/server/request/params";

const AI_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AI_ANALYSIS === "true";

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const ticker = (params.ticker as string) || "";
  return {
    title: `${ticker.toUpperCase()} — SEC Filing Analyzer`,
    description: `Comprehensive financial analysis of ${ticker.toUpperCase()} from official SEC filings including quarterly data, material events, and insider trading`,
  };
}

async function getStockData(ticker: string): Promise<StockData | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null) ||
      "http://localhost:3000";

    console.log("[STOCK PAGE] Fetching stock data for:", ticker, "from:", baseUrl);

    const response = await fetch(`${baseUrl}/api/stock/${ticker}`, {
      next: { revalidate: 0 },
      cache: "no-store",
    });

    console.log("[STOCK PAGE] Response status:", response.status);

    if (!response.ok) return null;

    const data = await response.json();
    console.log("[STOCK PAGE] Successfully fetched stock data");
    return data;
  } catch (error) {
    console.error("[STOCK PAGE] Error fetching stock data:", error);
    return null;
  }
}

const TabFallback = () => (
  <div
    className="rounded-lg p-6"
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border-default)",
    }}
  >
    <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
      Loading…
    </p>
  </div>
);

export default async function StockPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const ticker = (params.ticker as string) || "";
  const normalizedTicker = ticker.toUpperCase().trim();

  const stockData = await getStockData(normalizedTicker);

  if (!stockData) {
    return (
      <div
        className="min-h-screen py-12"
        style={{ background: "var(--canvas)" }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--ink-tertiary)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to search
            </Link>
          </div>
          <ErrorMessage type="not-found" ticker={normalizedTicker} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: "var(--canvas)" }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back link */}
        <div className="mb-5">
          <Link
            href="/"
            className="ink-link inline-flex items-center gap-2 text-xs font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Search another ticker
          </Link>
        </div>

        {/* Company masthead */}
        <CompanyOverview data={stockData} />

        {/* Tabbed content */}
        <div className="mt-4">
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                id: "overview",
                label: "Overview",
                icon: <BarChart3 />,
                content: (
                  <div className="space-y-4">
                    <TradingViewChart
                      ticker={normalizedTicker}
                      exchange={stockData.exchange}
                    />
                    <FinancialRatios data={stockData} />
                    {stockData.quarterly && (
                      <Suspense fallback={<TabFallback />}>
                        <QuarterlyTrends data={stockData} />
                      </Suspense>
                    )}
                  </div>
                ),
              },
              {
                id: "income-statement",
                label: "Income",
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
                label: "Historical",
                icon: <TrendingUp />,
                content: stockData.historicalAnnual ? (
                  <HistoricalData data={stockData} />
                ) : (
                  <TabFallback />
                ),
              },
              {
                id: "events",
                label: "Events",
                icon: <Bell />,
                content: (
                  <Suspense fallback={<TabFallback />}>
                    <MaterialEvents
                      ticker={normalizedTicker}
                      cik={stockData.cik}
                    />
                  </Suspense>
                ),
              },
              {
                id: "insiders",
                label: "Insiders",
                icon: <Users />,
                content: (
                  <Suspense fallback={<TabFallback />}>
                    <InsiderActivity
                      ticker={normalizedTicker}
                      cik={stockData.cik}
                    />
                  </Suspense>
                ),
              },
              ...(AI_ENABLED
                ? [
                    {
                      id: "ai-analysis",
                      label: "AI",
                      icon: <Brain />,
                      content: (
                        <AIAnalysis
                          data={stockData}
                          ticker={normalizedTicker}
                        />
                      ),
                    },
                  ]
                : [
                    {
                      id: "ai-locked",
                      label: "AI",
                      icon: <Lock />,
                      content: (
                        <div
                          className="rounded-lg p-16 text-center"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border-default)",
                          }}
                        >
                          <Lock
                            className="w-10 h-10 mx-auto mb-4"
                            style={{ color: "var(--ink-disabled)" }}
                          />
                          <p
                            className="text-sm font-semibold mb-2"
                            style={{ color: "var(--ink-secondary)" }}
                          >
                            AI Analysis
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--ink-tertiary)" }}
                          >
                            This feature will be available soon.
                          </p>
                        </div>
                      ),
                    },
                  ]),
            ]}
          />
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 px-5 py-3 rounded-lg"
          style={{
            background: "var(--warning-muted)",
            border: "1px solid rgba(217,119,6,0.2)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            <span style={{ color: "var(--warning-text)" }}>Notice — </span>
            All data is extracted from official SEC filings (10-K, 10-Q, 8-K,
            Form 4). For educational and informational purposes only. Does not
            constitute financial, investment, or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
