# Stock Analyzer - Arquitectura Técnica

## Visión General

Stock Analyzer es una aplicación web moderna construida con Next.js 15 que utiliza el App Router para proporcionar análisis financiero en tiempo real de empresas cotizadas en bolsa.

## Stack Tecnológico

### Frontend

- **Framework**: Next.js 15.0 con App Router
- **Lenguaje**: TypeScript 5.x
- **Estilos**: TailwindCSS 4.x
- **UI Components**: Custom components + Lucide React icons
- **Charts**: Recharts 2.x
- **Data Fetching**: Native fetch + SWR patterns

### Backend / API

- **Runtime**: Node.js (Next.js API Routes)
- **API Routes**: Next.js Route Handlers
- **External API**: Finnhub.io REST API
- **Caching**: In-memory cache with TTL

## Flujo de Datos

```
[Usuario]
    ↓
[Búsqueda de Ticker]
    ↓
[Navegación a /stock/[ticker]]
    ↓
[Server Component - Inicial Fetch]
    ↓
[API Route: /api/stock/[ticker]] ←→ [Finnhub API]
    ↓                                     ↑
[Cache Layer]                             |
    ↓                                     |
[Data Transformation]                     |
    ↓                                     |
[Render de Componentes]                   |
    ↓                                     |
[Client Components] ────────────────────→ [API Adicional]
  - PriceChart (historical data)
  - NewsFeed (news data)
```

## Arquitectura de Componentes

### Server Components (Default)

- `app/page.tsx` - Home page
- `app/stock/[ticker]/page.tsx` - Stock detail page
- Layout y metadata

**Ventajas:**

- Render en servidor
- SEO optimizado
- Carga inicial rápida
- No aumentan bundle size del cliente

### Client Components

- `TickerSearch` - Interactividad de búsqueda
- `PriceChart` - Gráfico interactivo con Recharts
- `NewsFeed` - Fetch dinámico de noticias
- `ValuationCard` - Estado expandible
- `LoadingSpinner` - Animaciones
- `ErrorMessage` - Estados de error

**Criterio de selección:**

- Necesita `useState`, `useEffect`, `useRouter`
- Requiere event handlers
- Usa librerías que dependen del DOM

## API Routes Architecture

### `/api/stock/[ticker]` (route.ts)

**Propósito**: Endpoint principal que agrega datos de múltiples fuentes

**Flujo:**

1. Recibe ticker como parámetro dinámico
2. Normaliza ticker (uppercase, trim)
3. Hace fetch paralelo de 3 endpoints de Finnhub:
   - Company Profile
   - Real-time Quote
   - Fundamental Metrics
4. Transforma a formato interno (`StockData`)
5. Retorna JSON con caché headers

**Error Handling:**

- 400: Ticker inválido
- 404: Ticker no encontrado
- 429: Rate limit excedido
- 401: API key inválida
- 500: Error genérico

### `/api/stock/[ticker]/history` (history/route.ts)

**Propósito**: Datos históricos para gráficos

**Query Params:**

- `range`: 1M, 3M, 6M, 1Y, 5Y

**Flujo:**

1. Valida query param range
2. Calcula timestamps de inicio/fin
3. Fetch a Finnhub candle endpoint
4. Transforma a formato de gráfico (`ChartDataPoint[]`)
5. Retorna con caché de 15 minutos

### `/api/stock/[ticker]/news` (news/route.ts)

**Propósito**: Noticias recientes de la empresa

**Flujo:**

1. Fetch últimas noticias (último mes)
2. Limita a 10 artículos más recientes
3. Retorna con caché de 5 minutos

## Service Layer

### `lib/services/finnhub.ts`

**Responsabilidades:**

- Encapsula toda la comunicación con Finnhub API
- Maneja autenticación (API key)
- Implementa caching
- Transforma errores HTTP a mensajes amigables

**Funciones principales:**

```typescript
getCompanyProfile(ticker: string): Promise<CompanyProfile>
getStockQuote(ticker: string): Promise<StockQuote>
getMetrics(ticker: string): Promise<MetricData>
getCandleData(ticker: string, range: TimeRange): Promise<CandleData>
getCompanyNews(ticker: string): Promise<NewsArticle[]>
```

