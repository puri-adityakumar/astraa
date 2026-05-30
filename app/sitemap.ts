import { MetadataRoute } from "next";

import { toolCategories } from "@/lib/tools";
import { games } from "@/lib/games";
import { SITE_LAST_MODIFIED } from "@/lib/site-meta";

const BASE_URL = "https://www.astraa.tech";
const DEFAULT_LAST_MODIFIED = SITE_LAST_MODIFIED;

export default function sitemap(): MetadataRoute.Sitemap {
  const liveTools = toolCategories
    .flatMap((category) => category.items)
    .filter((tool) => !tool.comingSoon);

  const liveGames = games.filter((game) => !game.comingSoon);

  const toolEntries: MetadataRoute.Sitemap = liveTools.map((tool) => ({
    url: `${BASE_URL}${tool.path}`,
    lastModified: tool.lastModified ?? DEFAULT_LAST_MODIFIED,
  }));

  const gameEntries: MetadataRoute.Sitemap = liveGames.map((game) => ({
    url: `${BASE_URL}${game.path}`,
    lastModified: DEFAULT_LAST_MODIFIED,
  }));

  const baseEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: DEFAULT_LAST_MODIFIED },
    { url: `${BASE_URL}/tools`, lastModified: DEFAULT_LAST_MODIFIED },
    { url: `${BASE_URL}/about`, lastModified: DEFAULT_LAST_MODIFIED },
    { url: `${BASE_URL}/explore`, lastModified: DEFAULT_LAST_MODIFIED },
    { url: `${BASE_URL}/contribute`, lastModified: DEFAULT_LAST_MODIFIED },
    { url: `${BASE_URL}/privacy`, lastModified: DEFAULT_LAST_MODIFIED },
  ];

  if (liveGames.length > 0) {
    baseEntries.splice(2, 0, {
      url: `${BASE_URL}/games`,
      lastModified: DEFAULT_LAST_MODIFIED,
    });
  }

  return [...baseEntries, ...toolEntries, ...gameEntries];
}
