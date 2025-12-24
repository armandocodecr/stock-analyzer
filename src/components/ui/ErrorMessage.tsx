"use client";

import { AlertCircle, XCircle, Clock } from "lucide-react";

interface ErrorMessageProps {
  type?: "not-found" | "api-error" | "rate-limit" | "generic";
  message?: string;
  ticker?: string;
}

export default function ErrorMessage({
  type = "generic",
  message,
  ticker,
}: ErrorMessageProps) {
  const errorConfig = {
    "not-found": {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      title: "Ticker no encontrado",
      description: ticker
        ? `No se encontró información para el ticker "${ticker}". Por favor verifica que el símbolo sea correcto.`
        : "No se encontró el ticker especificado.",
      suggestion:
        "Intenta con tickers conocidos como AAPL, MSFT, NVDA, o AMZN.",
    },
    "api-error": {
      icon: <AlertCircle className="w-12 h-12 text-orange-500" />,
      title: "Error de API",
      description:
        message || "Hubo un problema al obtener los datos financieros.",
      suggestion:
        "Por favor intenta nuevamente en unos momentos. Si el problema persiste, verifica tu API key.",
    },
    "rate-limit": {
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      title: "Límite de consultas alcanzado",
      description:
        "Se ha alcanzado el límite de consultas permitidas por la API.",
      suggestion: "Por favor espera unos minutos antes de intentar nuevamente.",
    },
    generic: {
      icon: <AlertCircle className="w-12 h-12 text-gray-300" />,
      title: "Error",
      description: message || "Ocurrió un error inesperado.",
      suggestion: "Por favor intenta nuevamente.",
    },
  };

  const config = errorConfig[type];

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="flex flex-col items-center text-center space-y-4">
        {config.icon}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {config.title}
          </h2>
          <p className="text-gray-300 mb-4">{config.description}</p>
          <p className="text-sm text-gray-400 italic">{config.suggestion}</p>
        </div>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
