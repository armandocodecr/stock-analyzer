"use client";

import { useState } from "react";

export default function DebugPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [stockResults, setStockResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?q=${ticker}`);
      const data = await response.json();
      setSearchResults({ status: response.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stock/${ticker}`);
      const data = await response.json();
      setStockResults({ 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 Vercel Deployment Debug</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Endpoints</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Ticker Symbol:</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-gray-700 rounded text-white"
              placeholder="Enter ticker (e.g., AAPL)"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={testSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test /api/search"}
            </button>
            
            <button
              onClick={testStock}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test /api/stock"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
              <h3 className="font-bold mb-2">Error:</h3>
              <pre className="text-sm overflow-auto">{error}</pre>
            </div>
          )}
        </div>

        {searchResults && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Search Results (Status: {searchResults.status})
            </h2>
            <pre className="bg-gray-900 rounded p-4 text-sm overflow-auto max-h-96">
              {JSON.stringify(searchResults.data, null, 2)}
            </pre>
          </div>
        )}

        {stockResults && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Stock Data Results (Status: {stockResults.status} - {stockResults.statusText})
            </h2>
            <pre className="bg-gray-900 rounded p-4 text-sm overflow-auto max-h-96">
              {JSON.stringify(stockResults.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Deploy this version to Vercel</li>
            <li>Navigate to <code className="bg-gray-800 px-2 py-1 rounded">/debug</code> page</li>
            <li>Test both endpoints with a known ticker (e.g., AAPL)</li>
            <li>Check the results and HTTP status codes</li>
            <li>Go to Vercel Dashboard → Deployments → Latest → Functions tab</li>
            <li>Look for console.log entries with [API], [SEC], and [TICKER-LOOKUP] prefixes</li>
            <li>Report back which endpoint fails and what error appears in logs</li>
          </ol>
        </div>

        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Common Issues</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>403 Forbidden:</strong> SEC API is blocking Vercel's IP addresses</li>
            <li><strong>504 Timeout:</strong> Request taking too long (default 10s limit)</li>
            <li><strong>Network error:</strong> DNS/connectivity issue from Vercel servers</li>
            <li><strong>Empty response:</strong> Check if ticker mappings are being fetched</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
