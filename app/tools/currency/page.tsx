import type { Metadata } from "next";
import { CurrencyConverterClient } from "@/components/currency/currency-converter";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
    url: "/tools/currency",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
  },
  alternates: {
    canonical: "/tools/currency",
  },
};

export default function CurrencyConverterPage() {
  return <CurrencyConverterClient />;
}
