import type { Metadata } from "next";

const BANNER_IMAGE = "/assets/astraa_banner.jpg";

export function createToolMetadata(opts: {
  title: string;
  description: string;
  keywords?: string[];
  /** e.g. "/tools/base64" — used for canonical + OG url */
  path: string;
  /** Defaults to title. */
  ogTitle?: string;
  /** Defaults to description. */
  ogDescription?: string;
  /** Defaults to ogTitle (after ogTitle falls back to title). */
  twitterTitle?: string;
  /** Defaults to ogDescription (after ogDescription falls back to description). */
  twitterDescription?: string;
  robots?: Metadata["robots"];
}): Metadata {
  const {
    title,
    description,
    keywords,
    path,
    ogTitle = title,
    ogDescription = description,
    twitterTitle = ogTitle,
    twitterDescription = ogDescription,
    robots,
  } = opts;

  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: path,
      images: [BANNER_IMAGE],
    },
    twitter: {
      card: "summary",
      title: twitterTitle,
      description: twitterDescription,
    },
    alternates: { canonical: path },
  };

  if (robots) {
    metadata.robots = robots;
  }

  return metadata;
}