**Patrón de implementación:**

1. Check cache
2. Si hay cache válido, retornar
3. Si no, fetch de API
4. Guardar en cache con TTL apropiado
5. Retornar datos

## Caching Strategy

### In-Memory Cache (`lib/utils/cache.ts`)

**Implementación:**

- Map<string, CacheEntry>
- Cada entrada tiene: data, timestamp, ttl

**TTL por tipo:**

```typescript
CACHE_TTL = {
  QUOTE: 1 * 60 * 1000, // 1 min - Precio cambia rápido
  PROFILE: 60 * 60 * 1000, // 1 hora - Info raramente cambia
  METRICS: 24 * 60 * 60 * 1000, // 24 horas - Métricas diarias
  HISTORY: 15 * 60 * 1000, // 15 min - Balance entre actualidad y uso
  NEWS: 5 * 60 * 1000, // 5 min - Noticias relativamente estables
};
```

**Cleanup:**

- Automático cada 10 minutos
- Elimina entradas expiradas

**Ventajas:**

- Reduce significativamente llamadas a API
- Mejora performance
- Respeta rate limits (60 req/min Finnhub free tier)

**Limitaciones:**

- Se resetea al reiniciar servidor
- No compartido entre instancias
- Para producción escalable se recomienda Redis

## Business Logic Layer

### `lib/calculations/valuation.ts`

**DCF Model:**

```
Valor Intrínseco = FCF × (1 + g) / (WACC - g)

Donde:
- FCF: Free Cash Flow per share
- g: Tasa de crecimiento perpetuo
- WACC: Weighted Average Cost of Capital
```

**Validaciones:**

- FCF debe ser > 0.01
- g debe ser < WACC (si g ≥ WACC, el modelo explota)

**Clasificación:**

```typescript
if (precio/valor < 0.8) => "undervalued"
if (0.8 ≤ precio/valor ≤ 1.2) => "fair"
if (precio/valor > 1.2) => "overvalued"
```

**Confianza:**

```typescript
if (FCF > $2) => "high"
if ($0.5 < FCF ≤ $2) => "medium"
if (FCF ≤ $0.5) => "low"
```

### `lib/utils/formatters.ts`

**Utilidades de formateo:**

- `formatCurrency()` - Precios con símbolo de divisa
- `formatLargeNumber()` - Números con K/M/B/T
- `formatPercentage()` - Porcentajes con decimales
- `formatDate()` - Fechas relativas y absolutas
- `normalizeTicker()` - Uppercase, trim
- `isValidTicker()` - Validación con regex

## Type System

### `types/stock.ts`

**Interfaces principales:**

```typescript
// API Responses (Finnhub)
CompanyProfile;
StockQuote;
MetricData;
CandleData;
NewsArticle;

// Internal Data Models
StockData; // Datos agregados para UI
ChartDataPoint; // Punto de gráfico
ValuationResult; // Resultado de DCF

// Utilities
TimeRange; // Union type: '1M' | '3M' | '6M' | '1Y' | '5Y'
APIError; // Error responses
```

**Ventajas:**

- Type safety completo
- Autocompletado en IDE
- Detección temprana de errores
- Documentación implícita

## Security

### API Key Protection

```
✅ API key en .env.local (server-side only)
✅ Nunca expuesta al cliente
✅ Solo accesible desde Route Handlers
❌ NO usar en Client Components
❌ NO incluir en código frontend
```

### Input Validation

```typescript
// Ticker validation
const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;

// Query param validation
const validRanges = ["1M", "3M", "6M", "1Y", "5Y"];
```

### Error Handling

- Errores específicos sin exponer detalles internos
- Logs en servidor para debugging
- Mensajes amigables al usuario

## Performance Optimizations

### 1. Server Components por Defecto

- Render en servidor
- No añaden JS al bundle del cliente
- SEO friendly

### 2. Code Splitting

- Componentes client solo cuando necesario
- Lazy loading implícito de Next.js

### 3. Image Optimization

- Next.js Image component para logos
- Automático WebP conversion
- Lazy loading de imágenes

### 4. Caching Multi-nivel

```
[Browser Cache]
    ↓
[Next.js Edge Cache]
    ↓
[API Route Cache Headers]
    ↓
[In-Memory Cache]
    ↓
[Finnhub API]
```

