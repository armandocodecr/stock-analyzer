"use client";

import { useState } from "react";
import { StockData } from "@/types/stock";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIAnalysisProps {
  data: StockData;
  ticker: string;
}

interface AnalysisResult {
  analysis: string;
  ticker: string;
  timestamp: string;
}

export default function AIAnalysis({ data, ticker }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analyze/${ticker}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stockData: data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error generating analysis");
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-900/30 rounded-lg">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              AI Investment Analysis
            </h2>
            <p className="text-gray-300 mb-4">
              Get a professional evaluation based on all available financial
              data for {ticker.toUpperCase()}. The AI acts as an experienced
              analyst and examines key metrics, trends, and events to provide
              you with a thorough analysis.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400 mb-2">
                Error generating analysis
              </h3>
              <p className="text-red-200/80 text-sm">{error}</p>
              {error.includes("OPENAI_API_KEY") && (
                <p className="mt-2 text-red-200/60 text-sm">
                  Make sure you have configured the OPENAI_API_KEY environment
                  variable in your .env.local file
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          {/* Timestamp */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Analysis generated on{" "}
              {new Date(analysis.timestamp).toLocaleString("en-US")}
            </div>
          </div>

          {/* Analysis Content */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mt-10 mb-8 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-purple-400 mt-12 mb-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-blue-400 mt-8 mb-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-6 leading-relaxed text-base">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-6 space-y-3 pl-6 list-disc marker:text-purple-400">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-6 space-y-3 pl-6 list-decimal marker:text-purple-400">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300 leading-relaxed mb-2">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="text-blue-300 bg-gray-900/50 px-2 py-1 rounded text-sm">
                      {children}
                    </code>
                  ),
                }}
              >
                {analysis.analysis}
              </ReactMarkdown>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
            <p className="text-sm text-yellow-200/80">
              <strong className="text-yellow-400">⚠️ Important Notice:</strong>{" "}
              This analysis is generated by artificial intelligence for educational
              and informational purposes only. It does NOT constitute financial,
              investment, or legal advice. Always consult with a professional
              financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      )}

      {/* Info Box (when no analysis yet) */}
      {!loading && !analysis && !error && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            No analysis generated yet
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Click "Generate Analysis" to get a professional evaluation of{" "}
            {ticker.toUpperCase()} based on all available data.
          </p>
        </div>
      )}
    </div>
  );
}
