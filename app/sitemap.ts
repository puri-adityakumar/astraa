import { MetadataRoute } from "next";

import { toolCategories } from "@/lib/tools";
import { availableGames } from "@/lib/games";

const BASE_URL = "https://www.astraa.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries: MetadataRoute.Sitemap = toolCategories
    .flatMap((category) => category.items)
    .filter((tool) => !tool.comingSoon)
    .map((tool) => ({
      url: `${BASE_URL}${tool.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const gameEntries: MetadataRoute.Sitemap = availableGames()
    .map((game) => ({
      url: `${BASE_URL}${game.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // The catalogue URL only earns a spot once a game is actually playable.
  const catalogueEntry: MetadataRoute.Sitemap = gameEntries.length
    ? [
        {
          url: `${BASE_URL}/games`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        },
      ]
    : [];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...catalogueEntry,
    {
      url: `${BASE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contribute`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...toolEntries,
    ...gameEntries,
  ];
}
