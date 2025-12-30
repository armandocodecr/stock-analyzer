/**
 * SEC EDGAR API Service
 * Official US Government data source for public company financials
 *
 * Features:
 * - 100% Free, no API key required
 * - Direct from securities filings (10-K, 10-Q)
 * - Complete historical data since 1994
 * - Real-time updates as companies file
 *
 * Documentation: https://www.sec.gov/edgar/sec-api-documentation
 */

import { cache } from "../utils/cache";
import { searchTickerCIK } from "./sec-ticker-lookup";
import { getQuarterlyMetrics } from "./sec-quarterly";
import { getSECSubmissions } from "./sec-submissions";

const SEC_BASE_URL = "https://data.sec.gov";
const USER_AGENT = "Stock-Analyzer-App armando.cr.murillo@gmail.com"; // Required by SEC

// Common ticker to CIK mappings (most popular stocks)
const TICKER_TO_CIK_MAP: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOGL: "0001652044",
  GOOG: "0001652044",
  AMZN: "0001018724",
  NVDA: "0001045810",
  META: "0001326801",
  TSLA: "0001318605",
  "BRK.B": "0001067983",
  "BRK.A": "0001067983",
  V: "0001403161",
  JPM: "0000019617",
  WMT: "0000104169",
  MA: "0001141391",
  PG: "0000080424",
  JNJ: "0000200406",
  HD: "0000354950",
  BAC: "0000070858",
  DIS: "0001744489",
  NFLX: "0001065280",
  CSCO: "0000858877",
  INTC: "0000050863",
  PEP: "0000077476",
  KO: "0000021344",
  NKE: "0000320187",
};

// SEC Company Facts Response Structure
export interface SECCompanyFacts {
  cik: string;
  entityName: string;
  facts: {
    "us-gaap": {
      [key: string]: {
        label: string;
        description: string;
        units: {
          USD?: Array<{
            end: string;
            val: number;
            accn: string;
            fy: number;
            fp: string;
            form: string;
            filed: string;
          }>;
          shares?: Array<{
            end: string;
            val: number;
            accn: string;
            fy: number;
            fp: string;
            form: string;
            filed: string;
          }>;
        };
      };
    };
  };
}

/**
 * Fetch with required SEC headers
 */
async function fetchFromSEC<T>(endpoint: string): Promise<T> {
  const url = `${SEC_BASE_URL}${endpoint}`;
  
  console.log("[SEC] Fetching from URL:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    console.log("[SEC] Response status:", response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("SEC API access denied. Check User-Agent header.");
      } else if (response.status === 404) {
        throw new Error("Company not found in SEC database.");
      } else {
        throw new Error(
          `SEC API error: ${response.status} ${response.statusText}`
        );
      }
    }

    const data = await response.json();
    console.log("[SEC] Data received successfully");
    return data;
  } catch (error) {
    console.error("[SEC] Fetch error:", error);
    throw error;
  }
}

/**
 * Get CIK from ticker symbol
 * Uses local cache for common tickers, falls back to SEC ticker lookup
 */
export async function getCIKFromTicker(ticker: string): Promise<string> {
  const normalizedTicker = ticker.toUpperCase().trim();

  if (TICKER_TO_CIK_MAP[normalizedTicker]) {
    return TICKER_TO_CIK_MAP[normalizedTicker];
  }

  const cacheKey = `sec_cik_${normalizedTicker}`;
  const cached = cache.get<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const cik = await searchTickerCIK(normalizedTicker);

  if (!cik) {
    throw new Error(
      `Ticker ${normalizedTicker} not found in SEC database. It may not be a US public company.`
    );
  }

  cache.set(cacheKey, cik, 30 * 24 * 60 * 60 * 1000);

  return cik;
}

/**
 * Get Company Facts from SEC
 * Returns all financial data from filings
 */
