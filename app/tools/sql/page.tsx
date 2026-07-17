import type { Metadata } from "next";
import { SqlFormatterClient } from "@/components/sql/sql-formatter-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/sql",
  ogDescription: "Format and beautify SQL queries instantly. Free browser-based developer tool.",
  robots: {
    index: false,
    follow: true,
  },
});

export default function SqlFormatterPage() {
  return (
    <>
      <SqlFormatterClient />
      <LastUpdated />
    </>
  );
}
