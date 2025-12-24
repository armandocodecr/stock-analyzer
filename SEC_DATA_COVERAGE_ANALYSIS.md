# 📊 Análisis de Cobertura de Datos SEC EDGAR

**Aplicación:** Stock Analyzer  
**Fuente de datos:** SEC EDGAR API (data.sec.gov)  
**Fecha de análisis:** Diciembre 2024

---

## 📋 Resumen Ejecutivo

Tu aplicación actualmente utiliza **solo datos XBRL de formularios 10-K** (reportes anuales) a través del endpoint `/api/xbrl/companyfacts/`. Esto representa aproximadamente **30-40% del potencial informativo** que la SEC EDGAR puede ofrecer para análisis fundamental serio.

### ✅ Fortalezas Actuales

- Implementación sólida de métricas financieras fundamentales
- Cálculos correctos de ratios derivados (ROIC, Debt/EBITDA, Interest Coverage)
- Datos históricos para cálculo de CAGR (3Y y 5Y)
- 100% gratuito y de fuente oficial

### ⚠️ Gaps Críticos

- **No hay datos trimestrales** (10-Q)
- **No hay eventos materiales** (8-K)
- **No hay actividad de insiders** (Forms 3, 4, 5)
- **No hay ownership institucional** (13F)
- **No hay metadatos de filings** (fechas, períodos, enlaces a documentos)
- **No hay datos cualitativos** (Risk Factors, MD&A)

---

## 1️⃣ Tabla de Cobertura Completa

| Categoría de Datos                | ¿Cubierta? | Importancia | Recomendación                                                  |
| --------------------------------- | ---------- | ----------- | -------------------------------------------------------------- |
| **METADATOS DE FILINGS**          |
| CIK                               | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Ticker                            | ✅ Sí      | Alta        | ⚠️ Solo 25 tickers pre-mapeados. Implementar búsqueda dinámica |
| Nombre legal empresa              | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Tipos de formularios              | 🟡 Parcial | Alta        | ❌ Solo usas 10-K. Agregar 10-Q, 8-K, 13F, Forms 3/4/5         |
| Fechas de presentación            | ❌ No      | Alta        | ❌ Agregar `filed` y `end` dates de cada filing                |
| Períodos reportados               | 🟡 Parcial | Alta        | ⚠️ Solo año fiscal. Agregar trimestres (Q1-Q4)                 |
| Accession Numbers                 | ❌ No      | Media       | Útil para enlazar a documentos completos                       |
| **ESTADOS FINANCIEROS (XBRL)**    |
| Ingresos (Revenue)                | ✅ Sí      | Alta        | ✅ Completo (anual)                                            |
| Utilidad neta                     | ✅ Sí      | Alta        | ✅ Completo (anual)                                            |
| Activos totales                   | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Pasivos totales                   | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Patrimonio                        | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Cash flow operativo               | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Cash flow libre (FCF)             | ✅ Sí      | Alta        | ✅ Calculado correctamente                                     |
| Datos históricos                  | ✅ Sí      | Alta        | ✅ Hasta 5 años para CAGR                                      |
| **Datos trimestrales**            | ❌ No      | **Alta**    | ❌ **CRÍTICO:** Agregar 10-Q para análisis trimestral          |
| **MÉTRICAS DERIVABLES**           |
| Crecimiento YoY/QoQ               | 🟡 Parcial | Alta        | ✅ YoY implementado. ❌ QoQ requiere 10-Q                      |
| Márgenes (bruto, operativo, neto) | ✅ Sí      | Alta        | ✅ Completo                                                    |
| ROE, ROA                          | ✅ Sí      | Alta        | ✅ Completo                                                    |
| ROIC                              | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Debt-to-Equity                    | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Net Debt/EBITDA                   | ✅ Sí      | Alta        | ✅ Completo                                                    |
| Interest Coverage                 | ✅ Sí      | Alta        | ✅ Completo                                                    |
| P/E Ratio                         | ❌ No      | Alta        | Requiere precio de mercado (no en SEC)                         |
| Price/Book                        | ❌ No      | Alta        | Requiere precio de mercado                                     |
| EV/EBITDA                         | ❌ No      | Alta        | Requiere market cap                                            |
| **EVENTOS MATERIALES (8-K)**      |
| Cambios de management             | ❌ No      | **Alta**    | ❌ **CRÍTICO:** Implementar parser de 8-K                      |
| M&A / Adquisiciones               | ❌ No      | **Alta**    | ❌ **CRÍTICO:** Eventos Item 1.01, 2.01                        |
| Cambios financieros               | ❌ No      | Alta        | Financiamiento, deuda, bancarrota                              |
| Litigios materiales               | ❌ No      | Media       | Item 8.01 de 8-K                                               |
| Earnings releases                 | ❌ No      | Alta        | Item 2.02 de 8-K                                               |
| **ACTIVIDAD DE INSIDERS**         |
| Forms 3 (Initial ownership)       | ❌ No      | **Alta**    | ❌ **CRÍTICO:** Señal de confianza/desconfianza                |
| Forms 4 (Transacciones)           | ❌ No      | **Alta**    | ❌ **CRÍTICO:** Compras/ventas de ejecutivos                   |
| Forms 5 (Annual statement)        | ❌ No      | Media       | Complementa Forms 4                                            |
| Identificación de insiders        | ❌ No      | Alta        | Nombres, títulos, relación                                     |
| Monto de transacciones            | ❌ No      | Alta        | Precio, cantidad, fecha                                        |
| **OWNERSHIP INSTITUCIONAL**       |
| 13F Holdings                      | ❌ No      | Alta        | ❌ Qué fondos poseen la acción                                 |
| Cambios trimestre a trimestre     | ❌ No      | Alta        | Instituciones comprando/vendiendo                              |
| Top holders                       | ❌ No      | Media       | Mayores accionistas institucionales                            |
| **DATOS CUALITATIVOS**            |
| Risk Factors                      | ❌ No      | Media       | Sección de 10-K (texto, no XBRL)                               |
| MD&A (Management Discussion)      | ❌ No      | Media       | Análisis cualitativo del management                            |
| Business Description              | ❌ No      | Baja        | Útil para contexto                                             |
| Auditor Opinion                   | ❌ No      | Baja        | Raramente cambia                                               |

