import { MetadataRoute } from "next";

import { getIndexablePaths, PRIVACY_POLICY_UPDATED_AT, toCanonicalUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexablePaths().map((path) => ({
    url: toCanonicalUrl(path),
    ...(path === "/privacy" && { lastModified: PRIVACY_POLICY_UPDATED_AT }),
  }));
}
