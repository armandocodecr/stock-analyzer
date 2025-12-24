import { SECCompanyFacts } from "./sec";
import { cache } from "../utils/cache";

/**
 * Get quarterly data from 10-Q filings
 */
type SECPeriodValue = {
  value: number;
  quarter: string; // "Q1", "Q2", "Q3", "Q4"
  fiscalYear: number;
  endDate: string;
  filedDate: string;
};

type SECUnitValue = {
  end: string;
  val: number;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
};

function mergeAndDedupeFieldValues(
  facts: SECCompanyFacts,
  fieldNames: string[],
  unit: "USD" | "shares"
): SECUnitValue[] {
  const combined: SECUnitValue[] = [];

  for (const fieldName of fieldNames) {
    const field = facts.facts["us-gaap"]?.[fieldName];
    const values = field?.units?.[unit];
    if (!values || values.length === 0) continue;
    combined.push(...(values as SECUnitValue[]));
  }

  // Dedupe by period (fy/fp/end) and keep the latest filing.
  const byPeriod = new Map<string, SECUnitValue>();
  for (const v of combined) {
    const key = `${v.fy}|${v.fp}|${v.end}`;
    const existing = byPeriod.get(key);
    if (!existing) {
      byPeriod.set(key, v);
      continue;
    }
    if (new Date(v.filed).getTime() > new Date(existing.filed).getTime()) {
      byPeriod.set(key, v);
    }
  }

  return Array.from(byPeriod.values());
}

/**
 * Build single-quarter values for an Income Statement metric from SEC filings.
 *
 * NOTE: 10-Q values are generally cumulative year-to-date (YTD), not single-quarter.
 * We convert to single-quarter as:
 *  - Q1 = YTD(Q1)
 *  - Q2 = YTD(Q2) - YTD(Q1)
 *  - Q3 = YTD(Q3) - YTD(Q2)
 *  - Q4 = FY(10-K) - YTD(Q3)
 */
export function getQuarterlyValues(
  facts: SECCompanyFacts,
  fieldNames: string[],
  quarters: number = 8,
  unit: "USD" | "shares" = "USD"
): SECPeriodValue[] {
  const values = mergeAndDedupeFieldValues(facts, fieldNames, unit);
  if (values.length === 0) return [];

  const quarterlyReports = values
    .filter((v) => v.form === "10-Q")
    .filter((v) => ["Q1", "Q2", "Q3"].includes(v.fp));

  const annualReports = values
    .filter((v) => v.form === "10-K")
    .filter((v) => v.fp === "FY");

  const byFY = new Map<
    number,
    {
      Q1?: SECUnitValue;
      Q2?: SECUnitValue;
      Q3?: SECUnitValue;
      FY?: SECUnitValue;
    }
  >();

  for (const v of quarterlyReports) {
    const entry = byFY.get(v.fy) ?? {};
    if (v.fp === "Q1") entry.Q1 = v;
    if (v.fp === "Q2") entry.Q2 = v;
    if (v.fp === "Q3") entry.Q3 = v;
    byFY.set(v.fy, entry);
  }

  for (const v of annualReports) {
    const entry = byFY.get(v.fy) ?? {};
    entry.FY = v;
    byFY.set(v.fy, entry);
  }

  const computed: SECPeriodValue[] = [];
  for (const [fy, entry] of byFY.entries()) {
    if (entry.Q1) {
      computed.push({
        fiscalYear: fy,
        quarter: "Q1",
        value: entry.Q1.val,
        endDate: entry.Q1.end,
        filedDate: entry.Q1.filed,
      });
    }

    if (entry.Q2 && entry.Q1) {
      computed.push({
        fiscalYear: fy,
        quarter: "Q2",
        value: entry.Q2.val - entry.Q1.val,
        endDate: entry.Q2.end,
        filedDate: entry.Q2.filed,
      });
    }

    if (entry.Q3 && entry.Q2) {
      computed.push({
        fiscalYear: fy,
        quarter: "Q3",
        value: entry.Q3.val - entry.Q2.val,
        endDate: entry.Q3.end,
        filedDate: entry.Q3.filed,
      });
    }

    if (entry.FY && entry.Q3) {
      computed.push({
        fiscalYear: fy,
        quarter: "Q4",
        value: entry.FY.val - entry.Q3.val,
        endDate: entry.FY.end,
        filedDate: entry.FY.filed,
      });
    }
  }

  return computed
    .filter((q) => Number.isFinite(q.value))
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .slice(0, quarters);
}

/**
 * Calculate Quarter-over-Quarter growth
 */
export function calculateQoQGrowth(
  quarterlyValues: Array<{ value: number }>
): number | undefined {
  if (quarterlyValues.length < 2) return undefined;

  const latest = quarterlyValues[0].value;
  const previous = quarterlyValues[1].value;

  if (previous <= 0) return undefined;

  return ((latest - previous) / previous) * 100;
}

/**
 * Get latest quarterly metrics
 */
export async function getQuarterlyMetrics(facts: SECCompanyFacts) {
  // Revenue tags vary across companies and sometimes across periods (tag changes).
  // Merge them so quarterly series doesn't go stale and doesn't duplicate periods.
  const revenueQuarterly = getQuarterlyValues(facts, [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "SalesRevenueNet",
  ]);

  const netIncomeQuarterly = getQuarterlyValues(facts, [
    "NetIncomeLoss",
    "ProfitLoss",
  ]);

  const revenueQoQ = calculateQoQGrowth(revenueQuarterly);
  const netIncomeQoQ = calculateQoQGrowth(netIncomeQuarterly);

  return {
    // Último trimestre
    latestQuarter: revenueQuarterly[0]
      ? `${revenueQuarterly[0].fiscalYear} ${revenueQuarterly[0].quarter}`
      : "",
    latestQuarterEndDate: revenueQuarterly[0]?.endDate,
    latestQuarterFiledDate: revenueQuarterly[0]?.filedDate,

    // Valores trimestrales
    quarterlyRevenue: revenueQuarterly.map((q) => ({
      quarter: `${q.fiscalYear} ${q.quarter}`,
      value: q.value,
      endDate: q.endDate,
    })),

    quarterlyNetIncome: netIncomeQuarterly.map((q) => ({
      quarter: `${q.fiscalYear} ${q.quarter}`,
      value: q.value,
      endDate: q.endDate,
    })),

    // Crecimiento QoQ
    revenueQoQ,
    netIncomeQoQ,
  };
}
