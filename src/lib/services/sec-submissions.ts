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
  items: string;
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
        items: recent.items[i] || "",
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
    "1.03": { description: "Bankruptcy or Receivership", importance: "high" },
    "1.04": { description: "Mine Safety Disclosure", importance: "low" },
    "2.01": {
      description: "Completion of Acquisition or Disposition",
      importance: "high",
    },
    "2.02": {
      description: "Results of Operations and Financial Condition",
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
    "2.05": {
      description: "Costs Associated with Exit or Disposal",
      importance: "medium",
    },
    "2.06": { description: "Material Impairments", importance: "high" },
    "3.01": {
      description: "Notice of Delisting or Failure to Satisfy Listing Rule",
      importance: "high",
    },
    "3.02": {
      description: "Unregistered Sales of Equity Securities",
      importance: "medium",
    },
    "3.03": {
      description: "Material Modification to Rights of Security Holders",
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
    "5.03": {
      description: "Amendments to Articles of Incorporation or Bylaws",
      importance: "low",
    },
    "5.04": {
      description: "Temporary Suspension of Trading",
      importance: "high",
    },
    "5.05": {
      description: "Amendments to Registrant's Code of Ethics",
      importance: "low",
    },
    "5.06": {
      description: "Change in Shell Company Status",
      importance: "medium",
    },
    "5.07": {
      description: "Submission of Matters to Vote of Security Holders",
      importance: "low",
    },
    "5.08": {
      description: "Shareholder Director Nominations",
      importance: "low",
    },
    "6.01": {
      description: "ABS Informational and Computational Material",
      importance: "low",
    },
    "6.02": {
      description: "Change of Servicer or Trustee",
      importance: "medium",
    },
    "6.03": {
      description: "Change in Credit Enhancement",
      importance: "medium",
    },
    "7.01": { description: "Regulation FD Disclosure", importance: "medium" },
    "8.01": { description: "Other Events", importance: "low" },
    "9.01": {
      description: "Financial Statements and Exhibits",
      importance: "low",
    },
  };

  if (!items) return [];

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

/**
 * Get recent Forms 4 filings (insider trading)
 */
export async function getRecentForms4(
  cik: string,
  limit: number = 20
): Promise<SECSubmission[]> {
  const submissions = await getSECSubmissions(cik);
  const recent = submissions.filings.recent;

  const filings: SECSubmission[] = [];

  for (let i = 0; i < recent.form.length && filings.length < limit; i++) {
    if (recent.form[i] === "4") {
      filings.push({
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate[i],
        acceptanceDateTime: recent.acceptanceDateTime[i],
        form: recent.form[i],
        fileNumber: recent.fileNumber[i],
        filmNumber: recent.filmNumber[i],
        items: recent.items[i] || "",
        size: recent.size[i],
        primaryDocument: recent.primaryDocument[i],
        primaryDocDescription: recent.primaryDocDescription[i],
      });
    }
  }

  return filings;
}