---

## 2️⃣ Lista de Gaps Críticos

### 🔴 **CRÍTICOS (Implementar primero)**

1. **Datos Trimestrales (10-Q)**

   - **Qué falta:** Reportes trimestrales Q1, Q2, Q3
   - **Por qué importa:** Los inversionistas necesitan ver tendencias recientes, no solo datos anuales que pueden tener 6-12 meses de antigüedad
   - **Cómo obtenerlo:** Mismo endpoint XBRL, filtrar por `form === "10-Q"` y `fp === "Q1"/"Q2"/"Q3"`
   - **Impacto:** **ALTO** - Sin esto, tu app está desactualizada vs. la realidad del mercado

2. **Eventos Materiales (8-K)**

   - **Qué falta:** Cambios de CEO, adquisiciones, earnings surprises, cambios de auditor, litigios
   - **Por qué importa:** Los 8-K contienen las noticias más importantes que mueven el precio de las acciones
   - **Cómo obtenerlo:** Endpoint `/submissions/CIK{cik}.json` → parsear `filings.recent` → filtrar `form === "8-K"` → extraer items
   - **Impacto:** **ALTO** - Diferencia entre una app de "números históricos" vs. "análisis de eventos"

3. **Actividad de Insiders (Forms 4)**

   - **Qué falta:** Compras y ventas de ejecutivos/directores
   - **Por qué importa:** Es una de las señales más fuertes de confianza interna. Si el CEO está vendiendo masivamente, es una red flag
   - **Cómo obtenerlo:** Endpoint `/cik-lookup-data.txt` para mapear insiders → `/submissions/` para Forms 4 → parsear XML
   - **Impacto:** **ALTO** - Señal de inversión de alta calidad

