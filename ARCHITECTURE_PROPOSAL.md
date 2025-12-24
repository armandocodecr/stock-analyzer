# 🏗️ Arquitectura Propuesta - Stock Analyzer v2.0

Este documento muestra la arquitectura completa después de implementar todas las mejoras.

---

## 📊 Arquitectura Actual (v1.0)

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Next.js App   │
                    │   (Frontend)   │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  API Routes    │
                    │ /api/stock/    │
                    │   [ticker]     │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  SEC Service   │
                    │  (sec.ts)      │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  In-Memory     │
                    │    Cache       │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   SEC EDGAR    │
                    │   XBRL API     │
                    │   (10-K only)  │
                    └────────────────┘

Cobertura: ~30%
Tickers: 25
Actualización: Anual
```

---

## 🚀 Arquitectura Propuesta (v2.0)

```
┌───────────────────────────────────────────────────────────────────────┐
│                            USUARIO                                     │
│  - Búsqueda de ~13,000 tickers                                        │
│  - Datos actualizados trimestralmente                                 │
│  - Eventos en tiempo real                                             │
│  - Señales de insider trading                                         │
└──────────────────────────────┬────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS APP (Frontend)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ TickerSearch │  │ StockDetail  │  │ Comparator   │               │
│  │ (Autocomplete│  │    Page      │  │   (Futuro)   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                        │
│  Components:                                                          │
│  ├─ CompanyOverview (con fechas)                                     │
│  ├─ QuarterlyTrends (10-Q)                                           │
│  ├─ MaterialEvents (8-K)                                             │
│  ├─ InsiderActivity (Forms 4)                                        │
│  ├─ InstitutionalOwnership (13F)                                     │
│  ├─ PriceChart (Finnhub)                                             │
│  └─ ValuationMetrics (P/E, P/B)                                      │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        API ROUTES LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ /api/stock/      │  │ /api/events/     │  │ /api/insiders/   │  │
│  │   [ticker]       │  │   [ticker]       │  │   [ticker]       │  │
│  │ (Fundamentals)   │  │ (8-K filings)    │  │ (Forms 4)        │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ /api/ownership/  │  │ /api/price/      │  │ /api/search/     │  │
│  │   [ticker]       │  │   [ticker]       │  │   [query]        │  │
│  │ (13F holdings)   │  │ (Real-time)      │  │ (Ticker lookup)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ sec.ts           │  │ sec-quarterly.ts │  │ sec-submissions. │  │
│  │ (10-K annual)    │  │ (10-Q quarterly) │  │ ts (8-K events)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ sec-forms4.ts    │  │ sec-13f.ts       │  │ sec-ticker-      │  │
│  │ (Insider trades) │  │ (Institutional)  │  │ lookup.ts        │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                        │
│  ┌──────────────────┐                                                │
│  │ finnhub.ts       │                                                │
│  │ (Market prices)  │                                                │
│  └──────────────────┘                                                │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         CACHE LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      Redis Cache                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ Company Facts│  │ Submissions  │  │ Ticker Map   │         │ │
│  │  │ TTL: 24h     │  │ TTL: 1h      │  │ TTL: 7 days  │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  │                                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ Forms 4      │  │ 13F Holdings │  │ Stock Prices │         │ │
│  │  │ TTL: 1h      │  │ TTL: 24h     │  │ TTL: 1 min   │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DATA SOURCES                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     SEC EDGAR API                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ /companyfacts│  │ /submissions/│  │ company_     │         │ │
│  │  │ (XBRL data)  │  │ (All filings)│  │ tickers.json │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  │                                                                  │ │
│  │  Data Types:                                                    │ │
│  │  ✅ 10-K (Annual reports)                                       │ │
│  │  ✅ 10-Q (Quarterly reports)                                    │ │
│  │  ✅ 8-K (Material events)                                       │ │
│  │  ✅ Forms 3/4/5 (Insider trading)                               │ │
│  │  ✅ 13F (Institutional ownership)                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Finnhub API (Free Tier)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ /quote       │  │ /candle      │  │ /company-    │         │ │
│  │  │ (Real-time)  │  │ (Historical) │  │ profile      │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  │                                                                  │ │
│  │  Rate Limit: 60 req/min (suficiente con cache)                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

Cobertura: ~90%
Tickers: ~13,000
Actualización: Trimestral + Eventos en tiempo real
```

---

## 🔄 Flujo de Datos Completo

### 1️⃣ **Usuario busca un ticker (ej: "AAPL")**

```
Usuario escribe "AAPL" o "Apple"
        ↓
TickerSearch component
        ↓
/api/search/[query]
        ↓
sec-ticker-lookup.ts
        ↓
Fetch company_tickers.json (cached 7 días)
        ↓
Retorna: { ticker: "AAPL", name: "Apple Inc.", cik: "0000320193" }
        ↓
Navega a /stock/AAPL
```

---

### 2️⃣ **Carga de página de stock**

```
/stock/AAPL page loads
        ↓
Parallel fetch de múltiples endpoints:
        ↓
┌───────────────────┬───────────────────┬───────────────────┐
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
/api/stock/AAPL    /api/events/AAPL   /api/insiders/AAPL  /api/price/AAPL
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
sec.ts             sec-submissions.ts  sec-forms4.ts       finnhub.ts
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
Check Redis        Check Redis         Check Redis         Check Redis
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
If miss:           If miss:            If miss:            If miss:
SEC XBRL API       SEC Submissions     SEC Submissions     Finnhub API
(10-K + 10-Q)      (8-K filings)       (Forms 4 XML)       (Quote)
│                   │                   │                   │
▼                   ▼                   ▼                   ▼
Cache 24h          Cache 1h            Cache 1h            Cache 1min
│                   │                   │                   │
└───────────────────┴───────────────────┴───────────────────┘
                            │
                            ▼
                    Render Components:
                    - CompanyOverview
                    - QuarterlyTrends
                    - MaterialEvents
                    - InsiderActivity
                    - PriceChart
                    - ValuationMetrics
```

---

## 📊 Comparativa de Arquitecturas

| Aspecto                | v1.0 (Actual) | v2.0 (Propuesta)                  |
| ---------------------- | ------------- | --------------------------------- |
| **Endpoints API**      | 1             | 6                                 |
| **Servicios**          | 1             | 7                                 |
| **Fuentes de datos**   | 1 (SEC XBRL)  | 2 (SEC + Finnhub)                 |
| **Tipos de filings**   | 1 (10-K)      | 5 (10-K, 10-Q, 8-K, Forms 4, 13F) |
| **Cache**              | In-memory     | Redis                             |
| **Componentes UI**     | 3             | 10                                |
| **Tickers soportados** | 25            | ~13,000                           |
| **Actualización**      | Anual         | Trimestral + Tiempo real          |
| **Complejidad**        | Baja          | Media                             |
| **Mantenibilidad**     | Alta          | Alta                              |
| **Escalabilidad**      | Baja          | Alta                              |

---

## 🗂️ Estructura de Archivos Propuesta

```
stock-analyzer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stock/[ticker]/route.ts          # Fundamentals
│   │   │   ├── events/[ticker]/route.ts         # 8-K events
│   │   │   ├── insiders/[ticker]/route.ts       # Forms 4
│   │   │   ├── ownership/[ticker]/route.ts      # 13F holdings
│   │   │   ├── price/[ticker]/route.ts          # Market prices
│   │   │   └── search/[query]/route.ts          # Ticker search
│   │   ├── stock/[ticker]/page.tsx              # Stock detail page
│   │   └── page.tsx                             # Home page
│   │
│   ├── components/
│   │   ├── search/
│   │   │   └── TickerSearch.tsx                 # ✅ Mejorado
│   │   ├── stock/
│   │   │   ├── CompanyOverview.tsx              # ✅ Mejorado (fechas)
│   │   │   ├── MetricsTabs.tsx                  # ✅ Existente
│   │   │   ├── QuarterlyTrends.tsx              # 🆕 NUEVO
│   │   │   ├── MaterialEvents.tsx               # 🆕 NUEVO
│   │   │   ├── InsiderActivity.tsx              # 🆕 NUEVO
│   │   │   ├── InstitutionalOwnership.tsx       # 🆕 NUEVO
│   │   │   ├── PriceChart.tsx                   # 🆕 NUEVO
│   │   │   └── ValuationMetrics.tsx             # 🆕 NUEVO
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorMessage.tsx
│   │
│   ├── lib/
│   │   ├── services/
│   │   │   ├── sec.ts                           # ✅ Existente (10-K)
│   │   │   ├── sec-quarterly.ts                 # 🆕 NUEVO (10-Q)
│   │   │   ├── sec-submissions.ts               # 🆕 NUEVO (8-K)
│   │   │   ├── sec-forms4.ts                    # 🆕 NUEVO (Insiders)
│   │   │   ├── sec-13f.ts                       # 🆕 NUEVO (Institutional)
│   │   │   ├── sec-ticker-lookup.ts             # 🆕 NUEVO (Search)
│   │   │   └── finnhub.ts                       # 🆕 NUEVO (Prices)
│   │   ├── utils/
│   │   │   ├── cache.ts                         # ✅ Existente
│   │   │   └── formatters.ts                    # ✅ Existente
│   │   └── calculations/
│   │       └── valuation.ts                     # ✅ Mejorado (P/E, P/B)
│   │
│   └── types/
│       └── stock.ts                             # ✅ Mejorado (nuevos tipos)
│
├── .env.local                                   # ✅ Agregar FINNHUB_API_KEY
├── package.json                                 # ✅ Agregar fast-xml-parser
├── README.md                                    # ✅ Actualizado
├── ARCHITECTURE.md                              # ✅ Actualizar
│
└── 📚 Documentación de análisis:
    ├── SEC_DATA_COVERAGE_ANALYSIS.md            # 📊 Análisis completo
    ├── IMPLEMENTATION_GUIDE.md                  # 🛠️ Guía técnica
    ├── ROADMAP.md                               # 🎯 Roadmap 8 semanas
    ├── EXECUTIVE_SUMMARY.md                     # 📋 Resumen ejecutivo
    ├── CHECKLIST.md                             # ✅ Checklist paso a paso
    └── ARCHITECTURE_PROPOSAL.md                 # 🏗️ Este documento
```

---

## 🔧 Dependencias Nuevas

### package.json (agregar)

```json
{
  "dependencies": {
    // ... existentes ...
    "fast-xml-parser": "^4.3.0" // Para parsear Forms 4 XML
  }
}
```

### .env.local (agregar)

```env
# SEC EDGAR - No requiere API key
# User-Agent ya configurado en código

# Finnhub (para precios)
FINNHUB_API_KEY=your_free_api_key_here
```

---

## 🚀 Performance Optimizations

### 1️⃣ **Caching Strategy**

| Tipo de dato          | TTL    | Justificación                             |
| --------------------- | ------ | ----------------------------------------- |
| Company Facts (10-K)  | 24h    | Datos anuales cambian raramente           |
| Quarterly Data (10-Q) | 24h    | Datos trimestrales cambian cada 3 meses   |
| Submissions (8-K)     | 1h     | Eventos nuevos pueden aparecer            |
| Forms 4               | 1h     | Insider trades se reportan frecuentemente |
| 13F Holdings          | 24h    | Holdings trimestrales                     |
| Ticker Mappings       | 7 días | Raramente cambian                         |
| Stock Prices          | 1 min  | Precios cambian constantemente            |

### 2️⃣ **Parallel Data Fetching**

```typescript
// En lugar de secuencial:
const fundamentals = await getFundamentals(ticker);
const events = await getEvents(ticker);
const insiders = await getInsiders(ticker);

// Hacer en paralelo:
const [fundamentals, events, insiders] = await Promise.all([
  getFundamentals(ticker),
  getEvents(ticker),
  getInsiders(ticker),
]);
```

### 3️⃣ **Lazy Loading de Componentes**

```typescript
// Componentes pesados (gráficos) con lazy loading
const PriceChart = dynamic(() => import("@/components/stock/PriceChart"), {
  loading: () => <LoadingSpinner />,
  ssr: false, // No renderizar en servidor
});
```

### 4️⃣ **Redis para Cache Distribuido**

```typescript
// Migrar de in-memory a Redis
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Usar Redis en lugar de Map
await redis.set(cacheKey, data, { ex: ttlSeconds });
const cached = await redis.get(cacheKey);
```

---

## 📈 Escalabilidad

### **Actual (v1.0)**

- ✅ Soporta ~100 usuarios concurrentes
- ✅ In-memory cache (suficiente para MVP)
- ⚠️ No escala horizontalmente

### **Propuesta (v2.0)**

- ✅ Soporta ~10,000 usuarios concurrentes
- ✅ Redis cache (compartido entre instancias)
- ✅ Escala horizontalmente en Vercel
- ✅ CDN para assets estáticos

---

## 🔒 Security

### **API Keys**

- ✅ Finnhub API key en variables de entorno
- ✅ Nunca exponer en frontend
- ✅ Solo accesible desde API routes

### **Rate Limiting**

- ✅ Implementar rate limiting por IP
- ✅ Respetar límites de SEC (10 req/sec)
- ✅ Respetar límites de Finnhub (60 req/min)

### **Input Validation**

- ✅ Validar tickers antes de fetch
- ✅ Sanitizar inputs de búsqueda
- ✅ Validar CIKs

---

## 🎯 Conclusión

Esta arquitectura propuesta transforma tu aplicación de una **herramienta educativa básica** a una **plataforma profesional de análisis fundamental** que puede competir con Yahoo Finance y Finviz.

**Ventajas:**

- ✅ 100% gratis (usando free tiers)
- ✅ Datos oficiales de SEC
- ✅ Escalable y mantenible
- ✅ Performance optimizado
- ✅ Cobertura del 90% de SEC EDGAR

**Tiempo de implementación:** 8 semanas  
**Costo:** $0 (usando Vercel + Upstash free tiers)  
**Resultado:** Herramienta profesional de análisis de acciones

---

**Próximo paso:** Comenzar con Fase 1 (Quick Wins) usando el [CHECKLIST.md](./CHECKLIST.md)
