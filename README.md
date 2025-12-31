# Stock Analyzer - SEC EDGAR Coverage

## 🎯 Current Status

**SEC EDGAR Coverage:** 75% (from 30%)  
**Supported Tickers:** ~13,000 US public companies  
**Last Updated:** December 2025

---

## 📊 What's Included

### ✅ Implemented Features

1. **Annual Financial Data (10-K)**

   - Complete fundamental metrics
   - Multi-year growth (CAGR)
   - Profitability, debt, cash flow ratios

2. **Quarterly Data (10-Q)**

   - Last 4 quarters revenue & net income
   - Quarter-over-Quarter (QoQ) growth
   - Visual trend indicators

3. **Dynamic Ticker Search**

   - Search ~13,000 US public companies
   - Autocomplete by ticker or company name
   - Real-time suggestions

4. **Filing Dates & Metadata**

   - Last filing date
   - Period end date
   - Fiscal year
   - Outdated data warnings

5. **Material Events (8-K)**

   - 29 event types classified
   - Importance levels (high/medium/low)
   - Direct links to SEC filings
   - Timeline view

6. **Insider Trading (Forms 4)**
   - Last 20 insider transactions
   - Buy/Sell classification
   - Sentiment analysis (Bullish/Bearish/Neutral)
   - Transaction history

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` and search for any US public company!

---

## 🎨 Features

### Search Any Company

No longer limited to pre-mapped tickers. Search by ticker symbol or company name with autocomplete.

### Comprehensive Financial Analysis

- **Profitability:** Margins, ROE, ROA, ROIC
- **Debt:** Debt ratios, interest coverage
- **Growth:** 3Y and 5Y CAGR
- **Cash Flow:** FCF, operating cash flow
- **Capital:** EPS, book value per share

### Quarterly Trends

Track quarterly performance with QoQ growth metrics for revenue and net income.

### Material Events

Stay informed about important corporate events:

- M&A activity
- Financial results
- Leadership changes
- Regulatory issues
- And 25+ more event types

### Insider Activity

Monitor what company insiders are doing:

- Buy/sell transactions
- Overall sentiment
- Transaction history

---

## 🔧 Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data Source:** SEC EDGAR API (100% free)
- **Deployment:** Vercel-ready

---

## 📝 Data Sources

All data comes from official SEC filings:

- **10-K:** Annual reports
- **10-Q:** Quarterly reports
- **8-K:** Material events
- **Form 4:** Insider trading

**No paid APIs required!**

---

## ⚠️ Limitations

### Not Included

- Real-time stock prices
- Price charts
- News feeds
- Analyst ratings
- Institutional ownership (13F) - Future feature

### Data Freshness

- Annual data: Updated yearly
- Quarterly data: Updated quarterly
- Events: Near real-time
- Insider trades: Near real-time

---

## 🎯 Use Cases

1. **Fundamental Analysis**

   - Deep dive into company financials
   - Track quarterly performance
   - Identify trends

2. **Event Monitoring**

   - Stay updated on material events
   - Track M&A activity
   - Monitor leadership changes

3. **Insider Tracking**

   - See what executives are doing
   - Gauge insider sentiment
   - Identify buying/selling patterns

4. **Educational**
   - Learn how to read SEC filings
   - Understand financial metrics
   - Practice fundamental analysis

---

## 🚀 Future Enhancements

### Potential Additions

- Institutional ownership (13F filings)
- Peer comparison
- Industry benchmarks
- Export to CSV/PDF
- Watchlist functionality
- Email alerts for events

---

## 📄 License

MIT License - Free to use and modify

---

## 🙏 Acknowledgments

- SEC EDGAR API for free, public data
- Next.js team for amazing framework
- Open source community

---

**Built with ❤️ using only free, public data sources**