4. **Fechas de Filing**
   - **Qué falta:** Cuándo se presentó el último 10-K/10-Q
   - **Por qué importa:** Un 10-K de hace 11 meses está casi obsoleto
   - **Cómo obtenerlo:** Ya está en el JSON de XBRL (`filed` field)
   - **Impacto:** **MEDIO** - Contexto crítico para el usuario

### 🟡 **IMPORTANTES (Segunda prioridad)**

5. **Ownership Institucional (13F)**

   - **Qué falta:** Qué fondos (BlackRock, Vanguard, etc.) poseen la acción
   - **Por qué importa:** Muestra confianza institucional y puede predecir movimientos de precio
   - **Cómo obtenerlo:** Endpoint `/submissions/` de fondos → filtrar 13F → parsear holdings
   - **Impacto:** **MEDIO** - Dato profesional que diferencia tu app

6. **Búsqueda Dinámica de Tickers**

   - **Qué falta:** Solo soportas 25 tickers pre-mapeados
   - **Por qué importa:** Limita severamente el uso de la app
   - **Cómo obtenerlo:** Endpoint `https://www.sec.gov/files/company_tickers.json`
   - **Impacto:** **MEDIO** - Escalabilidad

7. **Comparación Trimestral (QoQ)**
   - **Qué falta:** Crecimiento trimestre a trimestre
   - **Por qué importa:** Detecta aceleración/desaceleración antes que YoY
   - **Cómo obtenerlo:** Calcular con datos de 10-Q
   - **Impacto:** **MEDIO**

### 🟢 **NICE TO HAVE (Tercera prioridad)**

8. **Risk Factors y MD&A**

   - **Qué falta:** Texto cualitativo de 10-K
   - **Por qué importa:** Contexto sobre riesgos del negocio
   - **Cómo obtenerlo:** Parsear HTML/XML del filing completo
   - **Impacto:** **BAJO** - Difícil de parsear, valor limitado

9. **Accession Numbers y Enlaces**
   - **Qué falta:** Links directos a los documentos SEC
   - **Por qué importa:** Permite al usuario verificar la fuente
   - **Cómo obtenerlo:** Construir URL: `https://www.sec.gov/cgi-bin/viewer?action=view&cik={cik}&accession_number={accn}`
   - **Impacto:** **BAJO** - Transparencia

---

## 3️⃣ Recomendaciones de Mejora Priorizadas

### 🚀 **FASE 1: Datos Actualizados (Prioridad ALTA)**

| #   | Feature                          | Prioridad | Fuente                    | Complejidad                   |
| --- | -------------------------------- | --------- | ------------------------- | ----------------------------- |
| 1   | **Datos trimestrales (10-Q)**    | 🔴 Alta   | XBRL API (mismo endpoint) | Baja - Solo cambiar filtro    |
| 2   | **Fecha del último filing**      | 🔴 Alta   | Campo `filed` en XBRL     | Muy baja - Ya está en el JSON |
| 3   | **Búsqueda dinámica de tickers** | 🟡 Media  | `company_tickers.json`    | Baja - Un fetch adicional     |
| 4   | **Crecimiento QoQ**              | 🟡 Media  | Calculado de 10-Q         | Baja - Reutilizar lógica CAGR |

**Impacto:** Convierte tu app de "datos anuales obsoletos" a "análisis trimestral actualizado"

**Esfuerzo estimado:** 1-2 días de desarrollo

---

### 🎯 **FASE 2: Eventos y Señales (Prioridad ALTA)**

| #   | Feature                           | Prioridad | Fuente                           | Complejidad                    |
| --- | --------------------------------- | --------- | -------------------------------- | ------------------------------ |
| 5   | **Parser de 8-K**                 | 🔴 Alta   | `/submissions/` API              | Media - Requiere parsear items |
| 6   | **Eventos materiales destacados** | 🔴 Alta   | 8-K Items 1.01, 2.01, 2.02, 5.02 | Media                          |
| 7   | **Timeline de eventos**           | 🟡 Media  | Ordenar 8-K por fecha            | Baja                           |

