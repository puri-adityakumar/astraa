import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { chromium } from "@playwright/test";

const BASE_URL = process.env.PERFORMANCE_BASE_URL ?? "http://127.0.0.1:3003";
const ROUTES = [
  "/",
  "/tools/password",
  "/tools/json",
  "/tools/markdown",
  "/tools/snippet-generator",
];
const RUNS = 3;
const require = createRequire(import.meta.url);
const playwrightVersion = require("@playwright/test/package.json").version;

const server = startServer();
let browser;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const samples = Object.fromEntries(ROUTES.map((route) => [route, []]));

  for (let run = 1; run <= RUNS; run += 1) {
    for (const route of ROUTES) {
      samples[route].push(await measureRoute(browser, route));
    }
  }

  const medians = Object.fromEntries(
    ROUTES.map((route) => [
      route,
      {
        jsTransferKb: median(samples[route].map((sample) => sample.jsTransferKb)),
        lcpMs: median(samples[route].map((sample) => sample.lcpMs)),
        cls: median(samples[route].map((sample) => sample.cls)),
        commandMenuLatencyMs: median(samples[route].map((sample) => sample.commandMenuLatencyMs)),
      },
    ]),
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        playwrightVersion,
        chromiumVersion: browser.version(),
        profile: {
          viewport: "390x844 @3x",
          cpuSlowdown: "4x",
          latencyMs: 150,
          downloadMbps: 1.6,
          uploadMbps: 0.75,
          cache: "disabled",
        },
        runs: RUNS,
        medians,
        samples,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}

function startServer() {
  const url = new URL(BASE_URL);
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", url.hostname, "--port", url.port],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ASTRAA_DISABLE_SENTRY_SOURCE_MAPS: "true",
        ASTRAA_E2E_FIXTURES: "true",
        ASTRAA_ENABLE_ANALYTICS: "false",
      },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );

  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited with code ${server.exitCode}.`);
    }

    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Production server did not become ready at ${BASE_URL}.`);
}

async function measureRoute(browserInstance, route) {
  const context = await browserInstance.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);

  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200_000,
    uploadThroughput: 93_750,
    connectionType: "cellular3g",
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    globalThis.__ASTRAA_PERFORMANCE__ = { cls: 0, lcpMs: 0 };
    if (PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) {
      new PerformanceObserver((list) => {
        const lastEntry = list.getEntries().at(-1);
        if (lastEntry) globalThis.__ASTRAA_PERFORMANCE__.lcpMs = lastEntry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    }
    if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) globalThis.__ASTRAA_PERFORMANCE__.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    }
  });

  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });

  const commandTriggers = page.getByRole("button", { name: "Open command menu" });
  if ((await commandTriggers.filter({ visible: true }).count()) === 0) {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  const commandTrigger = commandTriggers.filter({ visible: true });
  await commandTrigger.waitFor({ state: "visible" });

  await page.evaluate(() => {
    globalThis.__ASTRAA_COMMAND_LATENCY__ = null;
    const trigger = Array.from(
      document.querySelectorAll('button[aria-label="Open command menu"]'),
    ).find((element) => element.getClientRects().length > 0);
    if (!(trigger instanceof HTMLButtonElement)) throw new Error("Command trigger not found");

    trigger.addEventListener(
      "click",
      () => {
        const startedAt = performance.now();
        const observeDialog = () => {
          if (document.querySelector('[role="dialog"]')) {
            globalThis.__ASTRAA_COMMAND_LATENCY__ = performance.now() - startedAt;
            return true;
          }
          return false;
        };
        if (observeDialog()) return;
        const observer = new MutationObserver(() => {
          if (observeDialog()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
      },
      { once: true },
    );
  });
  await commandTrigger.click();
  await page.waitForFunction(() => typeof globalThis.__ASTRAA_COMMAND_LATENCY__ === "number");

  const measurement = await page.evaluate(() => {
    const scripts = performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("/_next/static/") && entry.name.includes(".js"));
    const jsBytes = scripts.reduce(
      (total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0),
      0,
    );
    return {
      jsTransferKb: jsBytes / 1024,
      lcpMs: globalThis.__ASTRAA_PERFORMANCE__.lcpMs,
      cls: globalThis.__ASTRAA_PERFORMANCE__.cls,
      commandMenuLatencyMs: globalThis.__ASTRAA_COMMAND_LATENCY__,
    };
  });

  await context.close();
  return roundMeasurement(measurement);
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function roundMeasurement(measurement) {
  return {
    jsTransferKb: Number(measurement.jsTransferKb.toFixed(1)),
    lcpMs: Math.round(measurement.lcpMs),
    cls: Number(measurement.cls.toFixed(4)),
    commandMenuLatencyMs: Number(measurement.commandMenuLatencyMs.toFixed(1)),
  };
}
