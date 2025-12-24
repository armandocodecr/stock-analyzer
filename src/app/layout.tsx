import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stock Analyzer - Análisis de Acciones en Tiempo Real",
  description:
    "Analiza empresas que cotizan en bolsa con datos financieros en tiempo real, métricas fundamentales, valoración DCF y noticias actualizadas.",
  keywords:
    "stock analysis, análisis financiero, valoración acciones, DCF, inversión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-900 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
