"use client";

import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Minus,
} from "lucide-react";

interface InsiderFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocDescription: string;
}

interface InsiderData {
  filings: InsiderFiling[];
  summary: {
    totalTransactions: number;
    buyTransactions: number;
    sellTransactions: number;
    sentiment: "bullish" | "bearish" | "neutral";
  };
}

interface InsiderActivityProps {
  ticker: string;
  cik: string;
}

export default function InsiderActivity({ ticker, cik }: InsiderActivityProps) {
  const [data, setData] = useState<InsiderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsiders() {
      try {
        const response = await fetch(`/api/insiders/${ticker}`);
        if (!response.ok) throw new Error("Failed to fetch insider activity");
        const insiderData = await response.json();
        setData(insiderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsiders();
  }, [ticker]);

  const buildFilingURL = (accessionNumber: string) => {
    return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-400 bg-green-900/30 border-green-300";
      case "bearish":
        return "text-red-400 bg-red-900/30 border-red-700/50";
      default:
        return "text-gray-200 bg-gray-700 border-gray-600";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-5 h-5" />;
      case "bearish":
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Insider Activity (Forms 4)
        </h2>
        <p className="text-sm text-gray-400">Loading insider activity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Insider Activity (Forms 4)
        </h2>
        <p className="text-sm text-red-400">
          Error: {error || "No data available"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        Insider Activity (Forms 4)
      </h2>

      {/* Sentiment Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-300 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-white">
            {data.summary.totalTransactions}
          </p>
        </div>

        <div className="p-4 border border-green-700/50 rounded-lg bg-green-900/30">
          <p className="text-sm text-green-400 mb-1">Buys</p>
          <p className="text-2xl font-bold text-green-300">
            {data.summary.buyTransactions}
          </p>
        </div>

        <div className="p-4 border border-red-700/50 rounded-lg bg-red-900/30">
          <p className="text-sm text-red-400 mb-1">Sells</p>
          <p className="text-2xl font-bold text-red-900">
            {data.summary.sellTransactions}
          </p>
        </div>
      </div>

      {/* Sentiment Indicator */}
      <div
        className={`mb-6 p-4 border rounded-lg flex items-center gap-3 ${getSentimentColor(
          data.summary.sentiment
        )}`}
      >
        {getSentimentIcon(data.summary.sentiment)}
        <div>
          <p className="font-semibold">
            Insider Sentiment:{" "}
            <span className="capitalize">{data.summary.sentiment}</span>
          </p>
          <p className="text-sm mt-1">
            {data.summary.sentiment === "bullish"
              ? "More insider buying than selling - potentially positive signal"
              : data.summary.sentiment === "bearish"
              ? "More insider selling than buying - exercise caution"
              : "Balanced insider activity"}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-md font-semibold text-gray-200 mb-3">
          Recent Transactions (Last 20)
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.filings.map((filing) => {
            const isBuy = filing.primaryDocDescription
              ?.toLowerCase()
              .includes("purchase");
            const isSell = filing.primaryDocDescription
              ?.toLowerCase()
              .includes("sale");

            return (
              <div
                key={filing.accessionNumber}
                className="p-3 border border-gray-700 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {isBuy ? (
                    <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
                  ) : isSell ? (
                    <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {new Date(filing.filingDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-300">
                      {filing.primaryDocDescription || "Form 4 Filing"}
                    </p>
                  </div>
                </div>
                <a
                  href={buildFilingURL(filing.accessionNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm shrink-0"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
