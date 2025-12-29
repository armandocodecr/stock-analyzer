"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  ticker: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ ticker }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar cualquier script anterior
    containerRef.current.innerHTML = "";

    // Crear el contenedor para el widget
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(widgetContainer);

    // Crear y agregar el script del widget
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 650,
      symbol: `NASDAQ:${ticker}`,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#1D2939",
      gridColor: "rgba(255, 255, 255, 0.06)",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [ticker]);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          Stock Price Chart
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Live price data powered by TradingView
        </p>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: "650px", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