**Impacto:** Agrega contexto de "qué está pasando" en la empresa

**Esfuerzo estimado:** 3-4 días de desarrollo

---

### 📈 **FASE 3: Insider Trading (Prioridad ALTA)**

| #   | Feature                                 | Prioridad | Fuente                               | Complejidad         |
| --- | --------------------------------------- | --------- | ------------------------------------ | ------------------- |
| 8   | **Forms 4 - Transacciones de insiders** | 🔴 Alta   | `/submissions/` + XML parsing        | Alta - XML complejo |
| 9   | **Agregación de compras/ventas**        | 🔴 Alta   | Calculado de Forms 4                 | Media               |
| 10  | **Señal de insider sentiment**          | 🟡 Media  | Ratio compras/ventas últimos 6 meses | Baja                |

**Impacto:** Señal de inversión de altísima calidad (insiders conocen el negocio mejor que nadie)

**Esfuerzo estimado:** 5-7 días de desarrollo (XML parsing es complejo)

---

### 🏦 **FASE 4: Ownership Institucional (Prioridad MEDIA)**

| #   | Feature                      | Prioridad | Fuente                    | Complejidad                   |
| --- | ---------------------------- | --------- | ------------------------- | ----------------------------- |
| 11  | **13F Holdings**             | 🟡 Media  | `/submissions/` de fondos | Alta - Requiere mapeo inverso |
| 12  | **Top 10 holders**           | 🟡 Media  | Agregado de 13F           | Media                         |
| 13  | **Cambios QoQ en ownership** | 🟢 Baja   | Comparar 13F trimestrales | Media                         |

**Impacto:** Dato profesional que usan hedge funds

**Esfuerzo estimado:** 7-10 días de desarrollo (muy complejo)

---

### 🎨 **FASE 5: UX y Contexto (Prioridad BAJA)**

| #   | Feature                          | Prioridad | Fuente               | Complejidad |
| --- | -------------------------------- | --------- | -------------------- | ----------- |
| 14  | **Enlaces a filings originales** | 🟢 Baja   | Construir URLs       | Muy baja    |
| 15  | **Risk Factors**                 | 🟢 Baja   | HTML parsing de 10-K | Alta        |
| 16  | **Business Description**         | 🟢 Baja   | HTML parsing de 10-K | Media       |

**Impacto:** Mejora UX pero no agrega datos críticos

**Esfuerzo estimado:** 3-5 días

---

## 4️⃣ Conclusión Ejecutiva

### ❓ **¿Tu aplicación es suficiente para análisis fundamental serio?**

**Respuesta corta:** **No, pero tiene una base sólida.**

**Respuesta larga:**

Tu aplicación actualmente es excelente para:

- ✅ Análisis de ratios financieros históricos (anuales)
- ✅ Comparación de márgenes y rentabilidad
- ✅ Evaluación de salud financiera (deuda, cash flow)

Pero **NO es suficiente** para:

- ❌ Detectar tendencias recientes (necesitas 10-Q)
- ❌ Identificar eventos que mueven el precio (necesitas 8-K)
- ❌ Evaluar confianza de insiders (necesitas Forms 4)
- ❌ Ver qué están haciendo los institucionales (necesitas 13F)

### 📊 **¿Qué separa tu app de herramientas profesionales?**