export async function getSECCompanyFacts(
  cik: string
): Promise<SECCompanyFacts> {
  const cacheKey = `sec_facts_${cik}`;
  const cached = cache.get<SECCompanyFacts>(cacheKey);

  if (cached) {
    return cached;
  }

  const facts = await fetchFromSEC<SECCompanyFacts>(
    `/api/xbrl/companyfacts/CIK${cik}.json`
  );

  cache.set(cacheKey, facts, 24 * 60 * 60 * 1000);

  return facts;
}

/**
 * Get latest annual (10-K) value for a metric
 */
function getLatestAnnualValue(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): number | undefined {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return undefined;

  const values = field.units?.[unit];
  if (!values || values.length === 0) return undefined;

  // Filter for annual reports (10-K) with full fiscal year (FY) only
  const annualReports = values
    .filter((v) => v.form === "10-K" && v.fp === "FY")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  
  if (annualReports.length === 0) {
    return undefined; // Don't use fallback - we only want 10-K data
  }

  // Return most recent
  return annualReports[0]?.val;
}

/**
 * Get the most recent value from ANY report (10-K or 10-Q)
 * Used for Balance Sheet items which are point-in-time snapshots
 */
function getLatestQuarterlyValue(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): number | undefined {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return undefined;

  const values = field.units?.[unit];
  if (!values || values.length === 0) return undefined;

  // Filter for 10-Q and 10-K reports and sort by end date descending
  const reports = values
    .filter((v) => v.form === "10-Q" || v.form === "10-K")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  
  if (reports.length === 0) {
    return undefined;
  }

  // Return most recent (could be quarterly or annual)
  const result = reports[0]?.val;

  return result;
}

/**
 * Calculate TTM (Trailing Twelve Months) value for Income Statement items.
 *
 * IMPORTANT: SEC 10-Q reports are typically CUMULATIVE year-to-date (YTD), not single-quarter.
 * For example, Q2 10-Q usually contains 6M (Q1+Q2), Q3 contains 9M (Q1+Q2+Q3).
 *
 * To compute true TTM for a latest 10-Q period (e.g., FY2025 Q3), we use:
 *   TTM = currentYTD + (priorFY - priorYTD)
 *
 * Where priorYTD is the YTD value from the prior fiscal year for the same fiscal period (same fp).
 * If required inputs aren't available, we fall back to latest FY 10-K.
 */
function getTTMValue(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): number | undefined {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return undefined;

  const values = field.units?.[unit];
  if (!values || values.length === 0) return undefined;

  const annualReports = values
    .filter((v) => v.form === "10-K" && v.fp === "FY")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());

  const latestAnnual = annualReports[0];

  const quarterlyReports = values
    .filter((v) => v.form === "10-Q")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());

  const latestQuarterly = quarterlyReports[0];

  // If we don't have a 10-K FY value, we cannot compute TTM safely.
  if (!latestAnnual) {
    return undefined;
  }

  // If the latest available report is the 10-K itself (or no newer 10-Q), use it.
  if (!latestQuarterly) {
    return latestAnnual.val;
  }

  const latestQuarterlyEnd = new Date(latestQuarterly.end).getTime();
  const latestAnnualEnd = new Date(latestAnnual.end).getTime();

  // Latest report is not newer than the annual FY data -> 10-K already represents trailing 12M.
  if (latestQuarterlyEnd <= latestAnnualEnd) {
    return latestAnnual.val;
  }

  // Compute true TTM at the latest 10-Q end date using YTD arithmetic.
  const currentYTD = latestQuarterly.val;
  const currentFY = latestQuarterly.fy;
  const currentFP = latestQuarterly.fp;

  // We only support Q1/Q2/Q3 YTD reconstruction. If fp is missing/unexpected, fall back.
  if (!currentFY || !currentFP || !["Q1", "Q2", "Q3"].includes(currentFP)) {
    return latestAnnual.val;
  }

  const priorFYAnnual = annualReports.find((v) => v.fy === currentFY - 1);
  if (!priorFYAnnual) {
    return latestAnnual.val;
  }

  const priorYTD = quarterlyReports.find(
    (v) => v.fy === currentFY - 1 && v.fp === currentFP
  );
  if (!priorYTD) {
    return latestAnnual.val;
  }

  return currentYTD + (priorFYAnnual.val - priorYTD.val);
}

