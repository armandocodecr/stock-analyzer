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
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      title: "Ticker not found",
      description: ticker
        ? `No information found for ticker "${ticker}". Please verify the symbol is correct.`
        : "The specified ticker was not found.",
      suggestion:
        "Try with known tickers like AAPL, MSFT, NVDA, or AMZN.",
    },
    "api-error": {
      icon: <AlertCircle className="w-12 h-12 text-orange-500" />,
      title: "API Error",
      description:
        message || "There was a problem fetching financial data.",
      suggestion:
        "Please try again in a few moments. If the problem persists, verify your API key.",
    },
    "rate-limit": {
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      title: "Rate limit reached",
      description:
        "The API query limit has been reached.",
      suggestion: "Please wait a few minutes before trying again.",
    },
    generic: {
      icon: <AlertCircle className="w-12 h-12 text-gray-300" />,
      title: "Error",
      description: message || "An unexpected error occurred.",
      suggestion: "Please try again.",
    },
  };

  const config = errorConfig[type];

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="flex flex-col items-center text-center space-y-4">
        {config.icon}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {config.title}
          </h2>
          <p className="text-gray-300 mb-4">{config.description}</p>
          <p className="text-sm text-gray-400 italic">{config.suggestion}</p>
        </div>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
