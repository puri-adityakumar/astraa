import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { DOCS_PATHS } from "../../lib/docs/catalog";
import { availableGames, comingSoonGames } from "../../lib/games";
import { getIndexablePaths } from "../../lib/seo/site";
import { availableTools, comingSoonTools } from "../../lib/tools";
import { installDefaultProviderFixtures, watchPageDiagnostics } from "./test-helpers";

const ACCESSIBILITY_ROUTES = [
  ...new Set([
    ...getIndexablePaths(),
    "/games",
    ...comingSoonTools.map((tool) => tool.path),
    ...comingSoonGames.map((game) => game.path),
    "/this-route-does-not-exist",
  ]),
];
const PNG_FIXTURE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6B9sAAAAASUVORK5CYII=",
  "base64",
);

test.beforeEach(async ({ page }) => {
  await installDefaultProviderFixtures(page);
});

for (const routePath of ACCESSIBILITY_ROUTES) {
  test(`${routePath} has no serious or critical WCAG 2.2 violations`, async ({ page }) => {
    await page.goto(routePath, { waitUntil: "domcontentloaded" });
    await selectLightTheme(page);
    await expect(page.locator("h1")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const highImpactViolations = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(highImpactViolations, formatViolations(highImpactViolations)).toEqual([]);
  });
}

test("accessibility matrix includes every available and planned route", () => {
  for (const docsPath of DOCS_PATHS) expect(ACCESSIBILITY_ROUTES).toContain(docsPath);
  for (const tool of availableTools) expect(ACCESSIBILITY_ROUTES).toContain(tool.path);
  for (const tool of comingSoonTools) expect(ACCESSIBILITY_ROUTES).toContain(tool.path);
  for (const game of availableGames) expect(ACCESSIBILITY_ROUTES).toContain(game.path);
  for (const game of comingSoonGames) expect(ACCESSIBILITY_ROUTES).toContain(game.path);
});

test("skip link is visible on focus and moves focus to main", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("radio", { name: "Use system theme" })).toBeVisible();
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  await expect(skipLink).toBeFocused();
  await expect
    .poll(() =>
      skipLink.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top >= 0 && bounds.bottom <= window.innerHeight;
      }),
    )
    .toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("command menu traps focus, closes, and restores its opener", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("radio", { name: "Use system theme" })).toBeVisible();
  const opener = page.getByRole("button", { name: "Open command menu" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Search tools and games" });

  await expect(dialog).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Search input" })).toBeFocused();
  for (let index = 0; index < 6; index += 1) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(
    await opener.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return style.outlineStyle !== "none" || style.boxShadow !== "none";
    }),
  ).toBe(true);
});

test("external links disclose new tabs and footer avatars meet touch size", async ({ page }) => {
  for (const routePath of ["/", "/contribute", "/docs"]) {
    await page.goto(routePath, { waitUntil: "domcontentloaded" });
    const externalLinks = page.locator('a[target="_blank"]');
    expect(await externalLinks.count()).toBeGreaterThan(0);
    for (const link of await externalLinks.all()) {
      await expect(link).toHaveAccessibleName(/opens in a new tab/i);
    }
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const contributorLinks = page.locator('footer a[aria-label*="GitHub profile"]');
  expect(await contributorLinks.count()).toBeGreaterThan(0);
  for (const link of await contributorLinks.all()) {
    const rect = await link.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { height: bounds.height, width: bounds.width };
    });
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.width).toBeGreaterThanOrEqual(44);
  }
});

