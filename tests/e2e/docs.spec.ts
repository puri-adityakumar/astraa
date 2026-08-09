import { expect, test, type Route } from "@playwright/test";

import { DOCS_CATALOG, DOCS_CHILDREN, resolveDocsLink } from "../../lib/docs/catalog";
import { PROJECT_LINKS } from "../../lib/project-links";
import { toCanonicalUrl } from "../../lib/seo/site";
import { installDefaultProviderFixtures, watchPageDiagnostics } from "./test-helpers";

test.beforeEach(async ({ page }) => {
  await installDefaultProviderFixtures(page);
});

for (const [index, entry] of DOCS_CATALOG.entries()) {
  test(`docs route ${entry.route} has stable headings and manifest navigation`, async ({
    page,
  }) => {
    const diagnostics = watchPageDiagnostics(page);
    const response = await page.goto(entry.route, { waitUntil: "domcontentloaded" });

    expect(response?.status()).toBe(200);
    await expect(page.locator("article")).toHaveAttribute("data-doc-source-key", entry.sourceKey);
    await expect(page.locator("article h1")).toHaveCount(1);
    const headingIds = await page
      .locator("article h1, article h2, article h3, article h4, article h5, article h6")
      .evaluateAll((headings) => headings.map((heading) => heading.id));
    expect(headingIds.every((id) => id.length > 0)).toBe(true);
    expect(new Set(headingIds).size).toBe(headingIds.length);

    const docsNavigation = page.locator('nav[aria-label="Documentation pages"]:visible');
    await expect(docsNavigation).toHaveCount(1);
    await expect(docsNavigation.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      entry.route,
    );
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Docs" }),
    ).toHaveAttribute("aria-current", "page");

    const paginationLinks = page
      .getByRole("navigation", { name: "Documentation pagination" })
      .getByRole("link");
    const expectedPaginationCount = Number(index > 0) + Number(index < DOCS_CATALOG.length - 1);
    await expect(paginationLinks).toHaveCount(expectedPaginationCount);
    const previousEntry = index > 0 ? DOCS_CATALOG[index - 1] : undefined;
    const nextEntry = index < DOCS_CATALOG.length - 1 ? DOCS_CATALOG[index + 1] : undefined;
    if (previousEntry) {
      const previousLink = paginationLinks.filter({ hasText: previousEntry.title });
      await expect(previousLink).toHaveAttribute("href", previousEntry.route);
      await expect(previousLink).toContainText("Previous");
    } else {
      await expect(paginationLinks.filter({ hasText: "Previous" })).toHaveCount(0);
    }
    if (nextEntry) {
      const nextLink = paginationLinks.filter({ hasText: nextEntry.title });
      await expect(nextLink).toHaveAttribute("href", nextEntry.route);
      await expect(nextLink).toContainText("Next");
    } else {
      await expect(paginationLinks.filter({ hasText: "Next" })).toHaveCount(0);
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    const refreshedIds = await page
      .locator("article h1, article h2, article h3, article h4, article h5, article h6")
      .evaluateAll((headings) => headings.map((heading) => heading.id));
    expect(refreshedIds).toEqual(headingIds);
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });
}

