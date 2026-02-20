"use client";

import { AlertCircle, XCircle, Clock } from "lucide-react";

interface ErrorMessageProps {
  type?: "not-found" | "api-error" | "rate-limit" | "generic";
  message?: string;
  ticker?: string;
}

export default function ErrorMessage({
  type = "generic",
  message,
  ticker,
}: ErrorMessageProps) {
  const errorConfig = {
    "not-found": {
      icon: <XCircle className="w-8 h-8" style={{ color: "var(--negative-text)" }} />,
      title: "Ticker not found",
      description: ticker
        ? `No information found for "${ticker}". Verify the symbol is correct.`
        : "The specified ticker was not found.",
      suggestion: "Try AAPL, MSFT, NVDA, or AMZN.",
    },
    "api-error": {
      icon: <AlertCircle className="w-8 h-8" style={{ color: "var(--warning-text)" }} />,
      title: "API Error",
      description: message || "There was a problem fetching financial data.",
      suggestion: "Please try again in a few moments.",
    },
    "rate-limit": {
      icon: <Clock className="w-8 h-8" style={{ color: "var(--warning-text)" }} />,
      title: "Rate limit reached",
      description: "The API query limit has been reached.",
      suggestion: "Please wait a few minutes before trying again.",
    },
    generic: {
      icon: <AlertCircle className="w-8 h-8" style={{ color: "var(--ink-tertiary)" }} />,
      title: "Error",
      description: message || "An unexpected error occurred.",
      suggestion: "Please try again.",
    },
  };

  const config = errorConfig[type];

  return (
    <div
      className="max-w-lg mx-auto mt-12 p-8 rounded-lg text-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {config.icon}
        <div>
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: "var(--ink-primary)" }}
          >
            {config.title}
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--ink-secondary)" }}>
            {config.description}
          </p>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            {config.suggestion}
          </p>
        </div>
        <a
          href="/"
          className="mt-2 px-5 py-2 text-xs font-medium rounded transition-colors"
          style={{
            background: "var(--accent-muted)",
            color: "var(--accent-text)",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          Back to search
        </a>
      </div>
    </div>
  );
}
