import type { Metadata } from "next";

import { RelatedTools } from "@/components/related-tools";
import { SqlFormatterClient } from "@/components/sql/sql-formatter-client";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "SQL Formatter",
  description:
    "Format the layout and keyword case of Basic SQL, PostgreSQL, MySQL/MariaDB, SQLite, SQL Server, and BigQuery locally in your browser.",
  keywords: [
    "SQL formatter",
    "SQL beautifier",
    "format SQL",
    "PostgreSQL formatter",
    "MySQL formatter",
    "SQL Server formatter",
    "BigQuery formatter",
  ],
  openGraph: {
    title: "SQL Formatter",
    description: "Format six supported SQL dialects locally in your browser.",
    url: "/tools/sql",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "SQL Formatter",
    description: "Format six supported SQL dialects locally in your browser.",
  },
  alternates: {
    canonical: "/tools/sql",
  },
};

export default function SqlFormatterPage() {
  return (
    <>
      <SqlFormatterClient />
      <ToolGuide toolId="sql" />
      <RelatedTools toolId="sql" />
    </>
  );
}
