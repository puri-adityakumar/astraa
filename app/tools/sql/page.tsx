import type { Metadata } from "next";
import { SqlFormatterClient } from "@/components/sql/sql-formatter-client";

export const metadata: Metadata = {
  title: "SQL Formatter",
  description:
    "Format and beautify SQL queries instantly in your browser. Supports SELECT, JOIN, WHERE, and more. Free online SQL formatting tool for developers.",
  keywords: [
    "SQL formatter",
    "SQL beautifier",
    "format SQL",
    "SQL pretty print",
    "SQL query formatter",
    "online SQL formatter",
    "SQL tool",
    "developer tools",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "SQL Formatter",
    description:
      "Format and beautify SQL queries instantly. Free browser-based developer tool.",
    url: "/tools/sql",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "SQL Formatter",
    description:
      "Format and beautify SQL queries instantly. Free browser-based developer tool.",
  },
  alternates: {
    canonical: "/tools/sql",
  },
};

export default function SqlFormatterPage() {
  return <SqlFormatterClient />;
}
