import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { Params } from "next/dist/server/request/params";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const params = await context.params;
    const ticker = (params.ticker as string) || "";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no configurada en las variables de entorno" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { stockData } = body;

    if (!stockData) {
      return NextResponse.json(
        { error: "No se proporcionaron datos del stock" },
        { status: 400 }
      );
    }

    // Construir el prompt con toda la información disponible
    const prompt = buildAnalysisPrompt(ticker, stockData);

    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a senior professional financial analyst with over 20 years of experience in fundamental stock analysis.

CRITICAL: YOU MUST RESPOND ONLY IN ENGLISH. ALL your analysis, conclusions, and recommendations must be written in English.

CURRENT DATE: ${currentDate}

Your job is to analyze real financial data extracted from official SEC reports (10-K, 10-Q, 8-K, Forms 4) and provide:

1. A clear and concise executive summary of the company's financial situation
2. Analysis of key metrics (profitability, liquidity, leverage, efficiency)
3. Trends observed in recent quarters/years
4. Relevant material events and insider activity
5. Your professional analysis highlighting strengths, weaknesses, and potential risks
6. A comprehensive final conclusion with recommendations for additional research

STRICT RULES:
- ONLY analyze the data provided in the context. DO NOT make up information or search for external data.
- BE AWARE of the current date (${currentDate}). If the most recent data is from several months or years ago, EXPLICITLY mention this gap.
- When data is outdated, acknowledge the limitation and provide cautious observations about what the current situation MIGHT be based on historical trends, but make it clear this is speculative.
- If important recent data is missing, state clearly: "The most recent data available is from [date], which is [X months/years] old. Current conditions may differ significantly."
- Be specific with numbers and percentages from the actual data provided.
- Maintain a professional but accessible tone.
- DO NOT provide buy, sell, or hold recommendations. This is for legal compliance.
- DO NOT give personalized financial advice. Make it clear this is educational analysis only.
- Focus on objective financial analysis and let readers make their own investment decisions.

REQUIRED FINAL SECTION:
ALWAYS end your analysis with a section titled "## Final Conclusion & Research Recommendations" that includes:
- A comprehensive summary of your key findings
- **Specific data points and metrics that are NOT available in SEC filings** but would be crucial for a complete analysis (e.g., market sentiment, competitive positioning, product pipeline, customer satisfaction, industry trends, macroeconomic factors, analyst consensus, short interest, options activity, etc.)
- **Clear guidance on what to look for** when researching these additional data points
- **Key considerations and red flags** to watch for in the supplementary research
- Emphasis that this analysis is based solely on SEC data and should be complemented with broader research

CRITICAL MARKDOWN FORMATTING RULES:
- Use proper markdown headers: ## for main sections, ### for subsections
- ALWAYS add TWO blank lines before each ## header
- ALWAYS add ONE blank line after each header
- ALWAYS add ONE blank line between paragraphs
- ALWAYS add ONE blank line before and after lists
- Use **bold** for emphasis on key numbers and important points
- Structure your response with clear sections and proper spacing for readability.

EXAMPLE FORMAT:
## Section Title

Paragraph text here with important **key metrics**.

Another paragraph with more analysis.

- List item one
- List item two
- List item three

Concluding paragraph.


## Next Section Title

