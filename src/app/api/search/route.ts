import { NextRequest, NextResponse } from "next/server";
import { searchCompaniesByName } from "@/lib/services/sec-ticker-lookup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    console.log("[SEARCH API] Received search request for query:", query);

    if (!query || query.length < 2) {
      console.log("[SEARCH API] Query too short or empty, returning empty array");
      return NextResponse.json([]);
    }

    console.log("[SEARCH API] Searching for companies with query:", query);
    const results = await searchCompaniesByName(query, 10);
    console.log("[SEARCH API] Found", results.length, "results");

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("[SEARCH API] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        error: "Search failed",
        message: error instanceof Error ? error.message : String(error),
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            stack: error instanceof Error ? error.stack : undefined,
          },
        }),
      }, 
      { status: 500 }
    );
  }
}
