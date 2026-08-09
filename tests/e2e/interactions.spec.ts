import { expect, test, type Route } from "@playwright/test";

import {
  installDefaultProviderFixtures,
  readPersistedValue,
  watchPageDiagnostics,
} from "./test-helpers";

for (const theme of ["light", "dark", "system"] as const) {
  test(`hydrates the persisted ${theme} theme without a mismatch`, async ({ page }) => {
    const diagnostics = watchPageDiagnostics(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem("theme", selectedTheme);
    }, theme);

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("radio", { name: themeRadioName(theme) })).toBeChecked();
    await expect(page.locator("html")).toHaveClass(theme === "light" ? /light/ : /dark/);
    expect(diagnostics.failures.filter((failure) => /hydrat/i.test(failure))).toEqual([]);
    diagnostics.stop();
  });
}

test("JSON editor content survives a hard refresh", async ({ page }) => {
  const marker = "six-persisted";
  await page.goto("/tools/json", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const editor = page.getByRole("textbox", { name: "JSON editor" });

  await editor.fill(`{\n  "phase": "${marker}"\n}`);
  await expect.poll(() => readPersistedValue(page, "json-editor")).toContain(marker);
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("textbox", { name: "JSON editor" })).toContainText("six-persisted");
  await expect(page.getByRole("button", { name: "Open command menu" })).toBeEnabled();
});

test("Markdown file selection survives a hard refresh", async ({ page }) => {
  const marker = "Phase Six Persisted Markdown";
  await page.goto("/tools/markdown", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);

  await page
    .locator('input[type="file"]')
    .last()
    .setInputFiles({
      name: "phase-six.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(`# ${marker}\n\nSaved locally.`),
    });
  await expect(page.getByRole("heading", { name: marker })).toBeVisible();
  await expect.poll(() => readPersistedValue(page, "markdown-editor")).toContain(marker);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /phase-six\.md/i }).click();
  await expect(page.getByRole("heading", { name: marker })).toBeVisible();
});

test("Regex inputs survive a hard refresh", async ({ page }) => {
  await page.goto("/tools/regex", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  await page.getByRole("textbox", { name: "Regular expression pattern" }).fill("phase-(six)");
  await page.getByRole("textbox", { name: "Test string" }).fill("phase-six persisted");
  await expect
    .poll(() => readPersistedValue(page, "regex-tester"))
    .toContain("phase-six persisted");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox", { name: "Regular expression pattern" })).toHaveValue(
    "phase-(six)",
  );
  await expect(page.getByRole("textbox", { name: "Test string" })).toHaveValue(
    "phase-six persisted",
  );
  await expect(page.getByRole("button", { name: "Open command menu" })).toBeEnabled();
});

