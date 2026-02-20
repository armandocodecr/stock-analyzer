"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { normalizeTicker, isValidTicker } from "@/lib/utils/formatters";

const POPULAR_TICKERS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "TSLA",
  "META",
  "JPM",
];

interface SearchResult {
  ticker: string;
  name: string;
  cik: string;
}

export default function TickerSearch() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const results = await response.json();
          setSuggestions(results);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (searchTicker: string) => {
    const normalized = normalizeTicker(searchTicker);
    if (!normalized) {
      setError("Enter a ticker symbol");
      return;
    }
    if (!isValidTicker(normalized)) {
      setError("Invalid ticker (1–5 letters)");
      return;
    }
    setError("");
    setShowSuggestions(false);
    setQuery("");
    router.push(`/stock/${normalized}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="w-full max-w-xl mx-auto" ref={searchRef}>
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            placeholder="Ticker or company name…"
            className="w-full px-4 py-3 pr-12 text-sm font-mono tracking-wide transition-all"
            style={{
              background: "var(--surface-inset)",
              color: "var(--ink-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "6px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--border-focus)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--accent-muted)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }}
            maxLength={50}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Search"
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity disabled:opacity-40"
            style={{ color: "var(--accent)" }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p
            className="mt-2 text-xs ml-1"
            style={{ color: "var(--negative-text)" }}
          >
            {error}
          </p>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute z-20 w-full mt-1 overflow-y-auto max-h-80"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border-strong)",
              borderRadius: "6px",
            }}
          >
            {suggestions.map((result) => (
              <button
                key={result.cik}
                onClick={() => handleSearch(result.ticker)}
                className="w-full px-4 py-3 text-left transition-colors"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--surface)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }}
              >
                <p
                  className="text-xs font-bold font-mono tracking-wider"
                  style={{ color: "var(--accent-text)" }}
                >
                  {result.ticker}
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  {result.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Popular tickers */}
      <div className="mt-6">
        <p
          className="text-xs text-center mb-3 tracking-widest uppercase"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Quick access
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_TICKERS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleSearch(symbol)}
              className="px-3 py-1.5 text-xs font-mono font-semibold tracking-wider transition-colors"
              style={{
                background: "var(--surface)",
                color: "var(--ink-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--accent-text)";
                el.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--ink-secondary)";
                el.style.borderColor = "var(--border-default)";
              }}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