Continue with next section...`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const analysis = completion.choices[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json(
        { error: "No se pudo generar el análisis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis,
      ticker: ticker.toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en análisis de IA:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: `Error de OpenAI: ${error.message}`,
          details: error.type,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor al generar análisis" },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(ticker: string, stockData: any): string {
  const sections: string[] = [];

  sections.push(`# Análisis de ${ticker.toUpperCase()}\n`);

  // Company Info
  if (stockData.companyName) {
    sections.push(`## Información de la Compañía`);
    sections.push(`- Nombre: ${stockData.companyName}`);
    if (stockData.industry) sections.push(`- Industria: ${stockData.industry}`);
    if (stockData.description)
      sections.push(`- Descripción: ${stockData.description}`);
    sections.push("");
  }

  // Latest Metrics (TTM)
  if (stockData.latestMetrics) {
    sections.push(`## Métricas Más Recientes (TTM)`);
    const m = stockData.latestMetrics;
    if (m.ttmRevenue)
      sections.push(
        `- Revenue TTM: $${(m.ttmRevenue / 1e9).toFixed(2)}B`
      );
    if (m.ttmNetIncome)
      sections.push(
        `- Net Income TTM: $${(m.ttmNetIncome / 1e9).toFixed(2)}B`
      );
    if (m.ttmOperatingIncome)
      sections.push(
        `- Operating Income TTM: $${(m.ttmOperatingIncome / 1e9).toFixed(2)}B`
      );
    if (m.ttmGrossProfit)
      sections.push(
        `- Gross Profit TTM: $${(m.ttmGrossProfit / 1e9).toFixed(2)}B`
      );
    if (m.epsBasic !== undefined)
      sections.push(`- EPS (Basic): $${m.epsBasic.toFixed(2)}`);
    if (m.epsDiluted !== undefined)
      sections.push(`- EPS (Diluted): $${m.epsDiluted.toFixed(2)}`);
    if (m.grossMargin !== undefined)
      sections.push(`- Gross Margin: ${(m.grossMargin * 100).toFixed(2)}%`);
    if (m.operatingMargin !== undefined)
      sections.push(
        `- Operating Margin: ${(m.operatingMargin * 100).toFixed(2)}%`
      );
    if (m.netProfitMargin !== undefined)
      sections.push(
        `- Net Profit Margin: ${(m.netProfitMargin * 100).toFixed(2)}%`
      );
    if (m.roe !== undefined)
      sections.push(`- ROE: ${(m.roe * 100).toFixed(2)}%`);
    if (m.roa !== undefined)
      sections.push(`- ROA: ${(m.roa * 100).toFixed(2)}%`);
    if (m.debtToEquity !== undefined)
      sections.push(`- Debt-to-Equity: ${m.debtToEquity.toFixed(2)}`);
    if (m.currentRatio !== undefined)
      sections.push(`- Current Ratio: ${m.currentRatio.toFixed(2)}`);
    if (m.quickRatio !== undefined)
      sections.push(`- Quick Ratio: ${m.quickRatio.toFixed(2)}`);
    sections.push("");
  }

  // Annual Metrics (10-K)
  if (stockData.metrics) {
    sections.push(`## Estado Financiero Anual (10-K)`);
    sections.push(`Período: ${stockData.periodEndDate || "N/A"}`);
    sections.push(`Filing Date: ${stockData.filingDate || "N/A"}`);
    const m = stockData.metrics;
    if (m.revenue)
      sections.push(`- Revenue: $${(m.revenue / 1e9).toFixed(2)}B`);
    if (m.costOfRevenue)
      sections.push(
        `- Cost of Revenue: $${(m.costOfRevenue / 1e9).toFixed(2)}B`
      );
    if (m.grossProfit)
      sections.push(`- Gross Profit: $${(m.grossProfit / 1e9).toFixed(2)}B`);
    if (m.operatingIncome)
      sections.push(
        `- Operating Income: $${(m.operatingIncome / 1e9).toFixed(2)}B`
      );
    if (m.netIncome)
      sections.push(`- Net Income: $${(m.netIncome / 1e9).toFixed(2)}B`);
    if (m.totalAssets)
      sections.push(`- Total Assets: $${(m.totalAssets / 1e9).toFixed(2)}B`);
    if (m.totalLiabilities)
      sections.push(
        `- Total Liabilities: $${(m.totalLiabilities / 1e9).toFixed(2)}B`
      );
    if (m.equity)
      sections.push(`- Shareholders' Equity: $${(m.equity / 1e9).toFixed(2)}B`);
    if (m.cash)
      sections.push(`- Cash & Equivalents: $${(m.cash / 1e9).toFixed(2)}B`);
    if (m.operatingCashFlow)
      sections.push(
        `- Operating Cash Flow: $${(m.operatingCashFlow / 1e9).toFixed(2)}B`
      );
    if (m.freeCashFlow)
      sections.push(
        `- Free Cash Flow: $${(m.freeCashFlow / 1e9).toFixed(2)}B`
      );
    sections.push("");
  }

  // Quarterly Data
  if (stockData.quarterly) {
    sections.push(`## Datos Trimestrales`);

    if (stockData.quarterly.revenue?.length > 0) {
      sections.push(`\n### Revenue por Trimestre (últimos 8):`);
      stockData.quarterly.revenue.slice(0, 8).forEach((q: any) => {
        sections.push(
          `- ${q.period}: $${(q.value / 1e9).toFixed(2)}B (${q.year})`
        );
      });
    }

    if (stockData.quarterly.netIncome?.length > 0) {
      sections.push(`\n### Net Income por Trimestre (últimos 8):`);
      stockData.quarterly.netIncome.slice(0, 8).forEach((q: any) => {
        sections.push(
          `- ${q.period}: $${(q.value / 1e9).toFixed(2)}B (${q.year})`
        );
      });
    }

    if (stockData.quarterly.operatingIncome?.length > 0) {
      sections.push(`\n### Operating Income por Trimestre (últimos 8):`);
      stockData.quarterly.operatingIncome.slice(0, 8).forEach((q: any) => {
        sections.push(
          `- ${q.period}: $${(q.value / 1e9).toFixed(2)}B (${q.year})`
        );
      });
    }

    if (stockData.quarterly.eps?.length > 0) {
      sections.push(`\n### EPS por Trimestre (últimos 8):`);
      stockData.quarterly.eps.slice(0, 8).forEach((q: any) => {
        sections.push(`- ${q.period}: $${q.value.toFixed(2)} (${q.year})`);
      });
    }

    sections.push("");
  }

  // Historical Annual Data
  if (stockData.historicalAnnual?.length > 0) {
    sections.push(`## Datos Históricos Anuales (últimos 5 años)`);
    stockData.historicalAnnual.slice(0, 5).forEach((year: any) => {
      sections.push(`\n### Año ${year.fiscalYear}:`);
      if (year.revenue)
        sections.push(`- Revenue: $${(year.revenue / 1e9).toFixed(2)}B`);
      if (year.netIncome)
        sections.push(`- Net Income: $${(year.netIncome / 1e9).toFixed(2)}B`);
      if (year.totalAssets)
        sections.push(
          `- Total Assets: $${(year.totalAssets / 1e9).toFixed(2)}B`
        );
      if (year.equity)
        sections.push(`- Equity: $${(year.equity / 1e9).toFixed(2)}B`);
    });
    sections.push("");
  }

  // Material Events
  if (stockData.materialEvents?.length > 0) {
    sections.push(`## Eventos Materiales Recientes (8-K)`);
    sections.push(
      `Se han reportado ${stockData.materialEvents.length} eventos materiales en los últimos 12 meses.`
    );
    sections.push(
      `Tipos de eventos: ${[...new Set(stockData.materialEvents.map((e: any) => e.items).flat())].join(", ")}`
    );
    sections.push("");
  }

  // Insider Activity
  if (stockData.insiderActivity?.length > 0) {
    sections.push(`## Actividad de Insiders (Forms 4)`);
    sections.push(
      `Se han registrado ${stockData.insiderActivity.length} transacciones de insiders recientemente.`
    );

    const purchases = stockData.insiderActivity.filter(
      (t: any) => t.transactionType === "P"
    ).length;
    const sales = stockData.insiderActivity.filter(
      (t: any) => t.transactionType === "S"
    ).length;

    sections.push(`- Compras: ${purchases}`);
    sections.push(`- Ventas: ${sales}`);

    const totalValue = stockData.insiderActivity.reduce(
      (sum: number, t: any) => sum + (t.value || 0),
      0
    );
    if (totalValue > 0) {
      sections.push(
        `- Valor total transado: $${(totalValue / 1e6).toFixed(2)}M`
      );
    }
    sections.push("");
  }

  sections.push(`\n---\n`);
  sections.push(
    `Analiza toda esta información y proporciona tu evaluación profesional como inversionista experimentado.`
  );

  return sections.join("\n");
}
