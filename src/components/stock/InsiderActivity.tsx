"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ExternalLink, Minus } from "lucide-react";

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
        setData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsiders();
  }, [ticker]);

  const buildFilingURL = (accessionNumber: string) =>
    `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--ink-secondary)" }}
        >
          Insider Activity
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          Form 4
        </span>
      </div>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <Shell>
        <p className="px-4 py-6 text-xs" style={{ color: "var(--ink-tertiary)" }}>
          Loading insider activity…
        </p>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell>
        <p className="px-4 py-6 text-xs" style={{ color: "var(--negative-text)" }}>
          {error || "No data available"}
        </p>
      </Shell>
    );
  }

  const sentimentColor =
    data.summary.sentiment === "bullish"
      ? "var(--positive-text)"
      : data.summary.sentiment === "bearish"
      ? "var(--negative-text)"
      : "var(--ink-secondary)";

  const sentimentBg =
    data.summary.sentiment === "bullish"
      ? "var(--positive-muted)"
      : data.summary.sentiment === "bearish"
      ? "var(--negative-muted)"
      : "var(--surface-inset)";

  return (
    <Shell>
      {/* Summary bar */}
      <div
        className="px-4 py-3 grid grid-cols-4 gap-4"
        style={{
          background: "var(--surface-inset)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Transactions
          </p>
          <p
            className="text-lg font-mono font-bold mt-0.5"
            style={{ color: "var(--ink-primary)" }}
          >
            {data.summary.totalTransactions}
          </p>
        </div>
        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Buys
          </p>
          <p
            className="text-lg font-mono font-bold mt-0.5"
            style={{ color: "var(--positive-text)" }}
          >
            {data.summary.buyTransactions}
          </p>
        </div>
        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Sells
          </p>
          <p
            className="text-lg font-mono font-bold mt-0.5"
            style={{ color: "var(--negative-text)" }}
          >
            {data.summary.sellTransactions}
          </p>
        </div>
        <div
          className="px-3 py-2 rounded flex items-center gap-2"
          style={{ background: sentimentBg }}
        >
          {data.summary.sentiment === "bullish" ? (
            <TrendingUp className="w-3.5 h-3.5" style={{ color: sentimentColor }} />
          ) : data.summary.sentiment === "bearish" ? (
            <TrendingDown className="w-3.5 h-3.5" style={{ color: sentimentColor }} />
          ) : (
            <Minus className="w-3.5 h-3.5" style={{ color: sentimentColor }} />
          )}
          <div>
            <p
              className="text-xs font-semibold capitalize"
              style={{ color: sentimentColor }}
            >
              {data.summary.sentiment}
            </p>
            <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
              Sentiment
            </p>
          </div>
        </div>
      </div>

      {/* Filings list */}
      <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: "var(--border-subtle)" }}>
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
              className="px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {isBuy ? (
                  <TrendingUp
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--positive-text)" }}
                  />
                ) : isSell ? (
                  <TrendingDown
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--negative-text)" }}
                  />
                ) : (
                  <Minus
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--ink-tertiary)" }}
                  />
                )}
                <div>
                  <p
                    className="text-xs font-mono font-semibold"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    {new Date(filing.filingDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    {filing.primaryDocDescription || "Form 4 Filing"}
                  </p>
                </div>
              </div>
              <a
                href={buildFilingURL(filing.accessionNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs shrink-0"
                style={{ color: "var(--accent-text)" }}
              >
                View
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
