import type { Metadata } from "next";

import { DocsPage } from "@/components/docs/docs-page";
import { DOCS_OVERVIEW } from "@/lib/docs/catalog";
import { loadDocsContent } from "@/lib/docs/content";
import { createDocsMetadata } from "@/lib/docs/metadata";

export const metadata: Metadata = createDocsMetadata(DOCS_OVERVIEW);

export default async function DocumentationPage() {
  const content = await loadDocsContent("");
  if (content.status === "not-found") {
    throw new Error("Documentation overview is missing from the allowlisted catalog.");
  }

  return <DocsPage content={content} />;
}
