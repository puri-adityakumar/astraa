import { expect, test } from "@playwright/test";

import { comingSoonGames } from "../../lib/games";
import { getIndexablePaths, toCanonicalUrl } from "../../lib/seo/site";
import { comingSoonTools } from "../../lib/tools";
import {
  expectHealthyDocument,
  installDefaultProviderFixtures,
  watchPageDiagnostics,
} from "./test-helpers";

const AVAILABLE_ROUTES = getIndexablePaths();
const UNAVAILABLE_ENTRIES = [...comingSoonTools, ...comingSoonGames];

test.beforeEach(async ({ page }) => {
  await installDefaultProviderFixtures(page);
});

for (const routePath of AVAILABLE_ROUTES) {
  test(`available route ${routePath} survives a direct load and refresh`, async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    const response = await page.goto(routePath, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBeLessThan(400);
    await assertIndexableMetadata(page, routePath);
    await expectHealthyDocument(page, diagnostics);

    const refreshed = await page.reload({ waitUntil: "domcontentloaded" });
    expect(refreshed?.status()).toBeLessThan(400);
    await assertIndexableMetadata(page, routePath);
    await expectHealthyDocument(page, diagnostics);
    diagnostics.stop();
  });
}

for (const entry of UNAVAILABLE_ENTRIES) {
  test(`unavailable route ${entry.path} stays fail-closed`, async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    const response = await page.goto(entry.path, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveCount(1);
    await expect(robots).toHaveAttribute("content", /noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      toCanonicalUrl(entry.path),
    );
    await expect(page.locator("body")).not.toContainText("Oops!");
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${entry.name} is planned`);
    await expect(page.locator("main")).toContainText(
      `This ${entry.path.startsWith("/games/") ? "game" : "tool"} is not available yet.`,
    );
    await expect(page.locator("main")).not.toContainText(
      /next release|check back after|available in/i,
    );
    const kind = entry.path.startsWith("/games/") ? "game" : "tool";
    const categoryPath = kind === "game" ? "/games" : "/tools";
    const categoryAction = page.getByRole("link", { name: `Browse available ${kind}s` });
    await expect(categoryAction).toHaveAttribute("href", categoryPath);
    await expect(page.getByRole("link", { name: "View full catalog" })).toHaveAttribute(
      "href",
      "/explore",
    );
    await expect
      .poll(() => categoryAction.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);

    const refreshed = await page.reload({ waitUntil: "domcontentloaded" });
    expect(refreshed?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${entry.name} is planned`);
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });
}

test("planned 2048 route resolves with canonical noindex metadata", async ({ page }) => {
  const response = await page.goto("/games/2048", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    toCanonicalUrl("/games/2048"),
  );
});

async function assertIndexableMetadata(
  page: import("@playwright/test").Page,
  routePath: string,
): Promise<void> {
  await expect(page).toHaveTitle(/\S+/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const canonicalUrl = new URL(
    (await canonical.getAttribute("href")) ?? "",
    "https://www.astraa.tech",
  );
  expect(canonicalUrl.origin).toBe("https://www.astraa.tech");
  expect(canonicalUrl.pathname).toBe(routePath);

  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) {
    await expect(robots).not.toHaveAttribute("content", /noindex/i);
  }
}