### 5. Parallel Data Fetching

```typescript
// Fetch múltiples endpoints en paralelo
const [profile, quote, metrics] = await Promise.all([
  getCompanyProfile(ticker),
  getStockQuote(ticker),
  getMetrics(ticker),
]);
```

## Responsive Design

### Breakpoints (TailwindCSS)

- **Mobile**: < 768px (1 columna)
- **Tablet**: 768px - 1024px (2 columnas)
- **Desktop**: > 1024px (3 columnas)

### Layout Adaptativo

```
Desktop (lg:):
┌─────────────────────────┐
│   Company Overview      │
├──────────────┬──────────┤
│   Price      │ Valuation│
│   Metrics    │ Dividend │
├──────────────┴──────────┤
│      Price Chart        │
├─────────────────────────┤
│      News Feed          │
└─────────────────────────┘

Mobile:
┌──────────────┐
│  Company     │
├──────────────┤
│  Price       │
├──────────────┤
│  Valuation   │
├──────────────┤
│  Dividend    │
├──────────────┤
│  Metrics     │
├──────────────┤
│  Chart       │
├──────────────┤
│  News        │
└──────────────┘
```

## Error Handling Strategy

### Niveles de Error

1. **Network Level** (Finnhub API)
   - Timeout
   - Connection failed
   - DNS errors
2. **API Level** (HTTP Status)

   - 401: Invalid API key
   - 404: Resource not found
   - 429: Rate limit
   - 500: Server error

3. **Application Level**

   - Invalid ticker format
   - Missing required data
   - Calculation errors (DCF)

4. **UI Level**
   - Error boundaries
   - Fallback UI
   - User-friendly messages

### Error Recovery

```typescript
try {
  // Fetch data
} catch (error) {
  // 1. Log error for debugging
  console.error("Error:", error);

  // 2. Transform to user-friendly message
  const message = getUserMessage(error);

  // 3. Return appropriate HTTP status
  return NextResponse.json({ error: message }, { status: statusCode });
}
```

## Deployment Considerations

### Environment Variables

```env
# Required
FINNHUB_API_KEY=xxx

# Optional
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Build Output

```
Route (app)
├ ○ /                    # Static
├ ƒ /api/stock/[ticker]  # Dynamic
├ ƒ /stock/[ticker]      # Dynamic
```

### Hosting Options

- **Vercel**: Recomendado (creadores de Next.js)
- **Netlify**: Soporta Next.js
- **AWS Amplify**: Alternativa enterprise
- **Docker**: Para self-hosting

## Monitoring & Analytics (Futuro)

### Métricas a Considerar

- API response times
- Cache hit rate
- Error rates por tipo
- Tickers más consultados
- User session duration

### Tools Sugeridos

- Vercel Analytics
- Sentry (error tracking)
- PostHog (product analytics)
- DataDog (APM)

## Testing Strategy (Futuro)

### Unit Tests

- Formatters utilities
- Valuation calculations
- Cache logic

### Integration Tests

- API routes
- Finnhub service layer

### E2E Tests

- User flows (search → view details)
- Error scenarios
- Responsive behavior

### Tools

- Jest + React Testing Library
- Playwright (E2E)
- MSW (API mocking)

## Extensibility

### Adding New Metrics

1. Update `types/stock.ts` interfaces
2. Modify Finnhub service to fetch new data
3. Add to `StockData` transformation
4. Create/update UI component

### Adding New Data Sources

1. Create new service in `lib/services/`
2. Implement cache strategy
3. Create API route
4. Update components

### Adding New Features

- Watchlist: Requires database + auth
- Alerts: Requires background jobs
- Comparison: Requires multi-ticker fetch
- Historical analysis: Requires more data storage

## Conclusión

La arquitectura de Stock Analyzer está diseñada para ser:

- **Escalable**: Fácil agregar features
- **Mantenible**: Separación clara de responsabilidades
- **Performante**: Múltiples niveles de optimización
- **Type-safe**: TypeScript end-to-end
- **Modern**: Next.js 15 best practices

La aplicación está lista para producción con configuración mínima (API key) y puede servir como base sólida para expandir funcionalidades financieras más avanzadas.
