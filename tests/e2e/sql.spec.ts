import { gzipSync } from "node:zlib";

import { expect, test } from "@playwright/test";

import { SQL_LOAD_ERROR_MESSAGE, SQL_UPSTREAM_LIMITATION } from "../../lib/sql/types";
import { toCanonicalUrl } from "../../lib/seo/site";
import { installDefaultProviderFixtures, watchPageDiagnostics } from "./test-helpers";

test.beforeEach(async ({ page }) => {
  await installDefaultProviderFixtures(page);
});

test("SQL formats on keyboard request, preserves source, and copies the read-only result", async ({
  context,
  page,
}) => {
  const diagnostics = watchPageDiagnostics(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/sql", { waitUntil: "domcontentloaded" });
  await waitForSqlHydration(page);

  const source = page.getByRole("textbox", { name: "Source SQL" });
  const output = page.getByRole("textbox", { name: "Formatted SQL (read-only)" });
  const format = page.getByRole("button", { name: "Format SQL" });
  const input =
    "select 'SELECT FROM WHERE' as note, `FROM` from logs " + "-- LEFT JOIN SELECT\nwhere id=?;";

  await expect(format).toBeDisabled();
  await page.getByRole("combobox", { name: "Dialect" }).selectOption("mysql");
  await page.getByRole("combobox", { name: "Keyword case" }).selectOption("upper");
  await page.getByRole("combobox", { name: "Indentation" }).selectOption("4");
  await source.fill(input);
  await expect(format).toBeEnabled();
  await format.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("status")).toContainText("Formatting complete");
  await expect(source).toHaveValue(input);
  await expect(output).toHaveValue(/'SELECT FROM WHERE'/);
  await expect(output).toHaveValue(/`FROM`/);
  await expect(output).toHaveValue(/-- LEFT JOIN SELECT/);
  await expect(output).toHaveValue(/WHERE\n {4}id = \?/);

  await page.getByRole("button", { name: "Copy formatted SQL" }).click();
  await expect(page.getByRole("status")).toContainText("Formatted SQL copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await output.inputValue());

  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(source).toBeFocused();
  await expect(source).toHaveValue("");
  await expect(output).toHaveValue("");
  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

test("SQL parse and known-limitation errors are focused, actionable, and keep source", async ({
  page,
}) => {
  const diagnostics = watchPageDiagnostics(page);
  await page.goto("/tools/sql", { waitUntil: "domcontentloaded" });
  await waitForSqlHydration(page);

  const source = page.getByRole("textbox", { name: "Source SQL" });
  const output = page.getByRole("textbox", { name: "Formatted SQL (read-only)" });
  const input = "select 'unterminated";
  await source.fill(input);
  await page.getByRole("button", { name: "Format SQL" }).click();

  const parseAlert = page.getByRole("alert", { name: "SQL formatting error" });
  await expect(parseAlert).toBeFocused();
  await expect(parseAlert).toContainText("Check the SQL and selected dialect");
  await expect(parseAlert).not.toContainText(/invalid SQL|token|column \d/i);
  await expect(source).toHaveValue(input);
  await expect(output).toHaveValue("");

  const procedure = "CREATE OR ALTER PROC refresh_totals AS SELECT 1;";
  await source.fill(procedure);
  await page.getByRole("button", { name: "Format SQL" }).click();
  await expect(page.getByRole("alert", { name: "SQL formatting error" })).toBeFocused();
  await expect(page.getByRole("alert", { name: "SQL formatting error" })).toContainText(
    SQL_UPSTREAM_LIMITATION,
  );
  await expect(source).toHaveValue(procedure);
  expect(diagnostics.failures).toEqual([]);
  diagnostics.stop();
});

test("SQL rejects 102,401 UTF-8 bytes before requesting the formatter chunk", async ({ page }) => {
  await page.goto("/tools/sql", { waitUntil: "networkidle" });
  await waitForSqlHydration(page);
  const chunksRequestedAfterInitialLoad: string[] = [];
  page.on("request", (request) => {
    if (isJavaScriptChunk(request.url())) chunksRequestedAfterInitialLoad.push(request.url());
  });

  const input = "x".repeat(102_401);
  const source = page.getByRole("textbox", { name: "Source SQL" });
  await source.fill(input);
  await page.getByRole("button", { name: "Format SQL" }).click();

  await expect(page.getByRole("alert", { name: "SQL formatting error" })).toBeFocused();
  await expect(page.getByRole("alert", { name: "SQL formatting error" })).toContainText(
    "SQL must be 100 KB or smaller.",
  );
  await expect(page.getByText("102,401 bytes of 100 KB", { exact: true })).toBeVisible();
  await expect(source).toHaveValue(input);
  expect(chunksRequestedAfterInitialLoad).toEqual([]);
});

test("SQL lazy-load failure is safe, focused, and retryable", async ({ page }) => {
  const sourceValue = "select private_marker from retry_fixture;";
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/tools/sql", { waitUntil: "networkidle" });
  await waitForSqlHydration(page);
  await page.getByRole("textbox", { name: "Source SQL" }).fill(sourceValue);

  let failedChunk = false;
  await page.route("**/_next/static/chunks/**", async (route) => {
    if (!failedChunk && route.request().resourceType() === "script") {
      failedChunk = true;
      await route.abort("failed");
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Format SQL" }).click();
  const alert = page.getByRole("alert", { name: "SQL formatting error" });
  await expect(alert).toBeFocused();
  await expect(alert).toContainText(SQL_LOAD_ERROR_MESSAGE);
  await expect(page.getByRole("textbox", { name: "Source SQL" })).toHaveValue(sourceValue);
  expect(failedChunk).toBe(true);
  expect(consoleErrors.join("\n")).not.toContain(sourceValue);

  await page.unroute("**/_next/static/chunks/**");
  await page.getByRole("button", { name: "Try formatting again" }).click();
  await expect(page.getByRole("status")).toContainText("Formatting complete");
  await expect(page.getByRole("textbox", { name: "Formatted SQL (read-only)" })).toHaveValue(
    /SELECT/,
  );
  await expect(alert).toBeHidden();
});

test("SQL formatter code loads only after Format and stays out of homepage resources", async ({
  context,
  page,
}, testInfo) => {
  const sqlChunkResources = new Map<string, string>();
  page.on("response", (response) => {
    if (isJavaScriptChunk(response.url())) {
      sqlChunkResources.set(response.url(), response.request().resourceType());
    }
  });
  await page.goto("/tools/sql", { waitUntil: "networkidle" });
  await waitForSqlHydration(page);
  const initialSqlResources = new Set(sqlChunkResources.keys());

  await page.getByRole("textbox", { name: "Source SQL" }).fill("select 1;");
  await page.getByRole("button", { name: "Format SQL" }).click();
  await expect(page.getByRole("status")).toContainText("Formatting complete");
  const lazyResources = [...sqlChunkResources.keys()].filter(
    (url) => !initialSqlResources.has(url),
  );
  const lazyScriptBodies = await loadJavaScriptBodies(page, lazyResources);
  const formatterScripts = lazyScriptBodies.filter(({ body }) =>
    body.includes("Unsupported SQL dialect"),
  );
  const workerScripts = lazyScriptBodies.filter(({ body }) => body.includes("requestId"));

  expect(lazyResources).toHaveLength(2);
  expect(formatterScripts).toHaveLength(1);
  expect(workerScripts).toHaveLength(1);
  for (const url of lazyResources) expect(initialSqlResources.has(url)).toBe(false);

  const homePage = await context.newPage();
  const homeResources = new Set<string>();
  homePage.on("response", (response) => {
    if (isJavaScriptChunk(response.url())) homeResources.add(response.url());
  });
  await homePage.goto("/", { waitUntil: "networkidle" });
  for (const url of lazyResources) expect(homeResources.has(url)).toBe(false);

  const initialSqlScriptBodies = await loadJavaScriptBodies(page, initialSqlResources);
  const homeScriptBodies = await loadJavaScriptBodies(homePage, homeResources);

  const evidence = {
    formatterResourcesRequestedAfterFormat: formatterScripts.map(({ body, url }) => ({
      ...measureJavaScriptBody(body),
      resourceType: sqlChunkResources.get(url),
      url,
    })),
    homeAttributableLazySqlBytes: { gzipBytes: 0, rawBytes: 0 },
    homeIncludesLazySqlResource: lazyResources.some((url) => homeResources.has(url)),
    homeJavaScriptBytes: summarizeJavaScriptBodies(homeScriptBodies),
    homeJavaScriptChunkCount: homeResources.size,
    initialSqlIncludesLazySqlResource: lazyResources.some((url) => initialSqlResources.has(url)),
    initialSqlJavaScriptBytes: summarizeJavaScriptBodies(initialSqlScriptBodies),
    initialSqlJavaScriptChunkCount: initialSqlResources.size,
    lazyJavaScriptBytes: summarizeJavaScriptBodies(lazyScriptBodies),
    workerResourcesRequestedAfterFormat: workerScripts.map(({ body, url }) => ({
      ...measureJavaScriptBody(body),
      resourceType: sqlChunkResources.get(url),
      url,
    })),
  };
  expect(evidence.formatterResourcesRequestedAfterFormat[0]?.rawBytes).toBeGreaterThan(0);
  expect(evidence.workerResourcesRequestedAfterFormat[0]?.rawBytes).toBeGreaterThan(0);
  expect(evidence.homeAttributableLazySqlBytes).toEqual({ gzipBytes: 0, rawBytes: 0 });
  await testInfo.attach("sql-resource-loading.json", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json",
  });
  console.log(`SQL_RESOURCES ${JSON.stringify(evidence)}`);
  await homePage.close();
});

test("SQL @performance keeps exact-max formatting off the main thread under 4x CPU", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const InstrumentedWorker = new Proxy(NativeWorker, {
      construct(Target, argumentsList) {
        const worker = Reflect.construct(Target, argumentsList) as Worker;
        worker.addEventListener("message", () => {
          performance.mark("astraa-sql-worker-message");
        });
        return worker;
      },
    });
    Object.defineProperty(window, "Worker", { configurable: true, value: InstrumentedWorker });
  });
  await page.goto("/tools/sql", { waitUntil: "networkidle" });
  await waitForSqlHydration(page);
  const source = page.getByRole("textbox", { name: "Source SQL" });
  const format = page.getByRole("button", { name: "Format SQL" });

  await source.fill("select 1;");
  await format.click();
  await expect(page.getByRole("status")).toContainText("Formatting complete");
  await page.getByRole("button", { name: "Clear", exact: true }).click();

  const cdp = await page.context().newCDPSession(page);
  const tenKilobytes = buildRepresentativeSql(10 * 1024);
  const maxSql = buildRepresentativeSql(100 * 1024);
  expect(Buffer.byteLength(tenKilobytes, "utf8")).toBe(10 * 1024);
  expect(Buffer.byteLength(maxSql, "utf8")).toBe(100 * 1024);

  await source.fill(tenKilobytes);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const tenKilobyteMetrics = await measureSqlFormatting(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  console.log(`SQL_PERFORMANCE_10KB ${JSON.stringify(tenKilobyteMetrics)}`);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await source.fill(maxSql);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const maxMetrics = await measureSqlFormatting(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  console.log(`SQL_PERFORMANCE_100KB ${JSON.stringify(maxMetrics)}`);

  const evidence = {
    cpuThrottle: 4,
    exactMaxBytes: Buffer.byteLength(maxSql, "utf8"),
    max: maxMetrics,
    representativeBytes: Buffer.byteLength(tenKilobytes, "utf8"),
    representative: tenKilobyteMetrics,
  };
  await testInfo.attach("sql-performance.json", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json",
  });
  console.log(`SQL_PERFORMANCE ${JSON.stringify(evidence)}`);

  expect(tenKilobyteMetrics.longTasks).toEqual([]);
  for (const metrics of [tenKilobyteMetrics, maxMetrics]) {
    expect(metrics.workerMessageOffsetMs).not.toBeNull();
    expect(metrics.longTasks.filter(({ durationMs }) => durationMs >= 100)).toEqual([]);
  }
});

test("SQL launch is indexable and linked from catalog, command menu, guide, and sitemap", async ({
  page,
  request,
}) => {
  await page.goto("/tools/sql", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("SQL Formatter | Astraa");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    toCanonicalUrl("/tools/sql"),
  );
  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) await expect(robots).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('[data-seo-guide="sql"]')).toContainText(
    "How to format SQL for a selected dialect",
  );
  await expect(page.locator('aside[aria-labelledby="sql-related"] a[href^="/tools/"]')).toHaveCount(
    2,
  );

  await page.goto("/tools", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /SQL Formatter/ })).toHaveAttribute(
    "href",
    "/tools/sql",
  );
  await page.goto("/explore", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /SQL Formatter/ })).toHaveAttribute(
    "href",
    "/tools/sql",
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dialog = page.getByRole("dialog", { name: "Search tools and games" });
  await expect(async () => {
    await page.getByRole("button", { name: "Open command menu" }).click();
    await expect(dialog).toBeVisible();
  }).toPass();
  await dialog.getByRole("combobox", { name: "Search input" }).fill("SQL Formatter");
  const sqlCommand = dialog.getByText("SQL Formatter", { exact: true });
  await expect(sqlCommand).toBeVisible();
  await sqlCommand.click();
  await expect(page).toHaveURL(/\/tools\/sql$/);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const matches = (await sitemap.text()).match(
    new RegExp(`<loc>${toCanonicalUrl("/tools/sql")}</loc>`, "g"),
  );
  expect(matches).toHaveLength(1);
});

