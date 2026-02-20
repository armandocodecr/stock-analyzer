import { StockData } from "@/types/stock";
import { AlertTriangle } from "lucide-react";

interface CompanyOverviewProps {
  data: StockData;
}

export default function CompanyOverview({ data }: CompanyOverviewProps) {
  const daysOld = data.filingDate
    ? Math.floor(
        (Date.now() - new Date(data.filingDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Masthead */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Ticker + exchange */}
            <div className="flex items-center gap-3 mb-1">
              <span
                className="font-mono text-2xl font-bold tracking-wider"
                style={{ color: "var(--accent-text)" }}
              >
                {data.symbol}
              </span>
              {data.exchange && (
                <span
                  className="text-xs font-mono tracking-widest px-2 py-0.5 rounded"
                  style={{
                    background: "var(--accent-muted)",
                    color: "var(--accent-text)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  {data.exchange}
                </span>
              )}
            </div>

            {/* Company name */}
            <h1
              className="text-xl font-semibold leading-tight"
              style={{ color: "var(--ink-primary)" }}
            >
              {data.name}
            </h1>

            {/* Sector */}
            {data.sector && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--ink-tertiary)" }}
              >
                {data.sector}
              </p>
            )}
          </div>

          {/* Data source badge */}
          <div
            className="text-right shrink-0"
          >
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--positive-text)" }}
            >
              SEC EDGAR
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--ink-tertiary)" }}
            >
              CIK {data.cik}
            </p>
          </div>
        </div>
      </div>

      {/* Filing metadata strip */}
      <div
        className="px-6 py-3 flex flex-wrap gap-x-8 gap-y-2"
        style={{
          background: "var(--surface-inset)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {data.filingDate && (
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Last Filing
            </p>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: "var(--ink-secondary)" }}
            >
              {new Date(data.filingDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              {daysOld !== null && (
                <span style={{ color: "var(--ink-tertiary)" }}>
                  {" "}· {daysOld}d ago
                </span>
              )}
            </p>
          </div>
        )}
        {data.periodEndDate && (
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Period End
            </p>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: "var(--ink-secondary)" }}
            >
              {new Date(data.periodEndDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        )}
        {data.fiscalYear && (
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Fiscal Year
            </p>
            <p
              className="text-xs font-mono mt-0.5"
              style={{ color: "var(--ink-secondary)" }}
            >
              FY {data.fiscalYear}
            </p>
          </div>
        )}
        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Source
          </p>
          <p
            className="text-xs font-mono mt-0.5"
            style={{ color: "var(--ink-secondary)" }}
          >
            10-K Annual Report
          </p>
        </div>
      </div>

      {/* Stale data warning */}
      {daysOld !== null && daysOld > 180 && (
        <div
          className="px-6 py-3 flex items-start gap-3"
          style={{
            background: "var(--warning-muted)",
            borderTop: "1px solid rgba(217,119,6,0.25)",
          }}
        >
          <AlertTriangle
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "var(--warning)" }}
          />
          <p className="text-xs" style={{ color: "var(--warning-text)" }}>
            Last filing was {daysOld} days ago. More recent quarterly data may
            be available.
          </p>
        </div>
      )}
    </div>
  );
}
