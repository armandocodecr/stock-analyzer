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

  // Close suggestions when clicking outside
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

  // Fetch suggestions
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
      setError("Please enter a ticker symbol");
      return;
    }

    if (!isValidTicker(normalized)) {
      setError("Invalid ticker format (1-5 letters)");
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
    <div className="w-full max-w-2xl mx-auto space-y-6" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            placeholder="Search by ticker or company name..."
            className="w-full px-6 py-4 pr-14 text-lg bg-gray-800 text-white border-2 border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg placeholder:text-gray-400"
            maxLength={50}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            aria-label="Search"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600 ml-2">{error}</p>}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-gray-800 border-2 border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {suggestions.map((result) => (
              <button
                key={result.cik}
                onClick={() => handleSearch(result.ticker)}
                className="w-full px-6 py-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
              >
                <p className="font-semibold text-white">{result.ticker}</p>
                <p className="text-sm text-gray-400 truncate">{result.name}</p>
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-400 mb-3">Popular tickers:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_TICKERS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleSearch(symbol)}
              className="px-4 py-2 text-sm font-medium text-blue-400 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