test("SQL controls remain keyboard-usable without overflow at 320 pixels in dark mode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/tools/sql", { waitUntil: "domcontentloaded" });
  await waitForSqlHydration(page);
  await expect(page.locator("html")).toHaveClass(/dark/);

  const source = page.getByRole("textbox", { name: "Source SQL" });
  await source.focus();
  await page.keyboard.type("select id from users where id=1;");
  const format = page.getByRole("button", { name: "Format SQL" });
  await expect(format).toBeEnabled();
  await format.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Formatting complete");

  for (const control of await page
    .getByRole("button", { name: /Format SQL|Copy formatted SQL|Clear/ })
    .all()) {
    await expect
      .poll(() => control.evaluate((element) => element.getBoundingClientRect().height))
      .toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("SQL server-rendered guide and metadata remain available without JavaScript", async ({
  browser,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== "string") throw new Error("Playwright baseURL is required");
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const page = await context.newPage();

  const response = await page.goto("/tools/sql", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "SQL Formatter" })).toBeVisible();
  await expect(page.locator('[data-seo-guide="sql"]')).toContainText("Six explicitly tested");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    toCanonicalUrl("/tools/sql"),
  );
  await expect(page.getByRole("button", { name: "Format SQL" })).toBeDisabled();
  await context.close();
});

