/**
 * API Route: GET /api/stock/[ticker]
 * Returns stock data from SEC EDGAR filings only
 */

import { NextRequest, NextResponse } from "next/server";
import { extractSECMetrics } from "@/lib/services/sec";
import { StockData } from "@/types/stock";
import type { Params } from "next/dist/server/request/params";

// Map CIK to sector (basic mapping for supported tickers)
const CIK_TO_SECTOR: Record<string, string> = {
  "0000320193": "Technology",
  "0000789019": "Technology",
  "0001652044": "Technology",
  "0001018724": "Consumer Cyclical",
  "0001045810": "Technology",
  "0001326801": "Technology",
  "0001318605": "Consumer Cyclical",
  "0001067983": "Financial Services",
  "0001403161": "Financial Services",
  "0000019617": "Financial Services",
  "0000104169": "Consumer Defensive",
  "0001141391": "Financial Services",
  "0000080424": "Consumer Defensive",
  "0000200406": "Healthcare",
  "0000354950": "Consumer Cyclical",
  "0000070858": "Financial Services",
  "0001744489": "Communication Services",
  "0001065280": "Communication Services",
  "0000858877": "Technology",
  "0000050863": "Technology",
  "0000077476": "Consumer Defensive",
  "0000021344": "Consumer Defensive",
  "0000320187": "Consumer Cyclical",
};

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<Params> }
) {
  try {
    const params = await segmentData.params;
    const ticker = params.ticker as string;

    console.log("[API] Received request for ticker:", ticker);

    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker symbol is required" },
        { status: 400 }
      );
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    console.log("[API] Normalized ticker:", normalizedTicker);

    // Fetch data ONLY from SEC EDGAR
    const secData = await extractSECMetrics(normalizedTicker);
    console.log("[API] SEC data received:", secData ? "success" : "null");

    if (!secData) {
      console.log("[API] No SEC data found for ticker:", normalizedTicker);
      return NextResponse.json(
        {
          error: "Stock data not available",
          message: `No SEC filing data found for ${normalizedTicker}. This ticker may not be supported or may not be a US public company.`,
        },
        { status: 404 }
      );
    }

    // Transform SEC data to StockData format
    const stockData: StockData = {
      symbol: normalizedTicker,
      name: secData.entityName,
      cik: secData.cik,
      sector: CIK_TO_SECTOR[secData.cik],
      filingDate: secData.filingDate,
      periodEndDate: secData.periodEndDate,
      fiscalYear: secData.fiscalYear,

      metrics: {
        // Raw Income Statement (from 10-K)
        revenue: secData.revenue,
        costOfRevenue: secData.costOfRevenue,
        grossProfit: secData.grossProfit,
        operatingExpenses: secData.operatingExpenses,
        rdExpense: secData.rdExpense,
        sgaExpense: secData.sgaExpense,
        operatingIncome: secData.operatingIncome,
        interestExpense: secData.interestExpense,
        incomeTaxExpense: secData.incomeTaxExpense,
        depreciationAmortization: secData.depreciationAmortization,
        ebitda: secData.ebitda,
        netIncome: secData.netIncome,

        // Raw Balance Sheet - Assets (from 10-K)
        totalAssets: secData.totalAssets,
        currentAssets: secData.currentAssets,
        cash: secData.cash,
        accountsReceivable: secData.accountsReceivable,
        inventory: secData.inventory,
        propertyPlantEquipment: secData.propertyPlantEquipment,

        // Raw Balance Sheet - Liabilities (from 10-K)
        totalLiabilities: secData.totalLiabilities,
        currentLiabilities: secData.currentLiabilities,
        shortTermDebt: secData.shortTermDebt,
        longTermDebt: secData.longTermDebt,
        accountsPayable: secData.accountsPayable,

        // Raw Balance Sheet - Equity (from 10-K)
        stockholdersEquity: secData.stockholdersEquity,

        // Cash Flow Statement (from 10-K)
        operatingCashFlow: secData.operatingCashFlow,
        investingCashFlow: secData.investingCashFlow,
        financingCashFlow: secData.financingCashFlow,
        capex: secData.capex,
        freeCashFlow: secData.freeCashFlow,
        dividendsPaid: secData.dividendsPaid,
        stockRepurchases: secData.stockRepurchases,

        // Debt (simple totals)
        totalDebt: secData.totalDebt,
        netDebt: secData.netDebt,

        // Capital
        sharesOutstanding: secData.sharesOutstanding,
      },

      // Quarterly data (10-Q)
      quarterly: secData.quarterly,

      // Latest metrics for ratio calculations
      latestMetrics: secData.latestMetrics,

      // Historical annual data (10-K) - Last 5 years
      historicalAnnual: secData.historicalAnnual,
    };

    return NextResponse.json(stockData, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=172800", // 24h cache (SEC data doesn't change often)
      },
    });
  } catch (error) {
    console.error("[API] Error fetching SEC data:", error);
    console.error("[API] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Determine appropriate status code
    let statusCode = 500;
    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("Ticker")
    ) {
      statusCode = 404;
    }

    return NextResponse.json(
      {
        error: "Failed to fetch stock data",
        message: errorMessage,
        debug: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: statusCode }
    );
  }
}
