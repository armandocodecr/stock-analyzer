# 🛠️ Guía de Implementación - Mejoras SEC EDGAR

Esta guía contiene ejemplos de código concretos para implementar las mejoras prioritarias identificadas en el análisis.

---

## 📅 QUICK WIN #1: Agregar Fecha del Último Filing

**Tiempo estimado:** 15 minutos  
**Impacto:** Alto - Los usuarios sabrán qué tan actuales son los datos

### Cambios en `lib/services/sec.ts`

```typescript
// En la función getLatestAnnualValue, también retornar la fecha
function getLatestAnnualValueWithDate(
  facts: SECCompanyFacts,
  fieldName: string,
  unit: "USD" | "shares" = "USD"
): {
  value: number | undefined;
  filedDate: string | undefined;
  endDate: string | undefined;
} {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field)
    return { value: undefined, filedDate: undefined, endDate: undefined };

  const values = field.units?.[unit];
  if (!values || values.length === 0)
    return { value: undefined, filedDate: undefined, endDate: undefined };

  const annualReports = values.filter((v) => v.form === "10-K");
  if (annualReports.length === 0) {
    return {
      value: values[0]?.val,
      filedDate: values[0]?.filed,
      endDate: values[0]?.end,
    };
  }

  return {
    value: annualReports[0]?.val,
    filedDate: annualReports[0]?.filed, // ✅ NUEVO
    endDate: annualReports[0]?.end, // ✅ NUEVO
  };
}

// En extractSECMetrics, agregar:
export async function extractSECMetrics(ticker: string) {
  // ... código existente ...

  const revenueData = getLatestAnnualValueWithDate(facts, "Revenues");

  return {
    // ... métricas existentes ...

    // ✅ NUEVO: Metadatos de filing
    filingDate: revenueData.filedDate, // Cuándo se presentó
    periodEndDate: revenueData.endDate, // Período que cubre
    fiscalYear: annualReports[0]?.fy, // Año fiscal
  };
}
```

### Cambios en `types/stock.ts`

```typescript
export interface StockData {
  symbol: string;
  name: string;
  cik: string;
  sector?: string;
  filingDate?: string; // Ya existe
  periodEndDate?: string; // ✅ NUEVO
  fiscalYear?: number; // ✅ NUEVO

  metrics: {
    // ... existente ...
  };
}
```

### Cambios en `components/stock/CompanyOverview.tsx`

```typescript
export default function CompanyOverview({ data }: CompanyOverviewProps) {
  // Calcular antigüedad del dato
  const daysOld = data.filingDate
    ? Math.floor(
        (Date.now() - new Date(data.filingDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* ... código existente ... */}

      {/* ✅ NUEVO: Mostrar fecha de filing */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.filingDate && (
          <div>
            <p className="text-sm text-gray-500">Last Filing</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(data.filingDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">({daysOld} days ago)</p>
          </div>
        )}

        {data.periodEndDate && (
          <div>
            <p className="text-sm text-gray-500">Period Ending</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(data.periodEndDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {data.fiscalYear && (
          <div>
            <p className="text-sm text-gray-500">Fiscal Year</p>
            <p className="text-lg font-semibold text-gray-900">
              FY {data.fiscalYear}
            </p>
          </div>
        )}
      </div>

      {/* ✅ NUEVO: Warning si los datos son muy antiguos */}
      {daysOld && daysOld > 180 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Data may be outdated.</strong> Last filing was {daysOld}{" "}
            days ago.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 QUICK WIN #2: Datos Trimestrales (10-Q)

**Tiempo estimado:** 2-3 horas  
**Impacto:** Crítico - Datos actualizados trimestralmente

### Nuevo archivo: `lib/services/sec-quarterly.ts`

```typescript
import { SECCompanyFacts } from "./sec";

/**
 * Get quarterly data from 10-Q filings
 */
