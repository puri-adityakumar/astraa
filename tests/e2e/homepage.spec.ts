import { expect, test, type Locator } from "@playwright/test";

import {
  HOME_CATALOG_COUNTS,
  HOME_FEATURED_TOOLS,
  HOME_PLANNED_GAMES,
  HOME_PLANNED_TOOLS,
} from "../../components/home/home-content";
import { SITE_NAME } from "../../lib/seo/site";
import { watchPageDiagnostics } from "./test-helpers";

const MAIN_NAVIGATION_LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/docs", label: "Docs" },
  { href: "/contribute", label: "Contribute" },
] as const;
const RESPONSIVE_WIDTHS = [320, 390, 768, 1024, 1440] as const;

test("homepage content and real tool links are present in server HTML", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const html = await response.text();

  expect(html).toContain("Format JSON. Resize images. Keep moving.");
  expect(html).toContain("data-home-product-proof");
  expect(html).toContain("data-home-workflow-svg");
  expect(html).toContain("data-workflow-html-equivalent");
  expect(html).toContain("Open source, with a contribution path.");
  for (const tool of HOME_FEATURED_TOOLS) {
    expect(html).toContain(tool.name);
    expect(html).toContain(`href="${tool.path}"`);
  }
});

test("homepage primary actions and desktop navigation have exact destinations", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const diagnostics = watchPageDiagnostics(page);
  await page.goto("/", { waitUntil: "networkidle" });

  const title = await page.title();
  expect(title.endsWith(`| ${SITE_NAME}`)).toBe(true);
  expect(title.match(new RegExp(SITE_NAME, "gi"))?.length ?? 0).toBe(1);

  const primaryActions = page.locator("main [data-home-primary]");
  await expect(primaryActions).toHaveCount(2);
  expect(
    await primaryActions.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(["/tools", "/tools"]);

  const secondaryCatalog = page.getByRole("link", { name: "View the combined catalog" });
  await expect(secondaryCatalog).toHaveAttribute("href", "/explore");
  await expect(page.locator("main a[href^='/'] .lucide-arrow-up-right")).toHaveCount(0);

  const desktopLinks = page.locator('[data-main-navigation-links="desktop"] > a');
  await expect(desktopLinks).toHaveCount(MAIN_NAVIGATION_LINKS.length);
  expect(await readLinkContract(desktopLinks)).toEqual(MAIN_NAVIGATION_LINKS);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", {
      name: "Explore",
    }),
  ).toHaveCount(0);

  for (const link of MAIN_NAVIGATION_LINKS) {
    expect((await request.get(link.href)).status()).toBeLessThan(400);
  }
  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

