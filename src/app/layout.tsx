import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stock Analyzer - Real-Time Stock Analysis",
  description:
    "Analyze publicly traded companies with real-time financial data, fundamental metrics, DCF valuation, and updated news.",
  keywords:
    "stock analysis, financial analysis, stock valuation, DCF, investment",
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
