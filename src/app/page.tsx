import TickerSearch from "@/components/search/TickerSearch";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--canvas)" }}>
      <div className="container mx-auto px-4">
        {/* ── Wordmark bar ── */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--ink-tertiary)" }}
            >
              SEC EDGAR
            </span>
            <span style={{ color: "var(--border-default)" }}>/</span>
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--accent-text)" }}
            >
              Stock Analyzer
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: "var(--ink-tertiary)" }}
          >
            10-K · 10-Q · 8-K · Form 4
          </span>
        </div>

        {/* ── Hero ── */}
        <div className="max-w-2xl mx-auto pt-24 pb-16 text-center">
          <p
            className="text-xs font-semibold tracking-[0.25em] uppercase mb-6"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Official SEC Filing Data
          </p>

          <h1
            className="text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--ink-primary)" }}
          >
            Analyze any public company
          </h1>
          <p
            className="text-base mb-12"
            style={{ color: "var(--ink-secondary)" }}
          >
            Financial statements, ratios, material events, and insider activity
            — directly from SEC filings. No adjustments.
          </p>

          {/* Search */}
          <TickerSearch />
        </div>

        {/* ── Data pillars ── */}
        <div
          className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px mb-24"
          style={{ background: "var(--border-subtle)" }}
        >
          {[
            { label: "10-K Annual", sub: "Income · Balance · Cash Flow" },
            { label: "10-Q Quarterly", sub: "Revenue & income trends" },
            { label: "8-K Events", sub: "Material disclosures" },
            { label: "Form 4", sub: "Insider transactions" },
          ].map(({ label, sub }) => (
            <div
              key={label}
              className="px-5 py-4"
              style={{ background: "var(--surface)" }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--ink-secondary)" }}
              >
                {label}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--ink-tertiary)" }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div
          className="py-8 text-center"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            For educational and informational purposes only. Does not constitute
            financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