export function getQuarterlyValues(
  facts: SECCompanyFacts,
  fieldName: string,
  quarters: number = 4, // Últimos 4 trimestres
  unit: "USD" | "shares" = "USD"
): Array<{
  value: number;
  quarter: string; // "Q1", "Q2", "Q3", "Q4"
  fiscalYear: number;
  endDate: string;
  filedDate: string;
}> {
  const field = facts.facts["us-gaap"]?.[fieldName];
  if (!field) return [];

  const values = field.units?.[unit];
  if (!values || values.length === 0) return [];

  // Filtrar solo 10-Q (reportes trimestrales)
  const quarterlyReports = values
    .filter((v) => v.form === "10-Q")
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
    .slice(0, quarters)
    .map((v) => ({
      value: v.val,
      quarter: v.fp, // "Q1", "Q2", "Q3"
      fiscalYear: v.fy,
      endDate: v.end,
      filedDate: v.filed,
    }));

  return quarterlyReports;
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
  const revenueQuarterly = getQuarterlyValues(facts, "Revenues");
  const netIncomeQuarterly = getQuarterlyValues(facts, "NetIncomeLoss");

  const revenueQoQ = calculateQoQGrowth(revenueQuarterly);
  const netIncomeQoQ = calculateQoQGrowth(netIncomeQuarterly);

  return {
    // Último trimestre
    latestQuarter: revenueQuarterly[0]?.quarter,
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
```

### Actualizar `lib/services/sec.ts`

```typescript
import { getQuarterlyMetrics } from "./sec-quarterly";

export async function extractSECMetrics(ticker: string) {
  try {
    const cik = await getCIKFromTicker(ticker);
    const facts = await getSECCompanyFacts(cik);

    // ... código existente para datos anuales ...

    // ✅ NUEVO: Obtener datos trimestrales
    const quarterlyData = await getQuarterlyMetrics(facts);

    return {
      // ... métricas anuales existentes ...

      // ✅ NUEVO: Datos trimestrales
      quarterly: quarterlyData,
    };
  } catch (error) {
    console.error("Error extracting SEC metrics:", error);
    return null;
  }
}
```

### Actualizar `types/stock.ts`

```typescript
export interface StockData {
  symbol: string;
  name: string;
  cik: string;

  metrics: {
    // ... existente ...
  };

  // ✅ NUEVO: Datos trimestrales
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
}
```

### Nuevo componente: `components/stock/QuarterlyTrends.tsx`

```typescript
"use client";

import { StockData } from "@/types/stock";
import { formatLargeNumber, formatPercentage } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

interface QuarterlyTrendsProps {
  data: StockData;
}

export default function QuarterlyTrends({ data }: QuarterlyTrendsProps) {
  if (!data.quarterly) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <p className="text-gray-500">No quarterly data available</p>
      </div>
    );
  }

  const { quarterly } = data;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Quarterly Trends (10-Q Filings)
      </h2>

      {/* Latest Quarter Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-600 font-semibold">Latest Quarter</p>
        <p className="text-2xl font-bold text-blue-900">
          {quarterly.latestQuarter}
        </p>
        <p className="text-xs text-blue-700">
          Filed:{" "}
          {new Date(quarterly.latestQuarterFiledDate).toLocaleDateString()}
        </p>
      </div>

      {/* QoQ Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Revenue Growth (QoQ)</p>
          <div className="flex items-center gap-2">
            {quarterly.revenueQoQ !== undefined && quarterly.revenueQoQ > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                quarterly.revenueQoQ !== undefined && quarterly.revenueQoQ > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(quarterly.revenueQoQ)}
            </p>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Net Income Growth (QoQ)</p>
          <div className="flex items-center gap-2">
            {quarterly.netIncomeQoQ !== undefined &&
            quarterly.netIncomeQoQ > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <p
              className={`text-2xl font-bold ${
                quarterly.netIncomeQoQ !== undefined &&
                quarterly.netIncomeQoQ > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(quarterly.netIncomeQoQ)}
            </p>
          </div>
        </div>
      </div>

      {/* Quarterly Revenue Table */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          Revenue by Quarter
        </h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4 text-sm text-gray-600">
                Quarter
              </th>
              <th className="text-right py-2 px-4 text-sm text-gray-600">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {quarterly.quarterlyRevenue.map((q, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-2 px-4 text-sm text-gray-700">{q.quarter}</td>
                <td className="py-2 px-4 text-sm font-semibold text-gray-900 text-right">
                  {formatLargeNumber(q.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🔍 QUICK WIN #3: Búsqueda Dinámica de Tickers

**Tiempo estimado:** 1 hora  
**Impacto:** Alto - Soportar cualquier empresa pública de EE.UU.

### Nuevo archivo: `lib/services/sec-ticker-lookup.ts`

```typescript
import { cache } from "../utils/cache";

interface TickerMapping {
  cik_str: number;
  ticker: string;
  title: string;
}

/**
 * Fetch complete ticker to CIK mapping from SEC
 * This file contains ALL public companies (~13,000 tickers)
 */
export async function fetchTickerMappings(): Promise<
  Record<string, TickerMapping>
> {
  const cacheKey = "sec_ticker_mappings";
  const cached = cache.get<Record<string, TickerMapping>>(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    "https://www.sec.gov/files/company_tickers.json",
    {
      headers: {
        "User-Agent": "Stock-Analyzer-App armando.cr.murillo@gmail.com",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch ticker mappings from SEC");
  }

  const data = await response.json();

  // Cache for 7 days (this data rarely changes)
  cache.set(cacheKey, data, 7 * 24 * 60 * 60 * 1000);

  return data;
}

/**
 * Search for a ticker and return CIK
 */
export async function searchTickerCIK(ticker: string): Promise<string | null> {
  const mappings = await fetchTickerMappings();
  const normalizedTicker = ticker.toUpperCase().trim();

  // Search through all mappings
  for (const key in mappings) {
    const mapping = mappings[key];
    if (mapping.ticker === normalizedTicker) {
      // Pad CIK to 10 digits with leading zeros
      return mapping.cik_str.toString().padStart(10, "0");
    }
  }

  return null;
}

/**
 * Search tickers by company name
 */
export async function searchCompaniesByName(
  query: string,
  limit: number = 10
): Promise<Array<{ ticker: string; name: string; cik: string }>> {
  const mappings = await fetchTickerMappings();
  const normalizedQuery = query.toLowerCase();

  const results: Array<{ ticker: string; name: string; cik: string }> = [];

  for (const key in mappings) {
    const mapping = mappings[key];
    if (
      mapping.title.toLowerCase().includes(normalizedQuery) ||
      mapping.ticker.toLowerCase().includes(normalizedQuery)
    ) {
      results.push({
        ticker: mapping.ticker,
        name: mapping.title,
        cik: mapping.cik_str.toString().padStart(10, "0"),
      });

      if (results.length >= limit) break;
    }
  }

  return results;
}
```

### Actualizar `lib/services/sec.ts`

```typescript
import { searchTickerCIK } from "./sec-ticker-lookup";

export async function getCIKFromTicker(ticker: string): Promise<string> {
  const normalizedTicker = ticker.toUpperCase().trim();

  // Check local cache first (for most popular tickers)
  if (TICKER_TO_CIK_MAP[normalizedTicker]) {
    return TICKER_TO_CIK_MAP[normalizedTicker];
  }

  // Check cache
  const cacheKey = `sec_cik_${normalizedTicker}`;
  const cached = cache.get<string>(cacheKey);
  if (cached) {
    return cached;
  }

  // ✅ NUEVO: Búsqueda dinámica en SEC
  const cik = await searchTickerCIK(normalizedTicker);

  if (!cik) {
    throw new Error(
      `Ticker ${normalizedTicker} not found in SEC database. It may not be a US public company.`
    );
  }

  // Cache for 30 days
  cache.set(cacheKey, cik, 30 * 24 * 60 * 60 * 1000);

  return cik;
}
```

### Mejorar `components/search/TickerSearch.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchCompaniesByName } from "@/lib/services/sec-ticker-lookup";

export default function TickerSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ ticker: string; name: string; cik: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ✅ NUEVO: Autocompletado con búsqueda dinámica
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchCompaniesByName(value, 10);
      setSuggestions(results);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (ticker: string) => {
    router.push(`/stock/${ticker}`);
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search ticker or company name..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ✅ NUEVO: Dropdown de sugerencias */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.cik}
              onClick={() => handleSelect(item.ticker)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <p className="font-semibold text-gray-900">{item.ticker}</p>
              <p className="text-sm text-gray-600 truncate">{item.name}</p>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📰 FASE 2: Eventos Materiales (8-K)

**Tiempo estimado:** 3-4 días  
**Impacto:** Crítico - Detectar eventos que mueven el precio

### Nuevo archivo: `lib/services/sec-submissions.ts`

```typescript
import { cache } from "../utils/cache";

const SEC_BASE_URL = "https://data.sec.gov";
const USER_AGENT = "Stock-Analyzer-App armando.cr.murillo@gmail.com";

export interface SECSubmission {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string; // For 8-K, this contains the item numbers
  size: number;
  primaryDocument: string;
  primaryDocDescription: string;
}

export interface SECSubmissionsResponse {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      acceptanceDateTime: string[];
      act: string[];
      form: string[];
      fileNumber: string[];
      filmNumber: string[];
      items: string[];
      size: number[];
      isXBRL: number[];
      isInlineXBRL: number[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

/**
 * Fetch all submissions for a company
 */
export async function getSECSubmissions(
  cik: string
): Promise<SECSubmissionsResponse> {
  const cacheKey = `sec_submissions_${cik}`;
  const cached = cache.get<SECSubmissionsResponse>(cacheKey);

  if (cached) {
    return cached;
  }

  const url = `${SEC_BASE_URL}/submissions/CIK${cik}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch submissions: ${response.statusText}`);
  }

  const data = await response.json();

  // Cache for 1 hour (submissions update frequently)
  cache.set(cacheKey, data, 60 * 60 * 1000);

  return data;
}

/**
 * Get recent 8-K filings (material events)
 */
export async function getRecent8KFilings(
  cik: string,
  limit: number = 10
): Promise<SECSubmission[]> {
  const submissions = await getSECSubmissions(cik);
  const recent = submissions.filings.recent;

  const filings: SECSubmission[] = [];

  for (let i = 0; i < recent.form.length && filings.length < limit; i++) {
    if (recent.form[i] === "8-K") {
      filings.push({
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
        acceptanceDateTime: recent.acceptanceDateTime[i],
        form: recent.form[i],
        fileNumber: recent.fileNumber[i],
        filmNumber: recent.filmNumber[i],
        items: recent.items[i],
        size: recent.size[i],
        primaryDocument: recent.primaryDocument[i],
        primaryDocDescription: recent.primaryDocDescription[i],
      });
    }
  }

  return filings;
}

/**
 * Parse 8-K items to human-readable events
 */
export function parse8KItems(items: string): Array<{
  code: string;
  description: string;
  importance: "high" | "medium" | "low";
}> {
  const itemMap: Record<
    string,
    { description: string; importance: "high" | "medium" | "low" }
  > = {
    "1.01": {
      description: "Entry into Material Agreement",
      importance: "high",
    },
    "1.02": {
      description: "Termination of Material Agreement",
      importance: "high",
    },
    "2.01": { description: "Completion of Acquisition", importance: "high" },
    "2.02": {
      description: "Results of Operations (Earnings)",
      importance: "high",
    },
    "2.03": {
      description: "Creation of Direct Financial Obligation",
      importance: "medium",
    },
    "2.04": {
      description: "Triggering Events - Acceleration of Obligations",
      importance: "high",
    },
    "3.01": { description: "Notice of Delisting", importance: "high" },
    "3.02": {
      description: "Unregistered Sales of Equity Securities",
      importance: "medium",
    },
    "4.01": {
      description: "Changes in Registrant's Certifying Accountant",
      importance: "high",
    },
    "4.02": {
      description: "Non-Reliance on Previously Issued Financial Statements",
      importance: "high",
    },
    "5.01": {
      description: "Changes in Control of Registrant",
      importance: "high",
    },
    "5.02": {
      description: "Departure/Election of Directors or Officers",
      importance: "high",
    },
    "5.03": { description: "Amendments to Articles/Bylaws", importance: "low" },
    "5.07": { description: "Submission of Matters to Vote", importance: "low" },
    "7.01": { description: "Regulation FD Disclosure", importance: "medium" },
    "8.01": { description: "Other Events", importance: "low" },
    "9.01": {
      description: "Financial Statements and Exhibits",
      importance: "low",
    },
  };

  const itemCodes = items.split(",").map((i) => i.trim());
  return itemCodes
    .map((code) => ({
      code,
      description: itemMap[code]?.description || "Unknown Event",
      importance: itemMap[code]?.importance || "low",
    }))
    .filter((item) => item.description !== "Unknown Event");
}

/**
 * Build URL to view filing on SEC website
 */
export function buildFilingURL(cik: string, accessionNumber: string): string {
  const accnNoHyphens = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accessionNumber}&xbrl_type=v`;
}
```

### Nuevo componente: `components/stock/MaterialEvents.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { StockData } from "@/types/stock";
import {
  getRecent8KFilings,
  parse8KItems,
  buildFilingURL,
  SECSubmission,
} from "@/lib/services/sec-submissions";
import { AlertCircle, ExternalLink } from "lucide-react";

interface MaterialEventsProps {
  data: StockData;
}

export default function MaterialEvents({ data }: MaterialEventsProps) {
  const [filings, setFilings] = useState<SECSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getRecent8KFilings(data.cik, 10);
        setFilings(events);
      } catch (error) {
        console.error("Error fetching 8-K filings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [data.cik]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <p className="text-gray-500">Loading material events...</p>
      </div>
    );
  }

  if (filings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Material Events (8-K Filings)
        </h2>
        <p className="text-gray-500">No recent 8-K filings found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        Material Events (8-K Filings)
      </h2>

      <div className="space-y-4">
        {filings.map((filing) => {
          const events = parse8KItems(filing.items);
          const hasHighImportance = events.some((e) => e.importance === "high");

          return (
            <div
              key={filing.accessionNumber}
              className={`p-4 border rounded-lg ${
                hasHighImportance
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(filing.filingDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Report Date:{" "}
                    {new Date(filing.reportDate).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={buildFilingURL(data.cik, filing.accessionNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                >
                  View Filing
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-1">
                {events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        event.importance === "high"
                          ? "bg-red-200 text-red-800"
                          : event.importance === "medium"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Item {event.code}
                    </span>
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 📝 Resumen de Archivos a Crear/Modificar

### ✅ Quick Win #1 (Fechas)

- Modificar: `lib/services/sec.ts`
- Modificar: `types/stock.ts`
- Modificar: `components/stock/CompanyOverview.tsx`

### ✅ Quick Win #2 (Datos Trimestrales)

- Crear: `lib/services/sec-quarterly.ts`
- Modificar: `lib/services/sec.ts`
- Modificar: `types/stock.ts`
- Crear: `components/stock/QuarterlyTrends.tsx`

### ✅ Quick Win #3 (Búsqueda Dinámica)

- Crear: `lib/services/sec-ticker-lookup.ts`
- Modificar: `lib/services/sec.ts`
- Modificar: `components/search/TickerSearch.tsx`

### ✅ Fase 2 (Eventos 8-K)

- Crear: `lib/services/sec-submissions.ts`
- Crear: `components/stock/MaterialEvents.tsx`

---

## 🚀 Orden de Implementación Recomendado

1. **Día 1:** Quick Win #1 (Fechas) - 15 min
2. **Día 1-2:** Quick Win #3 (Búsqueda) - 1-2 horas
3. **Día 2-3:** Quick Win #2 (Trimestrales) - 2-3 horas
4. **Día 4-7:** Fase 2 (Eventos 8-K) - 3-4 días

**Total:** ~1 semana para transformar la app significativamente.
