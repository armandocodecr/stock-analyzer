"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, Calendar, TrendingUp } from "lucide-react";

interface MaterialEvent {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  items: string;
  parsedItems: Array<{
    code: string;
    description: string;
    importance: "high" | "medium" | "low";
  }>;
}

interface MaterialEventsProps {
  ticker: string;
  cik: string;
}

export default function MaterialEvents({ ticker, cik }: MaterialEventsProps) {
  const [events, setEvents] = useState<MaterialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`/api/events/${ticker}`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [ticker]);

  const buildFilingURL = (accessionNumber: string) => {
    return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          Material Events (8-K Filings)
        </h2>
        <p className="text-sm text-gray-400">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          Material Events (8-K Filings)
        </h2>
        <p className="text-sm text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          Material Events (8-K Filings)
        </h2>
        <p className="text-sm text-gray-400">No recent 8-K filings found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-400" />
        Material Events (8-K Filings)
      </h2>

      <p className="text-sm text-gray-300 mb-4">
        Recent material events reported to the SEC. High-importance events are
        highlighted.
      </p>

      <div className="space-y-4">
        {events.map((event) => {
          const hasHighImportance = event.parsedItems.some(
            (item) => item.importance === "high"
          );

          return (
            <div
              key={event.accessionNumber}
              className={`p-4 border rounded-lg transition-all ${
                hasHighImportance
                  ? "border-red-700/50 bg-red-900/30 hover:shadow-md"
                  : "border-gray-700 bg-gray-900 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {new Date(event.filingDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Report Date:{" "}
                      {new Date(event.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={buildFilingURL(event.accessionNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  View Filing
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {event.parsedItems.length > 0 ? (
                <div className="space-y-2">
                  {event.parsedItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded shrink-0 ${
                          item.importance === "high"
                            ? "bg-red-900/40 text-red-300"
                            : item.importance === "medium"
                            ? "bg-yellow-900/40 text-yellow-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {item.code}
                      </span>
                      <p className="text-sm text-gray-200 flex-1">
                        {item.description}
                      </p>
                      {item.importance === "high" && (
                        <TrendingUp className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No specific items disclosed
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