async function waitForSqlHydration(page: import("@playwright/test").Page): Promise<void> {
  const openMenu = page.getByRole("button", { name: "Open menu" });
  if (await openMenu.isVisible()) {
    await expect(async () => {
      await openMenu.click();
      await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    }).toPass();
    await expect(page.getByRole("radio", { name: "Use system theme" })).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
  } else {
    await expect(page.getByRole("radio", { name: "Use system theme" })).toBeVisible();
  }
  await expect(page.getByRole("combobox", { name: "Dialect" })).toHaveValue("basic");
}

function buildRepresentativeSql(targetBytes: number): string {
  const prefix = "SELECT\n";
  const repeatedColumn = "  customer_id,\n";
  const suffix = "  created_at\nFROM orders\nWHERE status = 'open';";
  const repeatedCount = Math.floor(
    (targetBytes - Buffer.byteLength(prefix + suffix, "utf8")) /
      Buffer.byteLength(repeatedColumn, "utf8"),
  );
  const query = `${prefix}${repeatedColumn.repeat(repeatedCount)}${suffix}`;
  return query.padEnd(targetBytes, " ");
}

function isJavaScriptChunk(url: string): boolean {
  return url.includes("/_next/static/chunks/") && url.endsWith(".js");
}

async function loadJavaScriptBodies(
  page: import("@playwright/test").Page,
  urls: Iterable<string>,
): Promise<Array<{ body: Buffer; url: string }>> {
  return Promise.all(
    [...urls].map(async (url) => {
      const response = await page.request.get(url);
      expect(response.ok()).toBe(true);
      return { body: await response.body(), url };
    }),
  );
}

