import { expect, test } from "@playwright/test";

import { availableGames, comingSoonGames, getGameByPath } from "../../lib/games";
import {
  getIndexablePaths,
  PRIVACY_POLICY_UPDATED_AT,
  SITE_NAME,
  SITE_URL,
  toCanonicalUrl,
} from "../../lib/seo/site";
import { GUIDED_TOOL_IDS, TOOL_GUIDES } from "../../lib/seo/tool-guides";
import { availableTools, comingSoonTools, getToolByPath } from "../../lib/tools";
import {
  expectHealthyDocument,
  installDefaultProviderFixtures,
  watchPageDiagnostics,
} from "./test-helpers";

type JsonLdNode = Record<string, unknown>;

function readGraphNodes(value: unknown): JsonLdNode[] {
  if (typeof value !== "object" || value === null || !("@graph" in value)) return [];
  const graph = (value as { "@graph"?: unknown })["@graph"];
  return Array.isArray(graph)
    ? graph.filter((node): node is JsonLdNode => typeof node === "object" && node !== null)
    : [];
}

test.beforeEach(async ({ page }) => {
  await installDefaultProviderFixtures(page);
});

for (const routePath of getIndexablePaths()) {
  test(`@seo ${routePath} has consistent indexable HTML`, async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    const response = await page.goto(routePath, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title.match(new RegExp(SITE_NAME, "gi"))?.length ?? 0).toBe(1);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(await canonical.getAttribute("href")).toBe(toCanonicalUrl(routePath));

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    expect((await description.getAttribute("content"))?.trim().length).toBeGreaterThan(40);

    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      await expect(robots).not.toHaveAttribute("content", /noindex/i);
    }
    await expect(page.locator("h1")).toHaveCount(1);

    const schemaScripts = page.locator('script[type="application/ld+json"]');
    await expect(schemaScripts).toHaveCount(1);
    const schemaText = (await schemaScripts.textContent()) ?? "";
    const schema = JSON.parse(schemaText) as unknown;
    const nodes = readGraphNodes(schema);
    const nodeIds = nodes.map((node) => node["@id"]);
    expect(nodes.map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(schemaText).not.toContain("SearchAction");
    expect(schemaText).not.toContain("WebApplication");
    expect(schemaText).not.toContain("dateModified");

    const tool = getToolByPath(routePath);
    const game = getGameByPath(routePath);
    expect(tool === undefined || game === undefined).toBe(true);
    if (tool) {
      expect(title).toBe(`${tool.name} | ${SITE_NAME}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(tool.name);

      const relatedLinks = page.locator(
        `aside[aria-labelledby="${tool.id}-related"] a[href^="/tools/"]`,
      );
      await expect(relatedLinks).toHaveCount(tool.relatedToolIds.length);
      expect(
        await relatedLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual(
        tool.relatedToolIds.map(
          (relatedId) => availableTools.find((candidate) => candidate.id === relatedId)?.path,
        ),
      );

      expect(GUIDED_TOOL_IDS).toContain(tool.id);
      const guideId = tool.id as (typeof GUIDED_TOOL_IDS)[number];
      const html = await response?.text();
      expect(html).toContain(`data-seo-guide="${guideId}"`);
      expect(html).toContain(TOOL_GUIDES[guideId].heading);
    }
    if (game) {
      expect(game.status).toBe("available");
      expect(title).toBe(`${game.name} | ${SITE_NAME}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(game.name);
    }

    await expectHealthyDocument(page, diagnostics);
    diagnostics.stop();
  });
}

test("@seo sitemap contains every and only indexable canonical URL", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  expect(urls).toEqual(getIndexablePaths().map(toCanonicalUrl));
  expect(new Set(urls).size).toBe(urls.length);
  expect(xml).not.toContain("<changefreq>");
  expect(xml).not.toContain("<priority>");
  expect(xml.match(/<lastmod>/g)?.length ?? 0).toBe(1);
  expect(xml).toContain(`<lastmod>${PRIVACY_POLICY_UPDATED_AT}</lastmod>`);
});

test("@seo robots allows public pages, blocks APIs, and declares the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();

  expect(body).toContain("Allow: /");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});

test("@seo first-game catalog is indexable and registry-derived", async ({ page }) => {
  const response = await page.goto("/games", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) await expect(robots).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    toCanonicalUrl("/games"),
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Play browser games.");
  const availableGameCopy = `${availableGames.length} ${
    availableGames.length === 1 ? "game is" : "games are"
  } playable now.`;
  await expect(page.getByText(availableGameCopy)).toBeVisible();
  await expect(
    page.getByText(`${comingSoonGames.length} games remain planned`, { exact: false }),
  ).toBeVisible();
  await expect(page.locator('a[href="/games/memory"]')).toHaveCount(1);

  await page.goto("/explore", { waitUntil: "domcontentloaded" });
  const exploreDescription = page.locator('meta[name="description"]');
  await expect(exploreDescription).toHaveAttribute(
    "content",
    new RegExp(`${availableGames.length} available game(?:,|s,)`),
  );
  if (availableGames.length === 1) {
    await expect(exploreDescription).not.toHaveAttribute("content", /1 available games/);
  }
});

test("@seo copy distinguishes browser, provider, and local-file boundaries", async ({ page }) => {
  await page.goto("/tools/json", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("JSON is processed in this browser", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
    "content",
    /100% local/i,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /best-effort syntax repair/i,
  );
  await expect(page.locator('[data-seo-guide="json"]')).not.toContainText(/repair.{0,30}5 MB/i);

  await page.goto("/tools/text", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toContainText(
    "Your topic and requested word count go through Astraa's server",
  );
  await expect(page.locator("main")).toContainText("configured OpenRouter provider");

  await page.goto("/tools/currency", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toContainText(
    "The selected pair goes through Astraa's rate endpoint to its data provider",
  );
  await expect(page.locator("main")).toContainText("your amount stays in this browser");

  await page.goto("/tools/base64", { waitUntil: "domcontentloaded" });
  const fileMode = page.getByRole("button", { name: "File", exact: true });
  await expect(async () => {
    await fileMode.click();
    await expect(fileMode).toHaveAttribute("aria-pressed", "true");
  }).toPass();
  await expect(
    page.getByRole("button", { name: "Choose a local file or drag it here" }),
  ).toBeVisible();

  await page.goto("/tools/image", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Choose an image to resize")).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /JPEG and WebP exports include quality control/i,
  );
  await expect(page.locator('[data-seo-guide="image"]')).toContainText(
    "PNG export ignores the JPEG/WebP quality setting",
  );
});

test("@seo coming-soon catalog cards are not links or controls", async ({ page }) => {
  await page.goto("/explore", { waitUntil: "domcontentloaded" });
  const plannedCards = page.locator("article").filter({ hasText: "Coming soon" });
  const availableCatalogLinks = page.locator("main a[href^='/tools/'], main a[href^='/games/']");

  await expect(plannedCards).toHaveCount(comingSoonTools.length + comingSoonGames.length);
  await expect(availableCatalogLinks).toHaveCount(availableTools.length + availableGames.length);
  await expect(availableCatalogLinks.locator(".lucide-arrow-right")).toHaveCount(
    availableTools.length + availableGames.length,
  );
  await expect(availableCatalogLinks.locator(".lucide-arrow-up-right")).toHaveCount(0);
  for (const card of await plannedCards.all()) {
    await expect(card.locator("a, button, [tabindex]")).toHaveCount(0);
  }
});
