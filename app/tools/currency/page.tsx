import type { Metadata } from "next";

import { CurrencyConverterClient } from "@/components/currency/currency-converter";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Currency Converter",
  description:
    "Convert supported fiat currencies and cryptocurrencies with provider-backed rates. The selected pair reaches the rate provider; the amount stays in your browser.",
  keywords: [
    "currency converter",
    "exchange rate",
    "forex converter",
    "cryptocurrency converter",
    "current exchange rates",
    "money converter",
    "USD to EUR",
    "currency calculator",
  ],
  openGraph: {
    title: "Currency Converter",
    description: "Convert fiat currencies and crypto with cached provider-backed rates.",
    url: "/tools/currency",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Currency Converter",
    description: "Convert fiat currencies and crypto with cached provider-backed rates.",
  },
  alternates: {
    canonical: "/tools/currency",
  },
};

export default function CurrencyConverterPage() {
  return (
    <>
      <CurrencyConverterClient />
      <ToolGuide toolId="currency" />
      <RelatedTools toolId="currency" />
    </>
  );
}
