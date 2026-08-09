import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { availableGames, comingSoonGames } from "../../lib/games";
import { MEMORY_PAIRS } from "../../lib/games/memory/engine";
import { getIndexablePaths, toCanonicalUrl } from "../../lib/seo/site";
import { watchPageDiagnostics } from "./test-helpers";

const RESOLUTION_WAIT_MS = 900;
const PAIR_POSITIONS = [
  [1, 3],
  [2, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [11, 12],
  [13, 14],
  [15, 16],
] as const;
const RESOLUTION_SCENARIOS = [
  { kind: "matching", secondPosition: 3 },
  { kind: "mismatching", secondPosition: 2 },
] as const;

test.describe("Memory game", () => {
  test("Memory pointer flow handles mismatch, match, rapid input, and local-only work", async ({
    page,
  }, testInfo) => {
    const diagnostics = watchPageDiagnostics(page);
    const configuredBaseURL = testInfo.project.use.baseURL;
    if (typeof configuredBaseURL !== "string") {
      throw new Error("Memory local-only coverage requires a configured Playwright baseURL.");
    }
    const pageOrigin = new URL(configuredBaseURL).origin;
    const externalRequests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== pageOrigin) externalRequests.push(request.url());
    });
    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await startMemoryGame(page);

    await memoryCard(page, 1).click();
    await expect(memoryCard(page, 1)).toHaveAccessibleName("Card 1, Circle, revealed");
    await memoryCard(page, 2).click();
    await memoryCard(page, 5).dispatchEvent("click");
    await expect(memoryCard(page, 5)).toHaveAccessibleName("Card 5, hidden");
    await expectMemoryPhase(page, "playing");
    await expect(memoryCard(page, 1)).toHaveAccessibleName("Card 1, hidden");
    await expect(memoryCard(page, 2)).toHaveAccessibleName("Card 2, hidden");
    await expect(memoryCard(page, 1)).toBeFocused();
    await expectProgress(page, 1, 0);

    await memoryCard(page, 1).click();
    await memoryCard(page, 3).click();
    await expect(memoryCard(page, 1)).toHaveAttribute("data-memory-card-state", "matched");
    await expect(memoryCard(page, 3)).toHaveAttribute("data-memory-card-state", "matched");
    await expectProgress(page, 2, 1);
    await expect(
      page.getByText("Circle matched. 1 of 8 pairs found.", { exact: true }),
    ).toBeVisible();

    await expect(memoryCard(page, 2)).toBeFocused();
    await expect(memoryCard(page, 2)).toHaveAttribute("tabindex", "0");
    const matchedCardBounds = await memoryCard(page, 1).boundingBox();
    expect(matchedCardBounds).not.toBeNull();
    if (!matchedCardBounds) throw new Error("Matched Memory card must have pointer bounds.");
    await page.mouse.click(
      matchedCardBounds.x + matchedCardBounds.width / 2,
      matchedCardBounds.y + matchedCardBounds.height / 2,
    );
    await expect(memoryCard(page, 1)).toBeFocused();
    await expect(memoryCard(page, 1)).toHaveAttribute("tabindex", "-1");
    await expect(memoryCard(page, 2)).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("Tab");
    await expect(memoryCard(page, 2)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(memoryCard(page, 4)).toBeFocused();

    expect(externalRequests).toEqual([]);
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });

  test("Memory reset cancel preserves an exact pending mismatch", async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await beginTimedResolution(page, 2);
    const beforeDialog = await readMemorySnapshot(page);

    await page.getByRole("button", { name: "Reset game" }).click();
    const dialog = page.getByRole("alertdialog", { name: "Start a new round?" });
    await expect(dialog).toBeVisible();
    await page.clock.fastForward(RESOLUTION_WAIT_MS);
    expect(await readMemorySnapshot(page)).toEqual(beforeDialog);

    await dialog.getByRole("button", { name: "Keep playing" }).click();
    await expect(dialog).toBeHidden();
    expect(await readMemorySnapshot(page)).toEqual(beforeDialog);
    await page.clock.fastForward(RESOLUTION_WAIT_MS);
    await expectMemoryPhase(page, "playing");
    await expectProgress(page, 1, 0);
    await expect(memoryCard(page, 1)).toBeFocused();
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });

  for (const { kind, secondPosition } of RESOLUTION_SCENARIOS) {
    test(`Memory confirmed reset cancels a pending ${kind} resolution`, async ({ page }) => {
      const diagnostics = watchPageDiagnostics(page);
      await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
      await beginTimedResolution(page, secondPosition);
      const oldRound = Number(
        await page.locator("[data-memory-game]").getAttribute("data-memory-round"),
      );

      await page.getByRole("button", { name: "Reset game" }).click();
      await page
        .getByRole("alertdialog", { name: "Start a new round?" })
        .getByRole("button", { name: "Start new round" })
        .click();

      await expectMemoryPhase(page, "playing");
      await expect(page.locator("[data-memory-game]")).toHaveAttribute(
        "data-memory-round",
        String(oldRound + 1),
      );
      await expectProgress(page, 0, 0);
      await expect(memoryCard(page, 1)).toBeFocused();
      await expect(page.locator('[data-memory-card-state="hidden"]')).toHaveCount(16);
      const resetSnapshot = await readMemorySnapshot(page);

      await page.clock.fastForward(RESOLUTION_WAIT_MS);
      expect(await readMemorySnapshot(page)).toEqual(resetSnapshot);
      await expectProgress(page, 0, 0);
      await expect(memoryCard(page, 1)).toBeFocused();
      await expect(page.locator('[data-memory-card-state="hidden"]')).toHaveCount(16);
      expect(diagnostics.failures).toEqual([]);
      diagnostics.stop();
    });

    test(`Memory ${kind} timer cleanup survives a client-navigation unmount`, async ({ page }) => {
      const diagnostics = watchPageDiagnostics(page);
      await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
      await beginTimedResolution(page, secondPosition);

      await page.locator('a[href="/games"]').first().click();
      await expect(page).toHaveURL(/\/games$/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Play browser games" }),
      ).toBeVisible();
      await expect(page.locator("[data-memory-game]")).toHaveCount(0);

      await page.clock.fastForward(RESOLUTION_WAIT_MS);
      await expect(
        page.getByRole("heading", { level: 1, name: "Play browser games" }),
      ).toBeVisible();
      await expect(page.locator("[data-memory-game]")).toHaveCount(0);
      expect(diagnostics.failures).toEqual([]);
      diagnostics.stop();
    });
  }

  test("Memory supports roving arrows and Tab without trapping, then completes by keyboard", async ({
    page,
  }) => {
    const diagnostics = watchPageDiagnostics(page);
    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await startMemoryGame(page);
    await expect(memoryCard(page, 1)).toBeFocused();

    const rovingCard = page.locator('[data-memory-card][tabindex="0"]');
    await expect(rovingCard).toHaveCount(1);
    await page.keyboard.press("ArrowDown");
    await expect(memoryCard(page, 5)).toBeFocused();
    await expect(rovingCard).toHaveAttribute("data-memory-card", "5");
    await page.keyboard.press("ArrowUp");
    await expect(memoryCard(page, 1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(memoryCard(page, 2)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(memoryCard(page, 1)).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Reset game" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(memoryCard(page, 1)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-memory-card]:focus")).toHaveCount(0);
    await page.keyboard.press("Shift+Tab");
    await expect(memoryCard(page, 1)).toBeFocused();

    for (const [pairIndex, [firstPosition, secondPosition]] of PAIR_POSITIONS.entries()) {
      await expect(memoryCard(page, firstPosition)).toBeFocused();
      await page.keyboard.press(pairIndex % 2 === 0 ? "Enter" : "Space");
      await moveFocusRightTo(page, secondPosition);
      await page.keyboard.press(pairIndex % 2 === 0 ? "Space" : "Enter");

      await expect(memoryCard(page, firstPosition)).toHaveAttribute(
        "data-memory-card-state",
        "matched",
      );
      await expect(memoryCard(page, secondPosition)).toHaveAttribute(
        "data-memory-card-state",
        "matched",
      );
    }

    const completionHeading = page.getByRole("heading", { name: "All pairs matched" });
    await expectMemoryPhase(page, "complete");
    await expect(completionHeading).toBeFocused();
    await expect(
      page.getByText("Triangle matched. 8 of 8 pairs found.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("You completed the round in 8 moves.")).toBeVisible();
    await expectProgress(page, 8, 8);

    await page.getByRole("button", { name: "Play again" }).click();
    await expectMemoryPhase(page, "playing");
    await expectProgress(page, 0, 0);
    await expect(memoryCard(page, 1)).toBeFocused();
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });

  test("Memory hard refresh returns to one hydration-safe ready shell", async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });

    await expectReadyShell(page);
    await startMemoryGame(page);
    await memoryCard(page, 1).click();
    await memoryCard(page, 3).click();
    await expectMemoryPhase(page, "resolving");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectReadyShell(page);
    await page.waitForTimeout(RESOLUTION_WAIT_MS);
    await expectReadyShell(page);

    await startMemoryGame(page);
    await memoryCard(page, 1).click();
    await expect(memoryCard(page, 1)).toHaveAccessibleName("Card 1, Circle, revealed");
    expect(diagnostics.failures).toEqual([]);
    diagnostics.stop();
  });

  test("Memory board has named controls and no high-impact axe findings", async ({ page }) => {
    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await startMemoryGame(page);

    for (let position = 1; position <= 16; position += 1) {
      await expect(memoryCard(page, position)).toHaveAccessibleName(`Card ${position}, hidden`);
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      ),
    ).toEqual([]);
  });

  for (const { theme, width } of [
    { theme: "light", width: 320 },
    { theme: "dark", width: 320 },
    { theme: "light", width: 390 },
    { theme: "dark", width: 390 },
  ] as const) {
    test(`Memory fits ${width}px in ${theme} mode with 44px targets`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
      await selectMobileTheme(page, theme);
      await startMemoryGame(page);

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      const targetSizes = await page.locator("[data-memory-card]").evaluateAll((cards) =>
        cards.map((card) => {
          const bounds = card.getBoundingClientRect();
          return { height: bounds.height, width: bounds.width };
        }),
      );
      for (const size of targetSizes) {
        expect(size.height).toBeGreaterThanOrEqual(44);
        expect(size.width).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test("Memory supports touch activation at 390px", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      baseURL: String(testInfo.project.use.baseURL),
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const diagnostics = watchPageDiagnostics(page);

    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await expect(async () => {
      await page.getByRole("button", { name: "Start game" }).tap();
      await expectMemoryPhase(page, "playing");
    }).toPass();
    await memoryCard(page, 1).tap();
    await memoryCard(page, 3).tap();
    await expect(memoryCard(page, 1)).toHaveAttribute("data-memory-card-state", "matched");
    await expectProgress(page, 1, 1);
    expect(diagnostics.failures).toEqual([]);

    diagnostics.stop();
    await context.close();
  });

  test("Memory is the sole indexed game and six peers remain fail-closed", async ({ page }) => {
    expect(availableGames.map((game) => game.id)).toEqual(["memory"]);
    expect(comingSoonGames).toHaveLength(6);
    expect(getIndexablePaths()).toContain("/games");
    expect(getIndexablePaths()).toContain("/games/memory");

    for (const catalogPath of ["/games", "/explore"]) {
      await page.goto(catalogPath, { waitUntil: "domcontentloaded" });
      const gameLinks = page.locator('main a[href^="/games/"]');
      await expect(gameLinks).toHaveCount(1);
      await expect(gameLinks).toHaveAttribute("href", "/games/memory");

      for (const game of comingSoonGames) {
        const card = page.locator("article").filter({
          has: page.getByRole("heading", { name: game.name, exact: true }),
        });
        await expect(card).toHaveCount(1);
        await expect(card.locator("a, button, [tabindex]")).toHaveCount(0);
      }
    }

    await page.goto("/games/memory", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      toCanonicalUrl("/games/memory"),
    );
    const memoryRobots = page.locator('meta[name="robots"]');
    if ((await memoryRobots.count()) > 0) {
      await expect(memoryRobots).not.toHaveAttribute("content", /noindex/i);
    }

    for (const game of comingSoonGames) {
      expect(getIndexablePaths()).not.toContain(game.path);
      const response = await page.goto(game.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${game.name} is planned`);
      await expect(page.locator("[data-memory-game]")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Browse available games" })).toHaveAttribute(
        "href",
        "/games",
      );
      await expect(page.getByRole("link", { name: "View full catalog" })).toHaveAttribute(
        "href",
        "/explore",
      );
      await expect(page.locator("main a")).toHaveCount(2);
      await expect(page.locator("main button, main [tabindex]")).toHaveCount(0);
    }
  });
});

function memoryCard(page: Page, position: number): Locator {
  return page.locator(`[data-memory-card="${position}"]`);
}

async function startMemoryGame(page: Page): Promise<void> {
  await expect(async () => {
    await page.getByRole("button", { name: "Start game" }).click();
    await expectMemoryPhase(page, "playing");
  }).toPass();
  await expect(page.locator("[data-memory-card]")).toHaveCount(MEMORY_PAIRS.length * 2);
}

async function beginTimedResolution(page: Page, secondPosition: number): Promise<void> {
  await startMemoryGame(page);
  await memoryCard(page, 1).click();
  await page.clock.install();
  await memoryCard(page, secondPosition).click();
  await expectMemoryPhase(page, "resolving");
}

async function expectMemoryPhase(page: Page, phase: string): Promise<void> {
  await expect(page.locator("[data-memory-game]")).toHaveAttribute("data-memory-phase", phase);
}

async function expectProgress(page: Page, moves: number, matches: number): Promise<void> {
  await expect(page.locator('[role="status"] .sr-only')).toContainText(
    `Game progress: ${moves} moves, ${matches} of ${MEMORY_PAIRS.length} matches.`,
  );
}

async function moveFocusRightTo(page: Page, position: number): Promise<void> {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    if (await memoryCard(page, position).evaluate((card) => card === document.activeElement))
      return;
    await page.keyboard.press("ArrowRight");
  }
  await expect(memoryCard(page, position)).toBeFocused();
}

async function expectReadyShell(page: Page): Promise<void> {
  await expectMemoryPhase(page, "ready");
  await expect(page.getByRole("heading", { level: 1, name: "Memory Game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  await expect(page.locator("[data-memory-grid]")).toHaveCount(0);
}

async function readMemorySnapshot(page: Page): Promise<unknown> {
  return page.locator("[data-memory-game]").evaluate((game) => ({
    announcement: game.querySelector("[role='status'] .sr-only")?.textContent,
    cards: [...game.querySelectorAll("[data-memory-card]")].map((card) => ({
      label: card.getAttribute("aria-label"),
      state: card.getAttribute("data-memory-card-state"),
    })),
    phase: game.getAttribute("data-memory-phase"),
    progress: game.querySelector("[role='status']")?.textContent,
    round: game.getAttribute("data-memory-round"),
  }));
}

async function selectMobileTheme(page: Page, theme: "dark" | "light"): Promise<void> {
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await expect(async () => {
    await openMenu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  }).toPass();

  const themeControl = page.getByRole("radio", { name: `Use ${theme} theme` });
  await themeControl.click();
  await expect(themeControl).toBeChecked();
}
