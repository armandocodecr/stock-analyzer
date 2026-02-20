import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stock Analyzer - SEC Filing Analysis",
  description:
    "Analyze publicly traded companies using official SEC filings: 10-K annual reports, 10-Q quarterly data, 8-K material events, and Form 4 insider activity.",
  keywords:
    "stock analysis, financial analysis, SEC filings, EDGAR, 10-K, DCF, investment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
