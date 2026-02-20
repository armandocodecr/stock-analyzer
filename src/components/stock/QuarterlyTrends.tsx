"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
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

interface QuarterlyTrendsProps {
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

export default function QuarterlyTrends({ data }: QuarterlyTrendsProps) {
  if (!data.quarterly) {
    return (
      <div
        className="rounded-lg p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-default)",
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--ink-secondary)" }}
        >
          Quarterly Trends
        </h2>
        <p className="text-xs mt-3" style={{ color: "var(--ink-tertiary)" }}>
          No quarterly data available.
        </p>
      </div>
    );
  }

  const { quarterly } = data;
  const revenuePositive =
    quarterly.revenueQoQ !== undefined && quarterly.revenueQoQ > 0;
  const netIncomePositive =
    quarterly.netIncomeQoQ !== undefined && quarterly.netIncomeQoQ > 0;

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
          Quarterly Trends
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--ink-tertiary)" }}
        >
          10-Q Filings
        </span>
      </div>

      {/* Latest quarter + QoQ */}
      <div
        className="px-4 py-3 grid grid-cols-3 gap-4"
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
            Latest Quarter
          </p>
          <p
            className="text-sm font-mono font-semibold mt-0.5"
            style={{ color: "var(--ink-primary)" }}
          >
            {quarterly.latestQuarter}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>
            Filed{" "}
            {new Date(quarterly.latestQuarterFiledDate).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            )}
          </p>
        </div>

        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Revenue QoQ
          </p>
          <p
            className="text-sm font-mono font-semibold mt-0.5 flex items-center gap-1"
            style={{
              color: revenuePositive
                ? "var(--positive-text)"
                : "var(--negative-text)",
            }}
          >
            {revenuePositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {formatPercentage(quarterly.revenueQoQ)}
          </p>
        </div>

        <div>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--ink-tertiary)" }}
          >
            Net Income QoQ
          </p>
          <p
            className="text-sm font-mono font-semibold mt-0.5 flex items-center gap-1"
            style={{
              color: netIncomePositive
                ? "var(--positive-text)"
                : "var(--negative-text)",
            }}
          >
            {netIncomePositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {formatPercentage(quarterly.netIncomeQoQ)}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* Revenue chart + table */}
        {quarterly.quarterlyRevenue.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Revenue by Quarter
            </p>
            <div
              className="rounded mb-4 p-4"
              style={{ background: "var(--surface-inset)" }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={[...quarterly.quarterlyRevenue]
                    .sort(
                      (a, b) =>
                        new Date(a.endDate).getTime() -
                        new Date(b.endDate).getTime()
                    )
                    .map((q) => ({ quarter: q.quarter, value: q.value }))}
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="quarter"
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
                    name="Revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={1.5}
                    dot={{ fill: "var(--chart-1)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <th
                    className="text-left py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Quarter
                  </th>
                  <th
                    className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {quarterly.quarterlyRevenue.map((q, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td
                      className="py-2.5 px-4 text-xs font-mono"
                      style={{ color: "var(--ink-secondary)" }}
                    >
                      {q.quarter}
                    </td>
                    <td
                      className="py-2.5 px-4 text-xs font-mono tabular-nums text-right font-semibold"
                      style={{ color: "var(--ink-primary)" }}
                    >
                      {formatLargeNumber(q.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Net Income chart + table */}
        {quarterly.quarterlyNetIncome.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--ink-tertiary)" }}
            >
              Net Income by Quarter
            </p>
            <div
              className="rounded mb-4 p-4"
              style={{ background: "var(--surface-inset)" }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={[...quarterly.quarterlyNetIncome]
                    .sort(
                      (a, b) =>
                        new Date(a.endDate).getTime() -
                        new Date(b.endDate).getTime()
                    )
                    .map((q) => ({ quarter: q.quarter, value: q.value }))}
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="quarter"
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
                    name="Net Income"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    dot={{ fill: "var(--chart-2)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <th
                    className="text-left py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Quarter
                  </th>
                  <th
                    className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Net Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {quarterly.quarterlyNetIncome.map((q, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td
                      className="py-2.5 px-4 text-xs font-mono"
                      style={{ color: "var(--ink-secondary)" }}
                    >
                      {q.quarter}
                    </td>
                    <td
                      className="py-2.5 px-4 text-xs font-mono tabular-nums text-right font-semibold"
                      style={{
                        color:
                          q.value >= 0
                            ? "var(--positive-text)"
                            : "var(--negative-text)",
                      }}
                    >
                      {formatLargeNumber(q.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