test("docs overview rewrites every relative Markdown source link", async ({ page }) => {
  await page.goto("/docs", { waitUntil: "domcontentloaded" });

  const sourceLinks = page.locator('article a[href^="/docs/"]');
  await expect(sourceLinks).toHaveCount(DOCS_CHILDREN.length);
  expect(
    await sourceLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(DOCS_CHILDREN.map((entry) => entry.route));
  await expect(page.locator('article [data-doc-link-rejected="true"]')).toHaveCount(0);
});

test("documentation heading permalinks are full-size standalone targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs", { waitUntil: "domcontentloaded" });
  const headings = page.locator(
    "article h1, article h2, article h3, article h4, article h5, article h6",
  );
  const permalinks = headings.locator(':scope > a[href^="#"]');

  await expect(permalinks).toHaveCount(await headings.count());
  for (const permalink of await permalinks.all()) {
    await expect(permalink).toHaveAccessibleName(/^Link to /);
    await expect
      .poll(() => permalink.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
    await expect
      .poll(() => permalink.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(44);
  }
});

test("rewritten API fragment resolves to an ID in the rendered target", async ({ page }) => {
  const target = resolveDocsLink("./API.md#generatetext-server-action", "overview");
  expect(target).toEqual({
    href: "/docs/server-interfaces#generatetext-server-action",
    kind: "internal",
  });
  if (!target.href) throw new Error("Expected the allowlisted API fragment to resolve.");

  await page.goto(target.href, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#generatetext-server-action")).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#generatetext-server-action");
});

test("docs external repository links are identifiable and isolated", async ({ page }) => {
  await page.goto("/docs/development", { waitUntil: "domcontentloaded" });

  const contributionGuide = page
    .locator("article")
    .getByRole("link", { name: /CONTRIBUTING\.md.*opens in a new tab/i });
  await expect(contributionGuide).toHaveAttribute("target", "_blank");
  await expect(contributionGuide).toHaveAttribute("rel", /noopener/);
  await expect(contributionGuide).toHaveAttribute("rel", /noreferrer/);
});

test("unknown docs route is a noindex 404 and never enters the sitemap", async ({
  page,
  request,
}) => {
  const response = await page.goto("/docs/nope", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain(toCanonicalUrl("/docs/nope"));
});

test("docs HTML and Mermaid fallback stay complete without JavaScript", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL: String(testInfo.project.use.baseURL),
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  const response = await page.goto("/docs/architecture", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  await expect(page.locator("article h1")).toContainText("Architecture");
  await expect(page.locator("article")).toContainText("Rendering and feature boundary");
  await expect(page.locator('[data-mermaid-source="true"]')).toContainText("flowchart LR");
  await expect(page.locator('[data-mermaid-rendered="true"]')).toHaveCount(0);
  await context.close();
});

test("Mermaid failure keeps source visible and retry starts a fresh safe attempt", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, "IntersectionObserver");
  });
  await page.goto("/docs/architecture", { waitUntil: "networkidle" });

  const diagram = page.locator("[data-mermaid-diagram]").first();
  await expect(diagram.locator('[data-mermaid-source="true"]')).toContainText("flowchart LR");
  const renderButton = diagram.getByRole("button", { name: "Render diagram" });
  await expect(renderButton).toBeVisible();

  let abortedChunks = 0;
  const abortNewChunks = async (route: Route): Promise<void> => {
    abortedChunks += 1;
    await route.abort();
  };
  await page.route("**/_next/static/chunks/**", abortNewChunks);
  await renderButton.click();
  await expect(diagram.getByText("Diagram preview unavailable.")).toBeVisible();
  expect(abortedChunks).toBeGreaterThan(0);
  await expect(diagram.locator('[data-mermaid-source="true"]')).toContainText("Page");

  await page.unroute("**/_next/static/chunks/**", abortNewChunks);
  await diagram.getByRole("button", { name: "Retry diagram" }).click();
  await expect(diagram.locator('[data-mermaid-rendered="true"]')).toBeVisible();
  await expect(diagram.getByText("Diagram preview rendered.")).toBeVisible();
  await expect(diagram.locator('[data-mermaid-source="true"]')).toContainText("Page");
});

for (const viewport of [
  { width: 320, height: 760 },
  { width: 390, height: 844 },
  { width: 1_440, height: 900 },
]) {
  for (const theme of ["light", "dark"] as const) {
    test(`docs fit ${viewport.width}px in ${theme} theme`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("theme", selectedTheme);
      }, theme);
      await page.goto("/docs/components", { waitUntil: "domcontentloaded" });

      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      const articleBounds = await page.locator("article").boundingBox();
      expect(articleBounds?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((articleBounds?.x ?? 0) + (articleBounds?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );

      if (viewport.width < 1_024) {
        await expect(
          page.locator("details").filter({ hasText: "Documentation pages" }),
        ).toBeVisible();
      } else {
        await expect(page.locator('nav[aria-label="Documentation pages"]:visible')).toBeVisible();
      }
    });
  }
}

test("mobile docs navigation is keyboard reachable and exposes active state", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/docs/architecture", { waitUntil: "domcontentloaded" });

  const sectionNavigation = page.locator("details").filter({ hasText: "Documentation pages" });
  const summary = sectionNavigation.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(sectionNavigation).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(
    sectionNavigation.getByRole("link", { name: "Technical documentation" }),
  ).toBeFocused();

  const openMenu = page.getByRole("button", { name: "Open menu" });
  await expect(async () => {
    await openMenu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  }).toPass();
  const mobileDocsLink = page.locator("#mobile-navigation").getByRole("link", { name: "Docs" });
  await expect(mobileDocsLink).toHaveAttribute("aria-current", "page");
  await expect(mobileDocsLink).toHaveAttribute("href", "/docs");
});

test("footer consumes the exact internal and external project destination semantics", async ({
  page,
}) => {
  await page.goto("/docs", { waitUntil: "domcontentloaded" });
  const footer = page.locator("footer");
  const projectColumn = footer.getByText("Project", { exact: true }).locator("..");

  for (const projectLink of PROJECT_LINKS) {
    const link = projectColumn.locator(`a[href="${projectLink.siteHref}"]`).filter({
      hasText: projectLink.label,
    });
    await expect(link).toHaveCount(1);
    if (projectLink.kind === "external") {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link).toContainText("↗");
    } else {
      await expect(link).not.toHaveAttribute("target", "_blank");
    }
  }

  await expect(footer.locator("iframe")).toHaveCount(0);
  const hallOfFame = projectColumn.locator('a[href="https://astraa.notion.site/documentation"]');
  await expect(hallOfFame).toContainText("Hall of Fame");
  await expect(hallOfFame).not.toContainText(/Docs|Blog/);
});
