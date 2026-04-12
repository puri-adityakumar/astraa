import type { Metadata } from "next";
import { UnitConverterClient } from "@/components/units/unit-converter";

export const metadata: Metadata = {
  title: "Unit Converter",
  description:
    "Convert between different units of measurement including length, weight, temperature, and more. Free online unit conversion tool with metric and imperial support.",
  keywords: [
    "unit converter",
    "measurement converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "metric converter",
    "imperial converter",
    "conversion tool",
    "unit conversion calculator",
    "measurement tool",
  ],
  openGraph: {
    title: "Unit Converter",
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
    url: "/tools/units",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Unit Converter",
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
  },
  alternates: {
    canonical: "/tools/units",
  },
};

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
