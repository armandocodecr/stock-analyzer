import { cache } from "../utils/cache";

const SEC_BASE_URL = "https://www.sec.gov";
const USER_AGENT = "Stock-Analyzer-App armando.cr.murillo@gmail.com";

interface TickerMapping {
  cik_str: number;
  ticker: string;
  title: string;
}

/**
 * Fetch complete ticker to CIK mapping from SEC
 * This file contains ALL public companies (~13,000 tickers)
 */
export async function fetchTickerMappings(): Promise<
  Record<string, TickerMapping>
> {
  const cacheKey = "sec_ticker_mappings";
  const cached = cache.get<Record<string, TickerMapping>>(cacheKey);

  if (cached) {
    console.log("[TICKER-LOOKUP] Using cached ticker mappings");
    return cached;
  }

  console.log("[TICKER-LOOKUP] Fetching ticker mappings from SEC...");
  
  try {
    const response = await fetch(`${SEC_BASE_URL}/files/company_tickers.json`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
      },
    });

    console.log("[TICKER-LOOKUP] Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to fetch ticker mappings from SEC: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[TICKER-LOOKUP] Successfully fetched", Object.keys(data).length, "ticker mappings");

    // Cache for 7 days (this data rarely changes)
    cache.set(cacheKey, data, 7 * 24 * 60 * 60 * 1000);

    return data;
  } catch (error) {
    console.error("[TICKER-LOOKUP] Fetch error:", error);
    throw error;
  }
}

/**
 * Search for a ticker and return CIK
 */
export async function searchTickerCIK(ticker: string): Promise<string | null> {
  console.log("[TICKER-LOOKUP] Searching for ticker:", ticker);
  
  const mappings = await fetchTickerMappings();
  const normalizedTicker = ticker.toUpperCase().trim();

  console.log("[TICKER-LOOKUP] Normalized ticker:", normalizedTicker);

  // Search through all mappings
  for (const key in mappings) {
    const mapping = mappings[key];
    if (mapping.ticker === normalizedTicker) {
      // Pad CIK to 10 digits with leading zeros
      const cik = mapping.cik_str.toString().padStart(10, "0");
      console.log("[TICKER-LOOKUP] Found CIK for", normalizedTicker, ":", cik);
      return cik;
    }
  }

  console.log("[TICKER-LOOKUP] No CIK found for ticker:", normalizedTicker);
  return null;
}

/**
 * Search tickers by company name
 */
export async function searchCompaniesByName(
  query: string,
  limit: number = 10
): Promise<Array<{ ticker: string; name: string; cik: string }>> {
  const mappings = await fetchTickerMappings();
  const normalizedQuery = query.toLowerCase();

  const results: Array<{ ticker: string; name: string; cik: string }> = [];

  for (const key in mappings) {
    const mapping = mappings[key];
    if (
      mapping.title.toLowerCase().includes(normalizedQuery) ||
      mapping.ticker.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        ticker: mapping.ticker,
        name: mapping.title,
        cik: mapping.cik_str.toString().padStart(10, "0"),
      });

      if (results.length >= limit) break;
    }
  }

  return results;
}
