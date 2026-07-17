import type { Metadata } from "next";
import { CurrencyConverterClient } from "@/components/currency/currency-converter";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Currency Converter",
  description:
    "Convert between world currencies and cryptocurrencies using real-time exchange rates. Fast, free, and accurate currency conversion tool with 150+ currencies.",
  keywords: [
    "currency converter",
    "exchange rate",
    "forex converter",
    "cryptocurrency converter",
    "real-time exchange rates",
    "money converter",
    "USD to EUR",
    "currency calculator",
  ],
  path: "/tools/currency",
  ogDescription: "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
});

export default function CurrencyConverterPage() {
  return (
    <>
      <CurrencyConverterClient />
      <LastUpdated />
    </>
  );
}
