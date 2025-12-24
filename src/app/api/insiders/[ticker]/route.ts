import { NextRequest, NextResponse } from "next/server";
import { getRecentForms4 } from "@/lib/services/sec-submissions";
import { getCIKFromTicker } from "@/lib/services/sec";
import type { Params } from "next/dist/server/request/params";

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<Params> }
) {
  try {
    const params = await segmentData.params;
    const ticker = params.ticker as string;

    if (!ticker) {
      return NextResponse.json(
        { error: "Ticker symbol is required" },
        { status: 400 }
      );
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    const cik = await getCIKFromTicker(normalizedTicker);
    const filings = await getRecentForms4(cik, 20);

    // Calculate insider sentiment
    const buyTransactions = filings.filter((f) =>
      f.primaryDocDescription?.toLowerCase().includes("purchase")
    ).length;
    const sellTransactions = filings.filter((f) =>
      f.primaryDocDescription?.toLowerCase().includes("sale")
    ).length;

    const sentiment =
      buyTransactions > sellTransactions
        ? "bullish"
        : sellTransactions > buyTransactions
        ? "bearish"
        : "neutral";

    return NextResponse.json(
      {
        filings,
        summary: {
          totalTransactions: filings.length,
          buyTransactions,
          sellTransactions,
          sentiment,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching insider activity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to fetch insider activity", message: errorMessage },
      { status: 500 }
    );
  }
}