test("a pathological regex times out off the main thread", async ({ page }) => {
  await page.goto("/tools/regex", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  await page.getByRole("textbox", { name: "Regular expression pattern" }).fill("(a+)+$");
  await page.getByRole("textbox", { name: "Test string" }).fill(`${"a".repeat(30_000)}!`);

  await expect(page.getByText("Checking safely")).toBeVisible();
  await page.getByRole("radio", { name: "Use dark theme" }).click();
  await expect(page.getByRole("radio", { name: "Use dark theme" })).toBeChecked();
  await expect(page.getByText("Pattern hangs — simplify")).toBeVisible({ timeout: 5_000 });
});

test("the latest currency pair wins and amount changes reuse its request", async ({ page }) => {
  let requestCount = 0;
  let releaseInitial: (() => void) | undefined;
  const initialCanResolve = new Promise<void>((resolve) => {
    releaseInitial = resolve;
  });

  await page.route("**/api/rates/fiat?*", async (route) => {
    requestCount += 1;
    const url = new URL(route.request().url());
    const base = url.searchParams.get("base") ?? "USD";
    const quote = url.searchParams.get("quote") ?? "EUR";

    if (base === "USD" && quote === "EUR") {
      await initialCanResolve;
      await safelyFulfillRate(route, base, quote, 2);
      return;
    }

    await safelyFulfillRate(route, base, quote, 3);
  });

  await page.goto("/tools/currency", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const selectedCurrencyFlags = page.locator('img[src*="flagcdn.com"]');
  await expect(selectedCurrencyFlags).toHaveCount(2);
  for (const flag of await selectedCurrencyFlags.all()) {
    const rect = await flag.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { height: bounds.height, width: bounds.width };
    });
    expect(rect).toEqual({ height: 15, width: 20 });
  }
  await page.getByRole("combobox", { name: "From currency" }).click();
  await page.getByRole("option", { name: /GBP/ }).click();

  await expect(page.getByRole("textbox", { name: "Converted amount in EUR" })).toHaveValue("3.00");
  releaseInitial?.();
  await expect(page.getByRole("textbox", { name: "Converted amount in EUR" })).toHaveValue("3.00");

  const pairRequestCount = requestCount;
  const amount = page.getByRole("spinbutton", { name: "From" });
  await amount.fill("2");
  await amount.fill("25");
  await amount.fill("250");
  await expect(page.getByRole("textbox", { name: "Converted amount in EUR" })).toHaveValue(
    "750.00",
  );
  expect(requestCount).toBe(pairRequestCount);
});

test("contribute page renders its founder fallback without GitHub data", async ({ page }) => {
  await installDefaultProviderFixtures(page);
  const response = await page.goto("/contribute", { waitUntil: "domcontentloaded" });

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /Contribute to astraa/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse open issues" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read contribution guide" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Star the repository" })).toBeVisible();
  await expect(
    page.getByText("Contributor profiles are unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("~ Aditya")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Oops!");
});

test("text generation exposes safe success, rate-limit, and timeout states", async ({ page }) => {
  const diagnostics = watchPageDiagnostics(page);
  await page.goto("/tools/text", { waitUntil: "domcontentloaded" });
  await waitForAppHydration(page);
  const topic = page.getByRole("textbox", { name: "Topic" });
  const generate = page.getByRole("button", { name: "Generate text", exact: true });

  await topic.fill("__ASTRAA_E2E_SUCCESS__");
  await generate.click();
  await expect(page.getByRole("textbox", { name: "Generated text" })).toHaveValue(
    "Deterministic browser-test prose generated without contacting an external provider.",
  );

  await topic.fill("__ASTRAA_E2E_RATE_LIMIT__");
  await generate.click();
  await expect(
    page.getByText("Too many requests. Please wait before trying again.", { exact: true }),
  ).toBeVisible();

  await topic.fill("__ASTRAA_E2E_TIMEOUT__");
  await generate.click();
  await expect(
    page.getByText("Text generation took too long. Please try again.", { exact: true }),
  ).toBeVisible();

  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

test("unfinished tools and games never expose their hidden implementation", async ({ page }) => {
  for (const [path, heading] of [
    ["/tools/music", "Lofi Focus Studio is planned"],
    ["/games/snake", "Snake is planned"],
  ] as const) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  }
});

function themeRadioName(theme: "dark" | "light" | "system"): string {
  if (theme === "light") return "Use light theme";
  if (theme === "dark") return "Use dark theme";
  return "Use system theme";
}

async function waitForAppHydration(page: import("@playwright/test").Page): Promise<void> {
  await expect(page.getByRole("radio", { name: "Use system theme" })).toBeVisible();
}

async function safelyFulfillRate(
  route: Route,
  base: string,
  quote: string,
  rate: number,
): Promise<void> {
  if (route.request().isNavigationRequest()) return;
  try {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        base,
        quote,
        rate,
        asOf: "2026-08-08T12:00:00.000Z",
        source: "currency-api",
      }),
    });
  } catch {
    // A superseded request can be aborted by the client before its fixture is released.
  }
}
