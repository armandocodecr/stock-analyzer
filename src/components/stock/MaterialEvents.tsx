"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

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

  const buildFilingURL = (accessionNumber: string) =>
    `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;

  const importancePill = (importance: "high" | "medium" | "low") => {
    const styles: Record<string, { color: string; bg: string }> = {
      high: { color: "var(--negative-text)", bg: "var(--negative-muted)" },
      medium: { color: "var(--warning-text)", bg: "var(--warning-muted)" },
      low: { color: "var(--ink-tertiary)", bg: "var(--surface-inset)" },
    };
    return styles[importance];
  };

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
          Material Events
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          8-K Filings
        </span>
      </div>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <Shell>
        <p className="px-4 py-6 text-xs" style={{ color: "var(--ink-tertiary)" }}>
          Loading events…
        </p>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <p className="px-4 py-6 text-xs" style={{ color: "var(--negative-text)" }}>
          {error}
        </p>
      </Shell>
    );
  }

  if (events.length === 0) {
    return (
      <Shell>
        <p className="px-4 py-6 text-xs" style={{ color: "var(--ink-tertiary)" }}>
          No recent 8-K filings found.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {events.map((event) => {
          const hasHighImportance = event.parsedItems.some(
            (item) => item.importance === "high"
          );
          return (
            <div
              key={event.accessionNumber}
              className="px-4 py-4"
              style={{
                borderLeft: hasHighImportance
                  ? "3px solid var(--negative)"
                  : "3px solid transparent",
              }}
            >
              {/* Date + link row */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p
                    className="text-xs font-mono font-semibold"
                    style={{ color: "var(--ink-primary)" }}
                  >
                    {new Date(event.filingDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Report:{" "}
                    {new Date(event.reportDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={buildFilingURL(event.accessionNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "var(--accent-text)" }}
                >
                  View Filing
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Items */}
              {event.parsedItems.length > 0 ? (
                <div className="space-y-2">
                  {event.parsedItems.map((item, idx) => {
                    const pill = importancePill(item.importance);
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <span
                          className="inline-block px-1.5 py-0.5 text-xs font-mono font-semibold rounded shrink-0"
                          style={{
                            color: pill.color,
                            background: pill.bg,
                          }}
                        >
                          {item.code}
                        </span>
                        <p
                          className="text-xs"
                          style={{ color: "var(--ink-secondary)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  className="text-xs italic"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  No specific items disclosed
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
