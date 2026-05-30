import { SITE_URL } from "@/lib/site-meta";

export interface ToolSchemaOptions {
  name: string;
  path: string;
  description: string;
  applicationCategory: string;
  featureList: string[];
  lastModified: string;
  datePublished?: string;
  browserRequirements?: string;
}

export function buildSoftwareApplicationSchema(opts: ToolSchemaOptions) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    "name": opts.name,
    "description": opts.description,
    "url": url,
    "applicationCategory": opts.applicationCategory,
    "operatingSystem": "Web",
    "browserRequirements":
      opts.browserRequirements ??
      "Requires JavaScript. Supports modern Chrome, Firefox, Safari, Edge.",
    "featureList": opts.featureList,
    "datePublished": opts.datePublished ?? "2025-01-01",
    "dateModified": opts.lastModified,
    "isPartOf": { "@id": `${SITE_URL}/#webapp` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/OnlineOnly",
    },
  };
}

export function buildToolBreadcrumbSchema(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `${SITE_URL}/tools` },
      { "@type": "ListItem", "position": 3, "name": name, "item": `${SITE_URL}${path}` },
    ],
  };
}

export function formatLastModified(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
