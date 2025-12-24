import { NextRequest, NextResponse } from "next/server";
import { searchCompaniesByName } from "@/lib/services/sec-ticker-lookup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await searchCompaniesByName(query, 10);

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
