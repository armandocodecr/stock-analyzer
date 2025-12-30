/**
 * Stock data structure - SEC EDGAR only
 * All data comes from official SEC filings (10-K annual reports and 10-Q quarterly reports)
 */
export interface StockData {
  // Company identification
  symbol: string;
  name: string;
  cik: string;
  exchange?: string;
  sector?: string;
  filingDate?: string;
  periodEndDate?: string;
  fiscalYear?: number;

  metrics: {
    // ===== RAW FINANCIALS - INCOME STATEMENT (from 10-K) =====
    revenue?: number;
    costOfRevenue?: number; // COGS
    grossProfit?: number;
    operatingExpenses?: number;
    rdExpense?: number; // R&D
    sgaExpense?: number; // SG&A
    operatingIncome?: number; // EBIT
    interestExpense?: number;
    incomeTaxExpense?: number;
    depreciationAmortization?: number;
    ebitda?: number;
    netIncome?: number;

    // ===== RAW FINANCIALS - BALANCE SHEET (from 10-K) =====
    // Assets
    totalAssets?: number;
    currentAssets?: number;
    cash?: number;
    accountsReceivable?: number;
    inventory?: number;
    propertyPlantEquipment?: number;
    totalLiabilities?: number;
    currentLiabilities?: number;
    shortTermDebt?: number;
    longTermDebt?: number;
    accountsPayable?: number;
    stockholdersEquity?: number;

    // ===== RAW FINANCIALS - CASH FLOW STATEMENT (from 10-K) =====
    operatingCashFlow?: number;
    investingCashFlow?: number;
    financingCashFlow?: number;
    capex?: number;
    freeCashFlow?: number;
    dividendsPaid?: number;
    stockRepurchases?: number;

    totalDebt?: number;
    netDebt?: number;
    sharesOutstanding?: number;

  };

  quarterly?: {
    latestQuarter: string;
    latestQuarterEndDate: string;
    latestQuarterFiledDate: string;
    quarterlyRevenue: Array<{
      quarter: string;
      value: number;
      endDate: string;
    }>;
    quarterlyNetIncome: Array<{
      quarter: string;
      value: number;
      endDate: string;
    }>;
    revenueQoQ?: number;
    netIncomeQoQ?: number;
  };

  latestMetrics?: {
    ttmRevenue?: number;
    ttmNetIncome?: number;
    ttmOperatingIncome?: number;
    ttmGrossProfit?: number;
    ttmCostOfRevenue?: number;
    latestTotalAssets?: number;
    latestCurrentAssets?: number;
    latestCurrentLiabilities?: number;
    latestCash?: number;
    latestInventory?: number;
    latestStockholdersEquity?: number;
    latestLongTermDebt?: number;
    latestShortTermDebt?: number;
    latestTotalDebt?: number;
  };

  historicalAnnual?: {
    revenue: Array<{ fiscalYear: number; value: number; endDate: string }>;
    netIncome: Array<{ fiscalYear: number; value: number; endDate: string }>;
    totalAssets: Array<{ fiscalYear: number; value: number; endDate: string }>;
    stockholdersEquity: Array<{ fiscalYear: number; value: number; endDate: string }>;
    operatingCashFlow: Array<{ fiscalYear: number; value: number; endDate: string }>;
    freeCashFlow: Array<{ fiscalYear: number; value: number; endDate: string }>;
  };
}

/**
 * API Error Response
 */
export interface APIError {
  error: string;
  message: string;
}
