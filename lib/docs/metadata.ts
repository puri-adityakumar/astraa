import type { Metadata } from "next";

import type { DocsCatalogEntry } from "./catalog";

export function createDocsMetadata(entry: DocsCatalogEntry): Metadata {
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: entry.route },
    openGraph: {
      type: "website",
      title: entry.title,
      description: entry.description,
      url: entry.route,
      images: ["/assets/astraa_banner.jpg"],
    },
    twitter: {
      card: "summary",
      title: entry.title,
      description: entry.description,
    },
    robots: { index: true, follow: true },
  };
}
