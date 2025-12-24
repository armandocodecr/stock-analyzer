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
    return cached;
  }

  const response = await fetch(`${SEC_BASE_URL}/files/company_tickers.json`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ticker mappings from SEC");
  }

  const data = await response.json();

  // Cache for 7 days (this data rarely changes)
  cache.set(cacheKey, data, 7 * 24 * 60 * 60 * 1000);

  return data;
}

/**
 * Search for a ticker and return CIK
 */
export async function searchTickerCIK(ticker: string): Promise<string | null> {
  const mappings = await fetchTickerMappings();
  const normalizedTicker = ticker.toUpperCase().trim();

  // Search through all mappings
  for (const key in mappings) {
    const mapping = mappings[key];
    if (mapping.ticker === normalizedTicker) {
      // Pad CIK to 10 digits with leading zeros
      return mapping.cik_str.toString().padStart(10, "0");
    }
  }

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