type SECUnitValue = {
  end: string;
  val: number;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
};

function getTTMValueFromFields(
  facts: SECCompanyFacts,
  fieldNames: string[],
  unit: "USD" | "shares" = "USD"
): number | undefined {
  const combined: SECUnitValue[] = [];

  for (const fieldName of fieldNames) {
    const field = facts.facts["us-gaap"]?.[fieldName];
    const values = field?.units?.[unit];
    if (!values || values.length === 0) continue;
    combined.push(...(values as SECUnitValue[]));
  }

  if (combined.length === 0) return undefined;

  // Deduplicate by the most stable identifiers we have.
  const deduped = Array.from(
    new Map(
      combined.map((v) => [`${v.accn}|${v.form}|${v.fp}|${v.fy}|${v.end}`, v] as const)
    ).values()
  );

  // Reuse the same logic as getTTMValue by working against a synthetic facts object.
  const syntheticFacts: SECCompanyFacts = {
    cik: facts.cik,
    entityName: facts.entityName,
    facts: {
      "us-gaap": {
        __combined__: {
          label: "combined",
          description: "combined",
          units: {
            [unit]: deduped,
          } as SECCompanyFacts["facts"]["us-gaap"][string]["units"],
        },
      },
    },
  };

  return getTTMValue(syntheticFacts, "__combined__", unit);
}

/**
 * Get the most recent quarterly value from 10-Q reports ONLY
 * Used for Income Statement items when we want last quarter data only (not TTM)
 */
function getLatestQuarterValue(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): number | undefined {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return undefined;

  const values = field.units?.[unit];
  if (!values || values.length === 0) return undefined;

  // Filter for 10-Q reports ONLY and sort by end date descending
  const quarterlyReports = values
    .filter((v) => v.form === "10-Q")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  
  if (quarterlyReports.length === 0) {
    return undefined;
  }

  // Return most recent quarter
  return quarterlyReports[0]?.val;
}


/**
 * Get latest annual value WITH filing dates
 */
function getLatestAnnualValueWithDate(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): {
  value: number | undefined;
  filedDate: string | undefined;
  endDate: string | undefined;
  fiscalYear: number | undefined;
} {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field)
    return {
      value: undefined,
      filedDate: undefined,
      endDate: undefined,
      fiscalYear: undefined,
    };

  const values = field.units?.[unit];
  if (!values || values.length === 0)
    return {
      value: undefined,
      filedDate: undefined,
      endDate: undefined,
      fiscalYear: undefined,
    };

  // Filter for annual reports (10-K) with full fiscal year only and sort by end date descending
  const annualReports = values
    .filter((v) => v.form === "10-K" && v.fp === "FY")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
    
  if (annualReports.length === 0) {
    return {
      value: undefined,
      filedDate: undefined,
      endDate: undefined,
      fiscalYear: undefined,
    };
  }

  return {
    value: annualReports[0]?.val,
    filedDate: annualReports[0]?.filed,
    endDate: annualReports[0]?.end,
    fiscalYear: annualReports[0]?.fy,
  };
}

function getLatestAnnualValueWithDateFromFields(
  facts: SECCompanyFacts,
  fieldNames: string[],
  unit: "USD" | "shares" = "USD"
): {
  value: number | undefined;
  filedDate: string | undefined;
  endDate: string | undefined;
  fiscalYear: number | undefined;
} {
  let best:
    | {
        value: number | undefined;
        filedDate: string | undefined;
        endDate: string | undefined;
        fiscalYear: number | undefined;
      }
    | undefined;

  for (const fieldName of fieldNames) {
    const candidate = getLatestAnnualValueWithDate(facts, fieldName, unit);
    if (candidate.value === undefined || !candidate.endDate) continue;

    if (!best || !best.endDate) {
      best = candidate;
      continue;
    }

    if (new Date(candidate.endDate).getTime() > new Date(best.endDate).getTime()) {
      best = candidate;
    }
  }

  return (
    best ?? {
      value: undefined,
      filedDate: undefined,
      endDate: undefined,
      fiscalYear: undefined,
    }
  );
}