test("mobile menu preserves exact navigation, Escape behavior, and secondary Explore access", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(async () => {
    await menuButton.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  }).toPass();
  const mobileLinks = page.locator('[data-main-navigation-links="mobile"] > a');
  await expect(mobileLinks).toHaveCount(MAIN_NAVIGATION_LINKS.length);
  for (const [index, link] of MAIN_NAVIGATION_LINKS.entries()) {
    await expect(mobileLinks.nth(index)).toHaveAccessibleName(link.label);
    await expect(mobileLinks.nth(index)).toHaveAttribute("href", link.href);
  }
  expect(await mobileLinks.allTextContents()).toEqual(
    MAIN_NAVIGATION_LINKS.map((link) => link.label),
  );
  await expect(
    page.locator("#mobile-navigation").getByRole("link", { name: "Explore" }),
  ).toHaveCount(0);

  await mobileLinks.first().focus();
  await expect(mobileLinks.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await expect(menuButton).toBeFocused();
  await expect(page.getByRole("link", { name: "View the combined catalog" })).toHaveAttribute(
    "href",
    "/explore",
  );

  await menuButton.click();
  await page
    .locator("#mobile-navigation")
    .getByRole("button", { name: "Open command menu" })
    .click();
  await page.getByRole("combobox", { name: "Search input" }).fill("JSON");
  await page.getByRole("option", { name: "JSON Editor" }).click();
  await expect(page).toHaveURL(/\/tools\/json$/);
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("theme control keeps identical server-placeholder and hydrated geometry", async ({
  browser,
  page,
}, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const hydratedBounds = await page
    .getByRole("radiogroup", { name: "Select display theme" })
    .boundingBox();

  const noScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  const placeholderBounds = await noScriptPage
    .locator("[data-theme-toggle-placeholder]")
    .boundingBox();

  expect(hydratedBounds).not.toBeNull();
  expect(placeholderBounds).not.toBeNull();
  expect({ height: hydratedBounds?.height, width: hydratedBounds?.width }).toEqual({
    height: 50,
    width: 138,
  });
  expect({ height: placeholderBounds?.height, width: placeholderBounds?.width }).toEqual({
    height: hydratedBounds?.height,
    width: hydratedBounds?.width,
  });

  await noScriptContext.close();
});

test("featured cards and catalog counts stay registry-derived", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const toolCards = page.locator("[data-home-tool-card]");
  await expect(toolCards).toHaveCount(HOME_FEATURED_TOOLS.length);
  for (const tool of HOME_FEATURED_TOOLS) {
    const card = page.locator(`[data-home-tool-card="${tool.id}"]`);
    await expect(card).toHaveAttribute("href", tool.path);
    await expect(card).toContainText(tool.name);
    await expect(card).toContainText(tool.description);
    await expect(card).toContainText(
      tool.processing === "local" ? "In browser" : "Provider-backed",
    );
    expect((await request.get(tool.path)).status()).toBe(200);
  }

  await expect(page.getByText("In-browser tools", { exact: true }).locator("..")).toContainText(
    String(HOME_CATALOG_COUNTS.local),
  );
  await expect(
    page.getByText("Provider-backed tools", { exact: true }).locator(".."),
  ).toContainText(String(HOME_CATALOG_COUNTS.providerBacked));
  await expect(page.getByRole("heading", { name: /^Planned tools/ })).toContainText(
    String(HOME_CATALOG_COUNTS.plannedTools),
  );
  await expect(page.getByRole("heading", { name: /^Planned games/ })).toContainText(
    String(HOME_CATALOG_COUNTS.plannedGames),
  );
  const availableGameCopy = `${HOME_CATALOG_COUNTS.availableGames} browser ${
    HOME_CATALOG_COUNTS.availableGames === 1 ? "game is" : "games are"
  } playable now.`;
  await expect(page.locator("main")).toContainText(availableGameCopy);
});

test("planned homepage entries are text, never launchable controls", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const plannedEntries = page.locator("[data-home-planned-entry]");
  const registryEntries = [...HOME_PLANNED_TOOLS, ...HOME_PLANNED_GAMES];

  await expect(plannedEntries).toHaveCount(registryEntries.length);
  for (const entry of registryEntries) {
    const planned = page.locator(`[data-home-planned-entry="${entry.id}"]`);
    await expect(planned).toHaveText(entry.name);
    await expect(planned.locator("a, button, [role='link'], [tabindex]")).toHaveCount(0);
    expect(
      await planned.evaluate((element) => element.closest("a, button, [role='link']")),
    ).toBeNull();
  }
});

test("homepage stays ordered, reachable, and overflow-free across target widths", async ({
  page,
}) => {
  for (const width of RESPONSIVE_WIDTHS) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `horizontal overflow at ${width}px`,
    ).toBe(true);

    const headingLevels = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(
      headingLevels.filter((level) => level === 1),
      `H1 count at ${width}px`,
    ).toHaveLength(1);
    expect(headingLevels[0], `first heading at ${width}px`).toBe(1);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(
        headingLevels[index] - headingLevels[index - 1],
        `heading jump at ${width}px index ${index}`,
      ).toBeLessThanOrEqual(1);
    }

    const undersizedControls = await page
      .locator("header a, header button, main a, main button")
      .evaluateAll((controls) =>
        controls
          .filter((control) => control.getClientRects().length > 0)
          .map((control) => {
            const bounds = control.getBoundingClientRect();
            return {
              height: bounds.height,
              label: control.getAttribute("aria-label") ?? control.textContent?.trim(),
              width: bounds.width,
            };
          })
          .filter((control) => control.height < 44 || control.width < 44),
      );
    expect(undersizedControls, `undersized controls at ${width}px`).toEqual([]);
  }
});