test("visible buttons on every available tool route have accessible names", async ({ page }) => {
  for (const routePath of availableTools.map((tool) => tool.path)) {
    await page.goto(routePath, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    const buttons = page.locator("button:visible");
    for (let index = 0; index < (await buttons.count()); index += 1) {
      await expect(buttons.nth(index)).toHaveAccessibleName(/\S/);
    }
  }
});

test("related tool navigation uses full-size internal targets", async ({ page }) => {
  await page.goto("/tools/json", { waitUntil: "domcontentloaded" });
  const related = page.getByRole("complementary", { name: "Related tools" });
  const links = related.getByRole("link");
  const linkCount = await links.count();

  expect(linkCount).toBeGreaterThan(1);
  for (const link of await links.all()) {
    await expect
      .poll(() => link.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
    await expect
      .poll(() => link.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(44);
  }
  await expect(related.locator(".lucide-arrow-right")).toHaveCount(linkCount);
  await expect(related.locator(".lucide-arrow-up-right")).toHaveCount(0);
});

test("core tool fields and composite controls expose accessible labels and state", async ({
  page,
}) => {
  await page.goto("/tools/password", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  await expect(page.getByRole("slider", { name: "Password length" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Numbers" })).toBeVisible();
  const modeGroup = page.getByRole("group", { name: "Choose password type" });
  await expect(modeGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Random", pressed: true })).toBeVisible();
  await page.getByRole("button", { name: "Memorable" }).click();
  await expect(modeGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Memorable", pressed: true })).toBeVisible();

  await page.goto("/tools/currency", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("spinbutton", { name: "From" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "From currency" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Converted amount in EUR" })).toBeVisible();

  await page.goto("/tools/regex", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox", { name: "Regular expression pattern" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Test string" })).toBeVisible();

  await page.goto("/tools/hash", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  const hashAlgorithm = page.getByRole("combobox", { name: "Hash algorithm" });
  await expect(hashAlgorithm).toBeVisible();
  await expect(page.getByRole("button", { name: "About MD5" })).toBeVisible();

  await page.goto("/tools/image", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  const imageInput = page.getByLabel(/Choose an image to resize/i);
  const width = page.getByRole("spinbutton", { name: "Width" });
  const height = page.getByRole("spinbutton", { name: "Height" });
  const format = page.getByRole("combobox", { name: "Format" });
  const quality = page.getByRole("slider", { name: "JPEG/WebP quality" });
  await expect(imageInput).toBeVisible();
  await expect(width).toBeDisabled();
  await expect(height).toBeDisabled();
  await expect(format).toBeVisible();
  await expect(quality).toBeDisabled();
  await imageInput.setInputFiles({
    name: "fixture.png",
    mimeType: "image/png",
    buffer: PNG_FIXTURE,
  });
  await expect(width).toBeEnabled();
  await expect(height).toBeEnabled();
  await expect(format).toBeVisible();
  await expect(quality).toBeEnabled();

  await page.goto("/tools/snippet-generator", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  const snippetMode = page.getByRole("group", { name: "Snippet mode" });
  await expect(snippetMode.locator('[aria-pressed="true"]')).toHaveCount(1);
  for (const mode of ["Code", "Screenshot"]) {
    const modeButton = snippetMode.getByRole("button", { name: mode, exact: true });
    await expect(modeButton).toContainText(mode);
    await expect
      .poll(() => modeButton.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(44);
  }
  await snippetMode.getByRole("button", { name: "Screenshot", exact: true }).click();
  await expect(
    snippetMode.getByRole("button", { name: "Screenshot", exact: true, pressed: true }),
  ).toBeVisible();
  await snippetMode.getByRole("button", { name: "Code", exact: true }).click();
  await expect(
    snippetMode.getByRole("button", { name: "Code", exact: true, pressed: true }),
  ).toBeVisible();
  await expect(page.getByRole("slider", { name: "Font size" })).toBeVisible();
  await page.getByRole("tab", { name: "Gradient" }).click();
  await expect(page.getByRole("slider", { name: "Gradient angle" })).toBeVisible();
  await persistSnippetImageBackground(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("slider", { name: "Background image opacity" })).toBeVisible();
});

test("unit and calculator results announce only committed values", async ({ page }) => {
  await page.goto("/tools/units", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  await page.getByRole("button", { name: "Temperature", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Convert Temperature" })).toBeVisible();
  const sourceAmount = page.getByRole("spinbutton", { name: "Source amount" });
  await expect(page.getByRole("combobox", { name: "Source unit" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Destination amount" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Destination unit" })).toBeVisible();
  const conversionStatus = page.getByRole("status", { name: "Conversion result" });
  await expect(conversionStatus).toContainText(/Fahrenheit/i);
  const committedStatus = (await conversionStatus.textContent()) ?? "";
  await sourceAmount.fill("10");
  await page.waitForTimeout(400);
  await expect(conversionStatus).toHaveText(committedStatus);
  await sourceAmount.fill("100");
  await page.waitForTimeout(400);
  await expect(conversionStatus).toHaveText(committedStatus);
  await sourceAmount.blur();
  await expect(conversionStatus).toContainText(/212.*Fahrenheit/i);

  await page.goto("/tools/calculator", { waitUntil: "domcontentloaded" });
  await proveHydration(page);
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.getByRole("button", { name: "+", exact: true }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  const calculatorResult = page.getByRole("status", { name: "Calculator result" });
  await expect(calculatorResult).toHaveText("");
  await page.getByRole("button", { name: "=", exact: true }).click();
  await expect(calculatorResult).toHaveText("2 + 3 = 5");
});

test("mobile unit categories use a named disclosure and restore focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/units", { waitUntil: "domcontentloaded" });
  await proveMobileHydration(page);
  const disclosure = page.getByRole("button", { name: "Categories, selected Angle" });

  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() => disclosure.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);
  await expect
    .poll(() => disclosure.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThanOrEqual(44);

  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const categories = page.getByRole("navigation", { name: "Unit categories" });
  const temperature = categories.getByRole("button", { name: "Temperature", exact: true });
  await temperature.click();
  await expect(page.getByRole("heading", { name: "Convert Temperature" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Categories, selected Temperature" }),
  ).toBeFocused();
  await expect(categories).toBeHidden();
});

test("Base64 selector groups expose one keyboard-selected state", async ({ page }) => {
  await page.goto("/tools/base64", { waitUntil: "domcontentloaded" });
  await selectLightTheme(page);

  const operationGroup = page.getByRole("group", { name: "Base64 operation" });
  await expect(operationGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  for (const button of await operationGroup.getByRole("button").all()) {
    await expect
      .poll(() => button.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole("button", { name: "Encode", pressed: true })).toBeVisible();
  const decode = operationGroup.getByRole("button", { name: "Decode", exact: true });
  await decode.focus();
  await page.keyboard.press("Enter");
  await expect(operationGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(
    operationGroup.getByRole("button", { name: "Decode", exact: true, pressed: true }),
  ).toBeFocused();

  const inputTypeGroup = page.getByRole("group", { name: "Base64 input type" });
  await expect(inputTypeGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  for (const button of await inputTypeGroup.getByRole("button").all()) {
    await expect
      .poll(() => button.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
  }
  await expect(
    inputTypeGroup.getByRole("button", { name: "Text", exact: true, pressed: true }),
  ).toBeVisible();
  const file = inputTypeGroup.getByRole("button", { name: "File", exact: true });
  await file.focus();
  await page.keyboard.press("Enter");
  await expect(inputTypeGroup.locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect(
    inputTypeGroup.getByRole("button", { name: "File", exact: true, pressed: true }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByRole("button", { name: "Encode", exact: true }).click();
  for (const id of ["base64-url-safe", "base64-wrap-76"]) {
    const checkbox = page.locator(`#${id}`);
    const label = page.locator(`label[for="${id}"]`);
    await expect
      .poll(() => checkbox.evaluate((element) => element.getBoundingClientRect().height))
      .toBe(16);
    await expect
      .poll(() => checkbox.evaluate((element) => element.getBoundingClientRect().width))
      .toBe(16);
    await expect
      .poll(() => label.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
    await label.click();
    await expect(checkbox).toBeChecked();
    await checkbox.focus();
    await page.keyboard.press("Space");
    await expect(checkbox).not.toBeChecked();
  }
});

test("JSON view selectors fit a 320 pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/tools/json", { waitUntil: "domcontentloaded" });
  await proveMobileHydration(page);

  const viewGroup = page.getByRole("group", { name: "JSON Editor view" });
  const selectors = viewGroup.getByRole("button");
  await expect(selectors).toHaveCount(4);
  await expect(viewGroup.locator('[aria-pressed="true"]')).toHaveCount(1);

  for (const selector of await selectors.all()) {
    const rect = await selector.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        height: bounds.height,
        left: bounds.left,
        right: bounds.right,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(rect.viewportWidth);
  }

  const generate = viewGroup.getByRole("button", { name: "Generate", exact: true });
  await generate.focus();
  await page.keyboard.press("Enter");
  await expect(generate).toBeFocused();
  await expect(generate).toHaveAttribute("aria-pressed", "true");
});

test("contribute actions fit inside a 390 pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contribute", { waitUntil: "domcontentloaded" });
  await proveMobileHydration(page);

  for (const name of ["Browse open issues", "Read contribution guide"]) {
    const action = page.getByRole("link", { name });
    await expect
      .poll(() =>
        action.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const clientWidth = document.documentElement.clientWidth;
          return {
            connected: element.isConnected,
            leftInsideViewport: bounds.left >= 0,
            rightInsideViewport: bounds.right <= clientWidth,
            minimumTargetHeight: bounds.height >= 44,
          };
        }),
      )
      .toEqual({
        connected: true,
        leftInsideViewport: true,
        rightInsideViewport: true,
        minimumTargetHeight: true,
      });
  }

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("reduced-motion mode leaves no repeating browser animations", async ({ page }, testInfo) => {
  await page.goto("/tools/regex", { waitUntil: "domcontentloaded" });
  const reducedProject = testInfo.project.name === "chromium-reduced-motion";

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    reducedProject,
  );
  if (!reducedProject) return;

  await expect(page.getByText("Checking safely")).toBeHidden();
  const repeatingAnimations = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations === Infinity)
      .map((animation) => animation.animationName),
  );
  expect(repeatingAnimations).toEqual([]);
});

test("homepage workflow exposes its final state in reduced-motion mode", async ({
  page,
}, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const reducedProject = testInfo.project.name === "chromium-reduced-motion";

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    reducedProject,
  );
  if (!reducedProject) return;

  const svg = page.locator("[data-home-workflow-svg]");
  await expect(svg).toBeVisible();
  const finalStates = await svg.locator(".home-workflow-step").evaluateAll((layers) =>
    layers.map((layer) => {
      const style = getComputedStyle(layer);
      return {
        animationName: style.animationName,
        opacity: style.opacity,
        transform: style.transform,
      };
    }),
  );
  expect(finalStates).toEqual([
    { animationName: "none", opacity: "1", transform: "none" },
    { animationName: "none", opacity: "1", transform: "none" },
    { animationName: "none", opacity: "1", transform: "none" },
  ]);
  expect(
    await svg.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getTiming().iterations === Infinity)
        .map((animation) => animation.animationName),
    ),
  ).toEqual([]);
  await expect(page.locator("[data-workflow-html-equivalent]")).toBeVisible();
});

test("Memory reveal stays static in reduced-motion mode", async ({ page }, testInfo) => {
  const diagnostics = watchPageDiagnostics(page);
  await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
  const reducedProject = testInfo.project.name === "chromium-reduced-motion";

  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
    reducedProject,
  );
  if (!reducedProject) {
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
    return;
  }

  await expect(async () => {
    await page.getByRole("button", { name: "Start game" }).click();
    await expect(page.locator("[data-memory-game]")).toHaveAttribute(
      "data-memory-phase",
      "playing",
    );
  }).toPass();
  const firstCard = page.locator('[data-memory-card="1"]');
  await firstCard.click();
  await expect(firstCard).toHaveAccessibleName(/^Card 1, .+, revealed$/);
  expect(
    await firstCard.evaluate((card) => {
      const style = getComputedStyle(card);
      return {
        animationName: style.animationName,
        transform: style.transform,
      };
    }),
  ).toEqual({ animationName: "none", transform: "none" });
  const disruptiveAnimations = await firstCard.evaluate((card) =>
    card
      .getAnimations({ subtree: true })
      .map((animation) => animation.effect?.getTiming())
      .filter(
        (timing) =>
          timing &&
          (timing.iterations === Infinity ||
            (typeof timing.duration === "number" && timing.duration > 16)),
      ),
  );
  expect(disruptiveAnimations).toEqual([]);
  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

test("page transitions preserve their wrapper and hydrate cleanly", async ({ page }) => {
  const diagnostics = watchPageDiagnostics(page);

  for (const routePath of ["/", "/tools/json"]) {
    await page.goto(routePath, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-page-transition]")).toHaveCount(1);
    await expect(page.getByRole("radiogroup", { name: "Select display theme" })).toBeVisible();
  }

  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

function formatViolations(
  violations: Array<{
    help: string;
    id: string;
    impact: string | null;
    nodes: Array<{ target: unknown }>;
  }>,
): string {
  return violations
    .map(
      (violation) =>
        `${violation.impact ?? "unknown"} ${violation.id}: ${violation.help}\n` +
        violation.nodes.map((node) => `  ${JSON.stringify(node.target)}`).join("\n"),
    )
    .join("\n");
}

async function persistSnippetImageBackground(page: Page): Promise<void> {
  await page.evaluate(
    async (dataUrl) =>
      new Promise<void>((resolve, reject) => {
        const openRequest = indexedDB.open("astraa-tools-db", 1);
        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onupgradeneeded = () => {
          const database = openRequest.result;
          if (!database.objectStoreNames.contains("store")) database.createObjectStore("store");
        };
        openRequest.onsuccess = () => {
          const database = openRequest.result;
          const transaction = database.transaction("store", "readwrite");
          transaction.onerror = () => reject(transaction.error);
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.objectStore("store").put(
            JSON.stringify({
              state: { background: { kind: "image", dataUrl, opacity: 0.75 } },
              version: 1,
            }),
            "snippet-generator",
          );
        };
      }),
    `data:image/png;base64,${PNG_FIXTURE.toString("base64")}`,
  );
}

async function proveHydration(page: Page): Promise<void> {
  const darkTheme = page.getByRole("radio", { name: "Use dark theme" });
  const lightTheme = page.getByRole("radio", { name: "Use light theme" });
  const target = (await darkTheme.getAttribute("aria-checked")) === "true" ? lightTheme : darkTheme;

  await expect(async () => {
    await target.click();
    await expect(target).toBeChecked();
  }).toPass();
}

async function proveMobileHydration(page: Page): Promise<void> {
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await expect(async () => {
    await openMenu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  }).toPass();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(openMenu).toBeVisible();
}

async function selectLightTheme(page: Page): Promise<void> {
  const lightTheme = page.getByRole("radio", { name: "Use light theme" });
  await expect(async () => {
    await lightTheme.click();
    await expect(lightTheme).toBeChecked();
  }).toPass();
}
