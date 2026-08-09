import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsPage } from "@/components/docs/docs-page";
import { DOCS_CHILDREN, getDocsEntryBySlug } from "@/lib/docs/catalog";
import { loadDocsContent } from "@/lib/docs/content";
import { createDocsMetadata } from "@/lib/docs/metadata";

export const dynamicParams = false;

interface DocumentationChildPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return DOCS_CHILDREN.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: DocumentationChildPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDocsEntryBySlug(slug);
  if (!entry || entry.slug === "") {
    return {
      title: "Documentation not found",
      robots: { index: false, follow: false },
    };
  }
  return createDocsMetadata(entry);
}

export default async function DocumentationChildPage({ params }: DocumentationChildPageProps) {
  const { slug } = await params;
  const content = await loadDocsContent(slug);
  if (content.status === "not-found" || content.entry.slug === "") notFound();

  return <DocsPage content={content} />;
}
