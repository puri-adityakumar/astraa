import type { Metadata } from "next";
import { JsonValidatorClient } from "@/components/json/json-validator-client";

export const metadata: Metadata = {
  title: "JSON Validator & Formatter",
  description:
    "Validate and format JSON data instantly in your browser. Paste raw JSON to check syntax, prettify output, and copy formatted results. Free developer tool.",
  keywords: [
    "JSON validator",
    "JSON formatter",
    "JSON prettifier",
    "validate JSON",
    "format JSON",
    "JSON parser",
    "JSON syntax checker",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Validator & Formatter",
    description:
      "Validate and format JSON data instantly. Free browser-based developer tool.",
    url: "/tools/json",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "JSON Validator & Formatter",
    description:
      "Validate and format JSON data instantly. Free browser-based developer tool.",
  },
  alternates: {
    canonical: "/tools/json",
  },
};

export default function JsonValidatorPage() {
  return <JsonValidatorClient />;
}