| Feature                       | Tu App | Yahoo Finance | Finviz      | Bloomberg Terminal |
| ----------------------------- | ------ | ------------- | ----------- | ------------------ |
| **Datos anuales (10-K)**      | ✅     | ✅            | ✅          | ✅                 |
| **Datos trimestrales (10-Q)** | ❌     | ✅            | ✅          | ✅                 |
| **Eventos materiales (8-K)**  | ❌     | 🟡 Parcial    | ❌          | ✅                 |
| **Insider trading**           | ❌     | ✅            | ✅          | ✅                 |
| **Institutional ownership**   | ❌     | ✅            | ✅          | ✅                 |
| **Precio en tiempo real**     | ❌     | ✅            | ✅          | ✅                 |
| **Gráficos de precio**        | ❌     | ✅            | ✅          | ✅                 |
| **Noticias**                  | ❌     | ✅            | ✅          | ✅                 |
| **Screener**                  | ❌     | ✅            | ✅          | ✅                 |
| **Análisis técnico**          | ❌     | ✅            | ✅          | ✅                 |
| **100% Gratis**               | ✅     | ✅            | 🟡 Freemium | ❌ $24k/año        |
| **Datos oficiales SEC**       | ✅     | ✅            | ✅          | ✅                 |

### 🎯 **Roadmap Recomendado para Competir**

**Para alcanzar nivel "Yahoo Finance":**

1. ✅ Implementar **10-Q** (datos trimestrales) - **CRÍTICO**
2. ✅ Implementar **8-K** (eventos materiales) - **CRÍTICO**
3. ✅ Implementar **Forms 4** (insider trading) - **CRÍTICO**
4. ✅ Agregar **búsqueda dinámica** de cualquier ticker
5. 🟡 Agregar **precios en tiempo real** (usar API gratuita como Finnhub free tier o Yahoo Finance API)
6. 🟡 Agregar **gráficos de precio** (no está en SEC, necesitas otra fuente)

**Para alcanzar nivel "Finviz Pro":** 7. ✅ Todo lo anterior + 8. ✅ Implementar **13F** (institutional ownership) 9. ✅ Crear **screener** (filtrar empresas por métricas) 10. ✅ Comparación lado a lado de múltiples empresas

**Para alcanzar nivel "Bloomberg Terminal Lite":** 11. ✅ Todo lo anterior + 12. ✅ Análisis de **Risk Factors** con NLP 13. ✅ Alertas automáticas de 8-K 14. ✅ Análisis de sentiment de MD&A 15. ✅ Backtesting de estrategias basadas en filings

---

## 📝 Notas Técnicas Importantes

### ✅ **Datos que SEC EDGAR SÍ provee (y no estás usando):**

1. **Endpoint `/submissions/CIK{cik}.json`**

   - Lista completa de todos los filings
   - Fechas de presentación
   - Accession numbers
   - Tipos de formularios (10-K, 10-Q, 8-K, 13F, etc.)

2. **Datos trimestrales en XBRL**

   - Ya están en `/api/xbrl/companyfacts/`
   - Solo necesitas filtrar por `fp: "Q1"/"Q2"/"Q3"/"Q4"`

3. **Forms 4 (Insider Trading)**

   - Disponibles en `/submissions/`
   - Formato XML (más complejo de parsear)

4. **13F (Institutional Holdings)**
   - Disponibles en `/submissions/` de fondos
   - Requiere mapeo inverso (buscar qué fondos tienen X acción)

### ❌ **Datos que SEC EDGAR NO provee (necesitas otras fuentes):**

1. **Precios de mercado en tiempo real**

   - Alternativas gratuitas: Finnhub, Alpha Vantage, Yahoo Finance API
   - Tu app actualmente NO tiene precios

2. **Noticias de medios**

   - SEC solo tiene filings oficiales, no noticias de prensa
   - Alternativas: NewsAPI, Finnhub news

3. **Análisis técnico**

   - SEC no provee datos de trading (volumen, OHLC)
   - Necesitas APIs de mercado

4. **Estimaciones de analistas**
   - SEC no tiene proyecciones futuras
   - Necesitas servicios pagos (FactSet, Refinitiv)

---

## 🚀 Quick Wins (Implementación rápida, alto impacto)

### 1. **Agregar fecha del último filing** (15 minutos)

```typescript
// Ya está en el JSON XBRL
const filingDate = values[0]?.filed; // "2024-01-31"
```

