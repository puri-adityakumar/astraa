import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: "Googlebot", allow: "/", disallow: "/api/" },
      { userAgent: "Bingbot", allow: "/", disallow: "/api/" },
      { userAgent: "GPTBot", allow: "/", disallow: "/api/" },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: "/api/" },
      { userAgent: "ChatGPT-User", allow: "/", disallow: "/api/" },
      { userAgent: "ClaudeBot", allow: "/", disallow: "/api/" },
      { userAgent: "Claude-Web", allow: "/", disallow: "/api/" },
      { userAgent: "PerplexityBot", allow: "/", disallow: "/api/" },
      { userAgent: "Perplexity-User", allow: "/", disallow: "/api/" },
      { userAgent: "Google-Extended", allow: "/", disallow: "/api/" },
      { userAgent: "CCBot", allow: "/", disallow: "/api/" },
    ],
    sitemap: "https://www.astraa.tech/sitemap.xml",
    host: "https://www.astraa.tech",
  };
}
