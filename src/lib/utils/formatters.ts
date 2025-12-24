/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - Currency code (default: USD)
 * @param decimals - Number of decimal places (max 2)
 */
export function formatCurrency(
  value: number | undefined | null,
  currency: string = "USD",
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format large numbers with K, M, B, T suffixes
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (max 2)
 */
export function formatLargeNumber(
  value: number | undefined | null,
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(decimals)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  } else {
    return `${sign}${absValue.toFixed(decimals)}`;
  }
}

/**
 * Format a percentage value from decimal (e.g., 0.7005 -> 70.05%)
 * Use this for API values that come as decimals
 * @param value - The numeric value as decimal (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default 2)
 */
export function formatPercentageFromDecimal(
  value: number | undefined | null,
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format a percentage value (for values already in percentage format)
 * @param value - The numeric value (as percentage, e.g., 15 for 15%)
 * @param decimals - Number of decimal places (default 2)
 */
export function formatPercentage(
  value: number | undefined | null,
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a ratio or multiplier
 * @param value - The numeric value
 * @param decimals - Number of decimal places (max 2)
 */
export function formatRatio(
  value: number | undefined | null,
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "N/A";
  }

  return value.toFixed(decimals);
}

/**
 * Format a date timestamp
 * @param timestamp - Unix timestamp in seconds or milliseconds
 * @param format - Format type: 'short', 'long', 'relative'
 */
export function formatDate(
  timestamp: number | undefined | null,
  format: "short" | "long" | "relative" = "short"
): string {
  if (timestamp === undefined || timestamp === null) {
    return "N/A";
  }

  // Convert to milliseconds if needed
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);

  if (format === "relative") {
    return formatRelativeTime(date);
  }

  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return formatDate(date.getTime(), "short");
  } else if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}

/**
 * Validate ticker symbol format
 * @param ticker - Ticker symbol to validate
 */
export function isValidTicker(ticker: string): boolean {
  if (!ticker || ticker.trim().length === 0) {
    return false;
  }

  // Basic validation: 1-5 uppercase letters, possibly with a dot
  const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
  return tickerRegex.test(ticker.trim().toUpperCase());
}

/**
 * Normalize ticker symbol (uppercase, trim)
 * @param ticker - Ticker symbol to normalize
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

/**
 * Get display value or fallback
 * @param value - Value to check
 * @param fallback - Fallback string (default: 'N/A')
 */
export function getDisplayValue<T>(
  value: T | undefined | null,
  fallback: string = "N/A"
): T | string {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "number" && isNaN(value)) {
    return fallback;
  }
  return value;
}

/**
 * Calculate change color class
 * @param value - Change value (positive or negative)
 */
export function getChangeColorClass(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "text-gray-400";
  }
  return value >= 0 ? "text-green-400" : "text-red-400";
}

/**
 * Get classification badge color
 * @param classification - Valuation classification
 */
export function getClassificationColor(
  classification: "undervalued" | "fair" | "overvalued"
): string {
  switch (classification) {
    case "undervalued":
      return "bg-green-900/30 text-green-300 border-green-700";
    case "fair":
      return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
    case "overvalued":
      return "bg-red-900/30 text-red-300 border-red-700";
  }
}
