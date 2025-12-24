# Finnhub Free Tier Limitaciones y Alternativas

## Problema: Error 403 en Datos Históricos

### Descripción del Error

Al intentar obtener datos históricos (gráfico de precios) de Finnhub, puedes encontrar un error **403 Forbidden**:

```json
{
  "error": "Failed to fetch historical data",
  "message": "API error: 403 Forbidden"
}
```

### Causa

El endpoint `/stock/candle` de Finnhub tiene **limitaciones significativas en el tier gratuito**:

1. **Solo US Stocks**: El tier gratuito principalmente soporta acciones estadounidenses
2. **Historial Limitado**: Algunos tickers tienen acceso reducido a datos históricos
3. **Requiere Premium**: Datos históricos completos requieren suscripción premium

Según la documentación de Finnhub, un error 403 significa: _"the data is not part of your access and will require a subscription"_.

## ✅ Solución Implementada

He actualizado el código para:

1. **Detectar el error 403** y mostrar un mensaje claro
2. **Mostrar sugerencias** de soluciones alternativas
3. **Continuar funcionando** - el resto de la app (precio actual, métricas, noticias) sigue funcionando correctamente

### Mensaje Mejorado

Ahora cuando ocurre este error, verás:

```
⚠️ No se pudo cargar el gráfico

Historical data requires Finnhub premium subscription.
The free tier has limited access to historical stock data.

💡 Soluciones:
• Actualiza a Finnhub Premium para datos históricos completos
• O usa una API alternativa como Alpha Vantage o Yahoo Finance
• Ver el precio actual y métricas (disponibles en free tier)
```

## 🔄 Alternativas para Datos Históricos

### Opción 1: Actualizar a Finnhub Premium

**Precio**: Desde $49/mes  
**Beneficios**:

- Datos históricos completos (hasta 30 años)
- Mercados internacionales
- Más llamadas por minuto

[Ver planes de Finnhub](https://finnhub.io/pricing)

### Opción 2: Usar Alpha Vantage (RECOMENDADO)

**Tier Gratuito**: 25 llamadas por día  
**Datos Históricos**: ✅ Sí, incluidos en free tier

#### Implementación:

```typescript
// lib/services/alphavantage.ts
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

export async function getHistoricalData(ticker: string, range: TimeRange) {
  // TIME_SERIES_DAILY endpoint - disponible en free tier
  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${ALPHA_VANTAGE_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  // Transform to chart format...
  return transformedData;
}
```

**Obtener API key**: [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)

### Opción 3: Yahoo Finance (via proxy/library)

**Tier Gratuito**: Sí (no oficial)  
**Datos Históricos**: ✅ Completos

#### Usando Yahoo Finance API (no oficial):

```bash
npm install yahoo-finance2
```

```typescript
// lib/services/yahoo.ts
import yahooFinance from "yahoo-finance2";

export async function getHistoricalData(ticker: string, range: TimeRange) {
  const queryOptions = {
    period1: getStartDate(range),
    period2: new Date(),
  };

  const result = await yahooFinance.historical(ticker, queryOptions);
  return result;
}
```

**Nota**: Yahoo Finance no tiene API oficial, pero `yahoo-finance2` es confiable.

### Opción 4: Polygon.io

**Tier Gratuito**: Limitado pero funcional  
**Datos Históricos**: ✅ 2 años de historia gratis  
**Llamadas**: 5 llamadas/minuto gratis

[Polygon.io Pricing](https://polygon.io/pricing)

## 📊 Comparación de Alternativas

| API               | Free Tier | Históricos    | Llamadas/día | Mejor para               |
| ----------------- | --------- | ------------- | ------------ | ------------------------ |
| **Finnhub**       | ✅        | ❌ (limitado) | ~1440        | Precio actual + métricas |
| **Alpha Vantage** | ✅        | ✅            | 25-500       | Datos históricos simples |
| **Yahoo Finance** | ✅        | ✅            | Ilimitado\*  | Todo (no oficial)        |
| **Polygon.io**    | ✅        | ✅ (2 años)   | ~7200        | Datos profesionales      |

_\* No oficial, puede cambiar_

## 🛠️ Implementación Recomendada

### Estrategia Híbrida (Mejor opción)

Mantener Finnhub para datos en tiempo real y agregar Alpha Vantage para históricos:

```typescript
// En getCandleData, intentar primero Finnhub,
// si falla con 403, usar Alpha Vantage como fallback

export async function getCandleData(ticker: string, range: TimeRange) {
  try {
    // Intentar con Finnhub primero
    return await getCandleDataFromFinnhub(ticker, range);
  } catch (error) {
    if (error.message.includes("403")) {
      // Fallback a Alpha Vantage
      console.log("Falling back to Alpha Vantage for historical data");
      return await getCandleDataFromAlphaVantage(ticker, range);
    }
    throw error;
  }
}
```

### Variables de Entorno

Actualizar `.env.local`:

```env
# Finnhub - para precios y métricas en tiempo real
FINNHUB_API_KEY=tu_finnhub_key

# Alpha Vantage - para datos históricos
ALPHA_VANTAGE_API_KEY=tu_alphavantage_key
```

## 📝 Estado Actual

**Lo que funciona perfectamente** (con Finnhub Free):

- ✅ Búsqueda de tickers
- ✅ Información de empresa (nombre, sector, logo)
- ✅ Precio en tiempo real y variación diaria
- ✅ Métricas fundamentales (P/E, ROE, márgenes, etc.)
- ✅ Valoración DCF
- ✅ Información de dividendos
- ✅ Noticias financieras

**Lo que tiene limitaciones**:

- ⚠️ Gráfico de precios históricos (requiere premium o API alternativa)

## 🚀 Próximos Pasos

Si deseas implementar la solución híbrida con Alpha Vantage:

1. **Obtén tu API key de Alpha Vantage**: [Registro gratuito](https://www.alphavantage.co/support/#api-key)

2. **Agrégala a `.env.local`**:

   ```env
   ALPHA_VANTAGE_API_KEY=tu_key_aqui
   ```

3. **Avísame** y puedo implementar el servicio de Alpha Vantage con fallback automático

## 📚 Referencias

- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Finnhub Pricing](https://finnhub.io/pricing)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Yahoo Finance2 Library](https://github.com/gadicc/node-yahoo-finance2)
- [Polygon.io Docs](https://polygon.io/docs/stocks)

---

**Actualizado**: 2025-12-05  
**Estado**: Error documentado y manejado correctamente
