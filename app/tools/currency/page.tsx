import type { Metadata } from "next";
import { CurrencyConverterClient } from "@/components/currency/currency-converter";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Currency Converter";
const TOOL_PATH = "/tools/currency";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: "Fiat + Crypto Currency Converter",
  description:
    "Convert between 150+ world currencies and major cryptocurrencies using real-time exchange rates. Free, accurate, and instant currency conversion in your browser.",
  keywords: [
    "currency converter",
    "exchange rate",
    "forex converter",
    "cryptocurrency converter",
    "real-time exchange rates",
    "money converter",
    "USD to EUR",
    "currency calculator",
    "crypto converter",
  ],
  openGraph: {
    title: "Fiat + Crypto Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiat + Crypto Currency Converter",
    description:
      "Convert currencies and crypto with real-time exchange rates. Free and accurate.",
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: `https://www.astraa.tech${TOOL_PATH}`,
  },
};

const softwareSchema = buildSoftwareApplicationSchema({
  name: TOOL_NAME,
  path: TOOL_PATH,
  description:
    "Real-time fiat and cryptocurrency conversion across 150+ currencies. Uses the FawazAhmed0 rates feed with CoinGecko fallback.",
  applicationCategory: "FinanceApplication",
  featureList: [
    "150+ fiat currencies",
    "Major cryptocurrencies",
    "Real-time exchange rates",
    "Swap currencies in one click",
    "Fallback API for reliability",
    "No API key required",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function CurrencyConverterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CurrencyConverterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
