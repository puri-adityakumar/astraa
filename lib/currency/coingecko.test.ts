import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { fetchCryptoPrice } from "./coingecko";

const TEST_KEY = "test-provider-key";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Renders every logged argument, including objects, so a leak cannot hide. */
function loggedText(calls: readonly unknown[][]): string {
  return calls
    .map((call) =>
      call
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" "),
    )
    .join("\n");
}

/** Reloads the module so the in-memory price cache starts empty per test. */
async function loadProvider(): Promise<typeof fetchCryptoPrice> {
  vi.resetModules();
  const module = await import("./coingecko");
  return module.fetchCryptoPrice;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("COINGECKO_API_KEY", TEST_KEY);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchCryptoPrice", () => {
  it("returns the provider price with the key in a header, never in the URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bitcoin: { usd: 45000.5 } }));
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "ok",
      price: 45000.5,
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    );
    expect(String(url)).not.toContain(TEST_KEY);
    expect(init?.headers).toMatchObject({ "x-cg-demo-api-key": TEST_KEY });
  });

  it("fails safe without calling the provider when the key is missing", async () => {
    vi.stubEnv("COINGECKO_API_KEY", "");
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "unconfigured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("degrades to a null price when the provider omits the pair", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "ok",
      price: null,
    });
  });

  it("degrades to a null price for a non-numeric value", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bitcoin: { usd: "45000" } }));
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "ok",
      price: null,
    });
  });

  it("logs a provider rejection as sanitized status context", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(jsonResponse({ error: "invalid key" }, 401));
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "error",
    });

    const logged = loggedText(errorLog.mock.calls);
    expect(logged).toContain("provider_status");
    expect(logged).toContain("401");
    expect(logged).toContain("bitcoin");
    expect(logged).not.toContain(TEST_KEY);
    expect(logged).not.toContain("api.coingecko.com");
    expect(logged).not.toContain("x-cg-demo-api-key");
    expect(logged).not.toContain("invalid key");
  });

  it("never logs the raw transport error, its URL, or a key it carries", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const leaky = new Error(
      `request to https://api.coingecko.com/api/v3/simple/price?x=${TEST_KEY} failed`,
    );
    leaky.name = "ProviderFetchError";
    fetchMock.mockRejectedValue(leaky);
    const provider = await loadProvider();

    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "error",
    });

    const logged = loggedText(errorLog.mock.calls);
    expect(logged).toContain("transport_ProviderFetchError");
    expect(logged).not.toContain(TEST_KEY);
    expect(logged).not.toContain("api.coingecko.com");
    expect(logged).not.toContain("x-cg-demo-api-key");
    expect(logged).not.toContain("simple/price");
  });

  it("serves a repeated pair from the cache instead of the provider", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bitcoin: { usd: 45000.5 } }));
    const provider = await loadProvider();

    await provider("bitcoin", "USD");
    await expect(provider("bitcoin", "USD")).resolves.toEqual({
      status: "ok",
      price: 45000.5,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