/**
 * Get historical values for growth calculation
 */
function getHistoricalAnnualValues(
  facts: SECCompanyFacts,
  fieldName: string,
  years: number = 5,
  unit: "USD" | "shares" = "USD"
): number[] {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return [];

  const values = field.units?.[unit];
  if (!values || values.length === 0) return [];

  // Filter for annual reports (10-K) and sort by end date descending
  const annualReports = values
    .filter((v) => v.form === "10-K")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, years)
    .map((v) => v.val);

  return annualReports;
}

/**
 * Get historical annual values with full details (for tables)
 */
function getHistoricalAnnualValuesDetailed(
  facts: SECCompanyFacts,
  fieldName: string,
  years: number = 5,
  unit: "USD" | "shares" = "USD"
): Array<{
  fiscalYear: number;
  value: number;
  endDate: string;
  filedDate: string;
}> {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return [];

  const values = field.units?.[unit];
  if (!values || values.length === 0) return [];

  // Filter for annual reports (10-K) and sort by end date descending
  const annualReports = values
    .filter((v) => v.form === "10-K")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, years)
    .map((v) => ({
      fiscalYear: v.fy,
      value: v.val,
      endDate: v.end,
      filedDate: v.filed,
    }));

  return annualReports;
}

/**
 * Calculate CAGR from historical values
 */
function calculateCAGR(values: number[]): number | undefined {
  if (values.length < 2) return undefined;

  const newest = values[0];
  const oldest = values[values.length - 1];
  const years = values.length - 1;

  if (oldest <= 0 || newest <= 0) return undefined;

  const cagr = (Math.pow(newest / oldest, 1 / years) - 1) * 100;
  return cagr;
}

/**
 * Extract comprehensive financial metrics from SEC Company Facts
 */