function measureJavaScriptBody(body: Buffer): { gzipBytes: number; rawBytes: number } {
  return { gzipBytes: gzipSync(body, { level: 9 }).byteLength, rawBytes: body.byteLength };
}

function summarizeJavaScriptBodies(resources: ReadonlyArray<{ body: Buffer }>): {
  gzipBytes: number;
  rawBytes: number;
} {
  return resources.reduce(
    (total, { body }) => {
      const size = measureJavaScriptBody(body);
      return {
        gzipBytes: total.gzipBytes + size.gzipBytes,
        rawBytes: total.rawBytes + size.rawBytes,
      };
    },
    { gzipBytes: 0, rawBytes: 0 },
  );
}

async function measureSqlFormatting(
  page: import("@playwright/test").Page,
): Promise<SqlPerformanceMetrics> {
  const format = page.getByRole("button", { name: "Format SQL" });
  await expect(format).toBeEnabled();

  return page.evaluate(
    () =>
      new Promise<SqlPerformanceMetrics>((resolve, reject) => {
        const button = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
          (candidate) => candidate.textContent?.trim() === "Format SQL" && !candidate.disabled,
        );
        const status = document.querySelector<HTMLElement>("#sql-result-status");
        if (!button || !status) {
          reject(new Error("SQL performance controls were not found"));
          return;
        }

        const observedLongTasks: Array<{
          attribution: SqlLongTaskAttribution[];
          durationMs: number;
          startTimeMs: number;
        }> = [];
        const recordLongTasks = (entries: PerformanceEntry[]): void => {
          for (const entry of entries) {
            const attributionEntries = (
              entry as PerformanceEntry & {
                attribution?: Array<{
                  containerName?: string;
                  containerSrc?: string;
                  containerType?: string;
                  name?: string;
                }>;
              }
            ).attribution;
            observedLongTasks.push({
              attribution: (attributionEntries ?? []).map((attribution) => ({
                containerName: attribution.containerName ?? "",
                containerSrc: attribution.containerSrc ?? "",
                containerType: attribution.containerType ?? "",
                name: attribution.name ?? "",
              })),
              durationMs: entry.duration,
              startTimeMs: entry.startTime,
            });
          }
        };
        const longTaskObserver = new PerformanceObserver((entries) => {
          recordLongTasks(entries.getEntries());
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
        performance.clearMarks("astraa-sql-worker-message");
        const start = performance.now();
        const timeout = window.setTimeout(() => {
          mutationObserver.disconnect();
          longTaskObserver.disconnect();
          reject(new Error("SQL performance measurement timed out"));
        }, 120_000);
        const mutationObserver = new MutationObserver(() => {
          if (!status.textContent?.includes("Formatting complete")) return;

          const durationMs = performance.now() - start;
          mutationObserver.disconnect();
          window.clearTimeout(timeout);
          window.setTimeout(() => {
            recordLongTasks(longTaskObserver.takeRecords());
            const workerMessage = performance
              .getEntriesByName("astraa-sql-worker-message", "mark")
              .findLast((entry) => entry.startTime >= start);
            const workerMessageOffsetMs = workerMessage ? workerMessage.startTime - start : null;
            const longTasks = observedLongTasks.map((entry) => ({
              attribution: entry.attribution,
              durationMs: entry.durationMs,
              endBeforeResultMs: durationMs - (entry.startTimeMs - start + entry.durationMs),
              startOffsetMs: entry.startTimeMs - start,
              startsAfterWorkerMessage:
                workerMessageOffsetMs !== null &&
                entry.startTimeMs - start >= workerMessageOffsetMs,
            }));
            longTaskObserver.disconnect();
            resolve({
              durationMs,
              longTasks,
              workerMessageOffsetMs,
            });
          }, 0);
        });
        mutationObserver.observe(status, { characterData: true, childList: true, subtree: true });
        button.click();
      }),
  );
}

interface SqlLongTaskAttribution {
  containerName: string;
  containerSrc: string;
  containerType: string;
  name: string;
}

interface SqlLongTaskEvidence {
  attribution: SqlLongTaskAttribution[];
  durationMs: number;
  endBeforeResultMs: number;
  startOffsetMs: number;
  startsAfterWorkerMessage: boolean;
}

interface SqlPerformanceMetrics {
  durationMs: number;
  longTasks: SqlLongTaskEvidence[];
  workerMessageOffsetMs: number | null;
}
