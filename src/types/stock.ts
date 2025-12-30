/**
 * Stock data structure - SEC EDGAR only
 * All data comes from official SEC filings (10-K annual reports and 10-Q quarterly reports)
 */
export interface StockData {
  // Company identification
  symbol: string;
  name: string;
  cik: string;
  exchange?: string; // Stock exchange (NYSE, NASDAQ, etc.)
  sector?: string;
  filingDate?: string;
  periodEndDate?: string;
  fiscalYear?: number;

  // Financial metrics from SEC filings
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
    
    // Liabilities
    totalLiabilities?: number;
    currentLiabilities?: number;
    shortTermDebt?: number;
    longTermDebt?: number;
    accountsPayable?: number;
    
    // Equity
    stockholdersEquity?: number;

    // ===== RAW FINANCIALS - CASH FLOW STATEMENT (from 10-K) =====
    operatingCashFlow?: number; // Cash from operations
    investingCashFlow?: number; // Cash from investing activities
    financingCashFlow?: number; // Cash from financing activities
    capex?: number; // Capital expenditures
    freeCashFlow?: number; // Operating CF - CapEx (simple calculation)
    dividendsPaid?: number; // Dividends paid
    stockRepurchases?: number; // Stock buybacks

    // ===== DEBT (simple additions, not ratios) =====
    totalDebt?: number; // Long-term + Short-term debt
    netDebt?: number; // Total Debt - Cash

    // ===== CAPITAL MANAGEMENT =====
    sharesOutstanding?: number; // Total shares

    // NOTE: All ratios and calculated metrics have been removed
    // Users should calculate ratios themselves from the raw data to ensure accuracy
  };

  // Quarterly data (10-Q)
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

  // Latest metrics for ratio calculations (most recent annual 10-K report)
  // Both Balance Sheet and Income Statement items: from latest 10-K (annual report)
  latestMetrics?: {
    // Annual Income Statement from latest 10-K (12 months)
    ttmRevenue?: number;
    ttmNetIncome?: number;
    ttmOperatingIncome?: number;
    ttmGrossProfit?: number;
    ttmCostOfRevenue?: number;

    // Annual Balance Sheet from latest 10-K (point-in-time snapshot)
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

  // Historical annual data (10-K) - Last 5 years
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
