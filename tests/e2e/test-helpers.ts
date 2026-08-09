import { expect, type Page, type Response } from "@playwright/test";

export interface PageDiagnostics {
  failures: string[];
  stop: () => void;
}

const LOCAL_ASSET_TYPES = new Set(["font", "image", "script", "stylesheet"]);

export function watchPageDiagnostics(page: Page): PageDiagnostics {
  const failures: string[] = [];
  const onConsole = (message: { type(): string; text(): string }): void => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  };
  const onPageError = (error: Error): void => {
    failures.push(`pageerror: ${error.message}`);
  };
  const onResponse = (response: Response): void => {
    const request = response.request();
    const url = new URL(response.url());
    if (
      url.origin === new URL(page.url() || "http://127.0.0.1:3002").origin &&
      LOCAL_ASSET_TYPES.has(request.resourceType()) &&
      response.status() >= 400
    ) {
      failures.push(`${response.status()} ${request.resourceType()}: ${url.pathname}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  return {
    failures,
    stop: () => {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      page.off("response", onResponse);
    },
  };
}

export async function expectHealthyDocument(
  page: Page,
  diagnostics: PageDiagnostics,
): Promise<void> {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Oops!");
  await expect(page.locator("body")).not.toContainText("Application error");
  await expect(page.locator("body")).not.toContainText("Next.js error overlay");
  expect(diagnostics.failures).toEqual([]);
}

export async function installDefaultProviderFixtures(page: Page): Promise<void> {
  await page.route("**/api/rates/fiat?*", async (route) => {
    const url = new URL(route.request().url());
    const base = url.searchParams.get("base") ?? "USD";
    const quote = url.searchParams.get("quote") ?? "EUR";
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        base,
        quote,
        rate: base === quote ? 1 : 0.92,
        asOf: "2026-08-08T12:00:00.000Z",
        source: base === quote ? "identity" : "currency-api",
      }),
    });
  });

  await page.route("**/api/rates/crypto?*", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        base: url.searchParams.get("base") ?? "bitcoin",
        quote: url.searchParams.get("quote") ?? "USD",
        rate: 61_234.5,
        asOf: "2026-08-08T12:00:00.000Z",
        source: "coingecko",
      }),
    });
  });

  await page.route("https://github.com/sponsors/**", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><title>Sponsor</title><body>Sponsor</body></html>',
    });
  });
}

export async function readPersistedValue(page: Page, key: string): Promise<string | null> {
  return page.evaluate(
    async ({ databaseName, storageKey, storeName }) =>
      new Promise<string | null>((resolve, reject) => {
        const openRequest = indexedDB.open(databaseName, 1);
        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onupgradeneeded = () => {
          const database = openRequest.result;
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName);
          }
        };
        openRequest.onsuccess = () => {
          const database = openRequest.result;
          const transaction = database.transaction(storeName, "readonly");
          const getRequest = transaction.objectStore(storeName).get(storageKey);
          getRequest.onerror = () => reject(getRequest.error);
          getRequest.onsuccess = () => {
            resolve(typeof getRequest.result === "string" ? getRequest.result : null);
            database.close();
          };
        };
      }),
    {
      databaseName: "astraa-tools-db",
      storageKey: key,
      storeName: "store",
    },
  );
}