### 2. **Datos trimestrales** (2 horas)

```typescript
// Cambiar filtro de solo 10-K a incluir 10-Q
const quarterlyReports = values.filter(
  (v) => v.form === "10-Q" && v.fp === "Q3" // Último trimestre
);
```

### 3. **Búsqueda dinámica de tickers** (1 hora)

```typescript
// Fetch de company_tickers.json
const response = await fetch("https://www.sec.gov/files/company_tickers.json");
const tickers = await response.json();
```

### 4. **Lista de filings recientes** (3 horas)

```typescript
// Endpoint /submissions/
const submissions = await fetch(
  `https://data.sec.gov/submissions/CIK${cik}.json`
);
// Mostrar últimos 10 filings con fechas y tipos
```

---

## 📚 Recursos Adicionales

### Documentación Oficial SEC

- **Company Facts (XBRL):** `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json`
- **Submissions:** `https://data.sec.gov/submissions/CIK{cik}.json`
- **Company Tickers:** `https://www.sec.gov/files/company_tickers.json`
- **Viewer de Filings:** `https://www.sec.gov/cgi-bin/viewer?action=view&cik={cik}&accession_number={accn}`

### Ejemplos de Uso

```bash
# Company Facts (lo que ya usas)
curl -H "User-Agent: YourApp email@example.com" \
  https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json

# Submissions (para 8-K, Forms 4, etc.)
curl -H "User-Agent: YourApp email@example.com" \
  https://data.sec.gov/submissions/CIK0000320193.json

# Company Tickers (mapeo completo)
curl https://www.sec.gov/files/company_tickers.json
```

---

## ✅ Checklist de Implementación

### Fase 1: Fundamentos (1-2 semanas)

- [ ] Agregar fecha de filing a UI
- [ ] Implementar búsqueda dinámica de tickers
- [ ] Agregar datos trimestrales (10-Q)
- [ ] Calcular crecimiento QoQ
- [ ] Mostrar período del reporte (Q1, Q2, etc.)

### Fase 2: Eventos (2-3 semanas)

- [ ] Fetch de `/submissions/` endpoint
- [ ] Parser de 8-K filings
- [ ] Identificar eventos materiales (Items)
- [ ] Timeline de eventos en UI
- [ ] Alertas de eventos recientes

### Fase 3: Insider Trading (3-4 semanas)

- [ ] Parser de Forms 4 (XML)
- [ ] Identificar insiders (nombre, título)
- [ ] Calcular compras vs ventas
- [ ] Señal de insider sentiment
- [ ] Gráfico de actividad de insiders

### Fase 4: Institucionales (4-6 semanas)

- [ ] Mapeo de fondos a CIKs
- [ ] Parser de 13F
- [ ] Top 10 holders
- [ ] Cambios QoQ en ownership
- [ ] Gráfico de concentración

---

## 🎓 Conclusión Final

Tu aplicación tiene una **base técnica excelente** y usa correctamente los datos XBRL de SEC EDGAR. Sin embargo, para ser una herramienta de análisis fundamental **profesional**, necesitas implementar:

1. **CRÍTICO (sin esto, la app está incompleta):**

   - Datos trimestrales (10-Q)
   - Eventos materiales (8-K)
   - Insider trading (Forms 4)

2. **IMPORTANTE (para competir con Yahoo Finance):**

   - Precios de mercado (fuente externa)
   - Institutional ownership (13F)
   - Búsqueda de cualquier ticker

3. **NICE TO HAVE (para diferenciarte):**
   - Análisis de Risk Factors
   - Alertas automáticas
   - Screener de acciones

**Tiempo estimado para alcanzar nivel profesional:** 8-12 semanas de desarrollo

**Ventaja competitiva:** 100% gratis, datos oficiales, sin límites de API

---

**¿Siguiente paso recomendado?**  
Implementar **Fase 1** (datos trimestrales + fechas) en los próximos 3-5 días. Es el cambio de mayor impacto con menor esfuerzo.
