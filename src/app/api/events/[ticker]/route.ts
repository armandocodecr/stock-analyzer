import { NextRequest, NextResponse } from "next/server";
import {
  getRecent8KFilings,
  parse8KItems,
} from "@/lib/services/sec-submissions";
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
    const filings = await getRecent8KFilings(cik, 15);

    // Parse items for each filing
    const events = filings.map((filing) => ({
      ...filing,
      parsedItems: parse8KItems(filing.items),
    }));

    return NextResponse.json(events, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error fetching 8-K events:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to fetch events", message: errorMessage },
      { status: 500 }
    );
  }
}
