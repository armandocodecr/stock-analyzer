"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber } from "@/lib/utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HistoricalDataProps {
  data: StockData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2.5 rounded text-xs"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border-strong)",
        }}
      >
        <p
          className="font-mono font-semibold mb-1.5"
          style={{ color: "var(--ink-secondary)" }}
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-mono" style={{ color: entry.color }}>
            {entry.name}: {formatLargeNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const deduplicateByFiscalYear = <
  T extends { fiscalYear: number; endDate: string }
>(
  data: T[]
): T[] => {
  const map = new Map<number, T>();
  data.forEach((item) => {
    const existing = map.get(item.fiscalYear);
    if (!existing || new Date(item.endDate) > new Date(existing.endDate)) {
      map.set(item.fiscalYear, item);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.fiscalYear - b.fiscalYear);
};

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

type MetricSection = {
  title: string;
  data: Array<{ fiscalYear: number; endDate: string; value: number }>;
  chartColor: string;
  chartName: string;
  valueColor?: (v: number) => string;
};

export default function HistoricalData({ data }: HistoricalDataProps) {
  const historical = data.historicalAnnual;
  if (!historical) return null;

  const uniqueRevenue = historical.revenue
    ? deduplicateByFiscalYear(historical.revenue)
    : [];
  const uniqueNetIncome = historical.netIncome
    ? deduplicateByFiscalYear(historical.netIncome)
    : [];
  const uniqueTotalAssets = historical.totalAssets
    ? deduplicateByFiscalYear(historical.totalAssets)
    : [];
  const uniqueOperatingCashFlow = historical.operatingCashFlow
    ? deduplicateByFiscalYear(historical.operatingCashFlow)
    : [];
  const uniqueFreeCashFlow = historical.freeCashFlow
    ? deduplicateByFiscalYear(historical.freeCashFlow)
    : [];

  const sections: MetricSection[] = [
    {
      title: "Revenue (Annual)",
      data: uniqueRevenue,
      chartColor: chartColors[0],
      chartName: "Revenue",
    },
    {
      title: "Net Income (Annual)",
      data: uniqueNetIncome,
      chartColor: chartColors[1],
      chartName: "Net Income",
      valueColor: (v) =>
        v >= 0 ? "var(--positive-text)" : "var(--negative-text)",
    },
    {
      title: "Total Assets (Annual)",
      data: uniqueTotalAssets,
      chartColor: chartColors[2],
      chartName: "Total Assets",
    },
    {
      title: "Operating Cash Flow (Annual)",
      data: uniqueOperatingCashFlow,
      chartColor: chartColors[3],
      chartName: "Operating Cash Flow",
      valueColor: (v) =>
        v >= 0 ? "var(--positive-text)" : "var(--negative-text)",
    },
    {
      title: "Free Cash Flow (Annual)",
      data: uniqueFreeCashFlow,
      chartColor: "var(--chart-1)",
      chartName: "Free Cash Flow",
      valueColor: (v) =>
        v >= 0 ? "var(--positive-text)" : "var(--negative-text)",
    },
  ].filter((s) => s.data.length > 0);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--ink-secondary)" }}
        >
          Historical Annual Data
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          10-K Filings
        </span>
      </div>

      <div className="p-4 space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--ink-tertiary)" }}
            >
              {section.title}
            </p>

            {/* Chart */}
            <div
              className="rounded mb-4 p-4"
              style={{ background: "var(--surface-inset)" }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={section.data.map((item) => ({
                    year: `FY ${item.fiscalYear}`,
                    value: item.value,
                  }))}
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="year"
                    stroke="var(--ink-disabled)"
                    style={{ fontSize: "10px", fontFamily: "monospace" }}
                    tick={{ fill: "var(--ink-tertiary)" }}
                  />
                  <YAxis
                    stroke="var(--ink-disabled)"
                    style={{ fontSize: "10px", fontFamily: "monospace" }}
                    tickFormatter={(v) => formatLargeNumber(v)}
                    tick={{ fill: "var(--ink-tertiary)" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      color: "var(--ink-tertiary)",
                      fontSize: "10px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={section.chartName}
                    stroke={section.chartColor}
                    strokeWidth={1.5}
                    dot={{ fill: section.chartColor, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <th
                    className="text-left py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Fiscal Year
                  </th>
                  <th
                    className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    {section.chartName}
                  </th>
                  <th
                    className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Period End
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...section.data].reverse().map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td
                      className="py-2.5 px-4 text-xs font-mono font-semibold"
                      style={{ color: "var(--ink-secondary)" }}
                    >
                      FY {item.fiscalYear}
                    </td>
                    <td
                      className="py-2.5 px-4 text-xs font-mono tabular-nums text-right font-semibold"
                      style={{
                        color: section.valueColor
                          ? section.valueColor(item.value)
                          : "var(--ink-primary)",
                      }}
                    >
                      {formatLargeNumber(item.value)}
                    </td>
                    <td
                      className="py-2.5 px-4 text-xs font-mono text-right"
                      style={{ color: "var(--ink-tertiary)" }}
                    >
                      {new Date(item.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