export async function extractSECMetrics(ticker: string) {
  try {
    const cik = await getCIKFromTicker(ticker);
    const facts = await getSECCompanyFacts(cik);
    
    const submissions = await getSECSubmissions(cik);
    const primaryExchange = submissions.exchanges?.[0] || "NASDAQ";

    const revenueData = getLatestAnnualValueWithDateFromFields(facts, [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
    ]);

    const revenue = revenueData.value;

    const netIncome = getLatestAnnualValue(facts, "NetIncomeLoss");
    const totalAssets = getLatestAnnualValue(facts, "Assets");
    const totalLiabilities = getLatestAnnualValue(facts, "Liabilities");
    const stockholdersEquity = getLatestAnnualValue(
      facts,
      "StockholdersEquity"
    );

    const longTermDebt =
      getLatestAnnualValue(facts, "LongTermDebtNoncurrent") ||
      getLatestAnnualValue(facts, "LongTermDebt");
    const shortTermDebt =
      getLatestAnnualValue(facts, "LongTermDebtCurrent") ||
      getLatestAnnualValue(facts, "ShortTermBorrowings") ||
      getLatestAnnualValue(facts, "DebtCurrent");
    const cash =
      getLatestAnnualValue(facts, "CashAndCashEquivalentsAtCarryingValue") ||
      getLatestAnnualValue(facts, "Cash");

    const operatingCashFlow = getLatestAnnualValue(
      facts,
      "NetCashProvidedByUsedInOperatingActivities"
    );
    const capex = Math.abs(
      getLatestAnnualValue(
        facts,
        "PaymentsToAcquirePropertyPlantAndEquipment"
      ) || 0
    );

    const costOfRevenue =
      getLatestAnnualValue(facts, "CostOfRevenue") ||
      getLatestAnnualValue(facts, "CostOfGoodsAndServicesSold");
    const operatingIncome = getLatestAnnualValue(facts, "OperatingIncomeLoss");
    const ebitda = getLatestAnnualValue(
      facts,
      "EarningsBeforeInterestTaxesDepreciationAndAmortization"
    );
    const interestExpense = getLatestAnnualValue(facts, "InterestExpense");

    const currentAssets = getLatestAnnualValue(facts, "AssetsCurrent");
    const currentLiabilities = getLatestAnnualValue(
      facts,
      "LiabilitiesCurrent"
    );
    const inventory = getLatestAnnualValue(facts, "InventoryNet");
    const accountsReceivable = getLatestAnnualValue(
      facts,
      "AccountsReceivableNetCurrent"
    );
    const accountsPayable = getLatestAnnualValue(
      facts,
      "AccountsPayableCurrent"
    );
    const propertyPlantEquipment = getLatestAnnualValue(
      facts,
      "PropertyPlantAndEquipmentNet"
    );

    const investingCashFlow = getLatestAnnualValue(
      facts,
      "NetCashProvidedByUsedInInvestingActivities"
    );
    const financingCashFlow = getLatestAnnualValue(
      facts,
      "NetCashProvidedByUsedInFinancingActivities"
    );
    const dividendsPaid = Math.abs(
      getLatestAnnualValue(facts, "PaymentsOfDividends") || 0
    );
    const stockRepurchases = Math.abs(
      getLatestAnnualValue(facts, "PaymentsForRepurchaseOfCommonStock") || 0
    );

    const grossProfit = getLatestAnnualValue(facts, "GrossProfit");
    const operatingExpenses = getLatestAnnualValue(facts, "OperatingExpenses");
    const rdExpense = getLatestAnnualValue(
      facts,
      "ResearchAndDevelopmentExpense"
    );
    const sgaExpense = getLatestAnnualValue(
      facts,
      "SellingGeneralAndAdministrativeExpense"
    );
    const incomeTaxExpense = getLatestAnnualValue(
      facts,
      "IncomeTaxExpenseBenefit"
    );
    const depreciationAmortization = getLatestAnnualValue(
      facts,
      "DepreciationDepletionAndAmortization"
    );

    const sharesOutstanding =
      getLatestAnnualValue(facts, "CommonStockSharesOutstanding", "shares") ||
      getLatestAnnualValue(facts, "CommonStockSharesIssued", "shares");

    const revenueHistory =
      getHistoricalAnnualValues(facts, "Revenues") ||
      getHistoricalAnnualValues(
        facts,
        "RevenueFromContractWithCustomerExcludingAssessedTax"
      );
    const netIncomeHistory = getHistoricalAnnualValues(facts, "NetIncomeLoss");

    const historicalRevenue =
      getHistoricalAnnualValuesDetailed(facts, "Revenues", 5).length > 0
        ? getHistoricalAnnualValuesDetailed(facts, "Revenues", 5)
        : getHistoricalAnnualValuesDetailed(
            facts,
            "RevenueFromContractWithCustomerExcludingAssessedTax",
            5
          );

    const historicalNetIncome = getHistoricalAnnualValuesDetailed(
      facts,
      "NetIncomeLoss",
      5
    );

    const historicalTotalAssets = getHistoricalAnnualValuesDetailed(
      facts,
      "Assets",
      5
    );

    const historicalStockholdersEquity = getHistoricalAnnualValuesDetailed(
      facts,
      "StockholdersEquity",
      5
    );

    const historicalOperatingCashFlow = getHistoricalAnnualValuesDetailed(
      facts,
      "NetCashProvidedByUsedInOperatingActivities",
      5
    );

    const historicalFreeCashFlow = historicalOperatingCashFlow.map((ocf) => {
      const capexForYear =
        getHistoricalAnnualValuesDetailed(
          facts,
          "PaymentsToAcquirePropertyPlantAndEquipment",
          5
        ).find((c) => c.fiscalYear === ocf.fiscalYear)?.value || 0;

      return {
        fiscalYear: ocf.fiscalYear,
        value: ocf.value - Math.abs(capexForYear),
        endDate: ocf.endDate,
      };
    });

    const quarterlyData = await getQuarterlyMetrics(facts);

    const totalDebt = (longTermDebt || 0) + (shortTermDebt || 0);
    const netDebt = totalDebt - (cash || 0);
    const freeCashFlow = (operatingCashFlow || 0) - (capex || 0);

    const ttmRevenue = getTTMValueFromFields(facts, [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
    ]);
    
    const ttmNetIncome = getTTMValue(facts, "NetIncomeLoss");
    const ttmOperatingIncome = getTTMValue(facts, "OperatingIncomeLoss");
    const ttmGrossProfit = getTTMValue(facts, "GrossProfit");
    const ttmCostOfRevenue = getTTMValueFromFields(facts, [
      "CostOfRevenue",
      "CostOfGoodsAndServicesSold",
    ]);

    const latestTotalAssets = getLatestAnnualValue(facts, "Assets");
    const latestCurrentAssets = getLatestAnnualValue(facts, "AssetsCurrent");
    const latestCurrentLiabilities = getLatestAnnualValue(
      facts,
      "LiabilitiesCurrent"
    );
    const latestCash =
      getLatestAnnualValue(facts, "CashAndCashEquivalentsAtCarryingValue") ||
      getLatestAnnualValue(facts, "Cash");
    const latestInventory = getLatestAnnualValue(facts, "InventoryNet");
    const latestStockholdersEquity = getLatestAnnualValue(
      facts,
      "StockholdersEquity"
    );
    const latestLongTermDebt =
      getLatestAnnualValue(facts, "LongTermDebtNoncurrent") ||
      getLatestAnnualValue(facts, "LongTermDebt");
    const latestShortTermDebt =
      getLatestAnnualValue(facts, "LongTermDebtCurrent") ||
      getLatestAnnualValue(facts, "ShortTermBorrowings") ||
      getLatestAnnualValue(facts, "DebtCurrent");
    const latestTotalDebt = (latestLongTermDebt || 0) + (latestShortTermDebt || 0);

    return {
      revenue,
      costOfRevenue,
      grossProfit,
      operatingExpenses,
      rdExpense,
      sgaExpense,
      operatingIncome,
      interestExpense,
      incomeTaxExpense,
      depreciationAmortization,
      ebitda,
      netIncome,

      totalAssets,
      currentAssets,
      cash,
      accountsReceivable,
      inventory,
      propertyPlantEquipment,

      totalLiabilities,
      currentLiabilities,
      shortTermDebt,
      longTermDebt,
      accountsPayable,

      stockholdersEquity,

      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      capex,
      freeCashFlow, // Simple calculation: Operating CF - CapEx
      dividendsPaid,
      stockRepurchases,

      totalDebt,
      netDebt,
      sharesOutstanding,

      entityName: facts.entityName,
      cik,
      exchange: primaryExchange,

      filingDate: revenueData.filedDate,
      periodEndDate: revenueData.endDate,
      fiscalYear: revenueData.fiscalYear,

      quarterly: quarterlyData,

      latestMetrics: {
        ttmRevenue,
        ttmNetIncome,
        ttmOperatingIncome,
        ttmGrossProfit,
        ttmCostOfRevenue,

        latestTotalAssets,
        latestCurrentAssets,
        latestCurrentLiabilities,
        latestCash,
        latestInventory,
        latestStockholdersEquity,
        latestLongTermDebt,
        latestShortTermDebt,
        latestTotalDebt,
      },

      historicalAnnual: {
        revenue: historicalRevenue,
        netIncome: historicalNetIncome,
        totalAssets: historicalTotalAssets,
        stockholdersEquity: historicalStockholdersEquity,
        operatingCashFlow: historicalOperatingCashFlow,
        freeCashFlow: historicalFreeCashFlow,
      },
    };
  } catch (error) {
    console.error("Error extracting SEC metrics:", error);
    return null;
  }
}