test("390 by 844 shows the primary action and a real tool without scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);

  const primary = page.locator('[data-home-primary="hero"]');
  const firstTool = page.locator('nav[aria-label="Start with a tool"] a').first();
  for (const affordance of [primary, firstTool]) {
    await expect(affordance).toBeVisible();
    expect(await isFullyInsideViewport(affordance)).toBe(true);
  }

  await primary.focus();
  await expect(primary).toBeFocused();
  expect(
    await primary.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);
});

test("workflow SVG has fixed geometry, finite property-safe motion, and an HTML equivalent", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const svg = page.locator("[data-home-workflow-svg]");
  await expect(svg).toHaveAttribute("width", "640");
  await expect(svg).toHaveAttribute("height", "260");
  await expect(svg).toHaveAttribute("viewBox", "0 0 640 260");
  await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(svg).toHaveAttribute("focusable", "false");
  await expect(svg.locator("image, animate, animateMotion, animateTransform, a")).toHaveCount(0);

  const equivalent = page.locator("[data-workflow-html-equivalent]");
  await expect(equivalent).toContainText("Bring the small task");
  await expect(equivalent).toContainText("See where processing happens");
  await expect(equivalent).toContainText("Use the result");
  await expect(equivalent).toContainText("Provider-backed");

  const animationAudit = await svg.evaluate((element) =>
    element.getAnimations({ subtree: true }).map((animation) => {
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect)) return { iterations: null, properties: [] };
      const ignoredKeys = new Set(["composite", "computedOffset", "easing", "offset"]);
      return {
        iterations: effect.getTiming().iterations,
        properties: [
          ...new Set(effect.getKeyframes().flatMap((frame) => Object.keys(frame))),
        ].filter((property) => !ignoredKeys.has(property)),
      };
    }),
  );
  expect(animationAudit.length).toBeGreaterThan(0);
  for (const animation of animationAudit) {
    expect(animation.iterations).toBe(1);
    expect(
      animation.properties.every((property) => ["opacity", "transform"].includes(property)),
    ).toBe(true);
  }
});

test("light and dark themes keep homepage content and workflow visible", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const theme of ["light", "dark"] as const) {
    const control = page.getByRole("radio", { name: `Use ${theme} theme` });
    await control.click();
    await expect(control).toBeChecked();
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await expect(page.locator("[data-home-workflow-svg]")).toBeVisible();
    const colors = await page.locator("body").evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, foreground: style.color };
    });
    expect(colors.background).not.toBe(colors.foreground);
  }
});

test("homepage story and primary links remain usable without JavaScript", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const baseURL = String(testInfo.project.use.baseURL);

  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Format JSON. Resize images. Keep moving.",
  );
  await expect(page.locator("[data-workflow-html-equivalent]")).toBeVisible();
  await expect(page.locator("[data-home-tool-card]")).toHaveCount(HOME_FEATURED_TOOLS.length);
  const primaryActions = page.locator("main [data-home-primary]");
  await expect(primaryActions).toHaveCount(2);
  expect(
    await primaryActions.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(["/tools", "/tools"]);

  await context.close();
});

async function readLinkContract(
  links: Locator,
): Promise<Array<{ href: string | null; label: string }>> {
  return links.evaluateAll((elements) =>
    elements.map((element) => ({
      href: element.getAttribute("href"),
      label: element.textContent?.trim() ?? "",
    })),
  );
}

async function isFullyInsideViewport(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return (
      bounds.top >= 0 &&
      bounds.left >= 0 &&
      bounds.right <= document.documentElement.clientWidth &&
      bounds.bottom <= innerHeight
    );
  });
}
