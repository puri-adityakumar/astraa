import { Metadata } from "next"
import { UnitConverterClient } from "@/components/units/unit-converter"

export const metadata: Metadata = {
  title: "Unit Converter | astraa",
  description: "Convert between different units of measurement including length, weight, and temperature. Free online unit conversion tool.",
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
    "measurement tool"
  ],
  openGraph: {
    title: "Unit Converter",
    description: "Convert between different units of measurement including length, weight, and temperature. Free online unit conversion tool.",
    type: "website",
    url: "https://astraa.me/tools/units",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unit Converter",
    description: "Convert between different units of measurement including length, weight, and temperature. Free online unit conversion tool.",
  }
}

export default function UnitConverterPage() {
  return <UnitConverterClient />
}