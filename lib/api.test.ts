import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExchangeRate } from "./api";

const okJson = (body: unknown): Response =>
  ({ ok: true, json: async () => body }) as unknown as Response;

const notOk = (status = 500): Response =>
  ({ ok: false, status, json: async () => ({}) }) as unknown as Response;

describe("getExchangeRate", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the rate when the primary API returns a valid shape", async () => {
    expect.hasAssertions();
    const fetchMock = vi.fn().mockResolvedValue(okJson({ usd: { eur: 0.92 } }));
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getExchangeRate("USD", "EUR");

    expect(rate).toBe(0.92);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to the backup API when the primary returns a malformed shape", async () => {
    expect.hasAssertions();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ usd: { gbp: 0.79 } }))
      .mockResolvedValueOnce(okJson({ rates: { EUR: 0.91 } }));
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getExchangeRate("USD", "EUR");

    expect(rate).toBe(0.91);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null when both the primary and backup APIs fail", async () => {
    expect.hasAssertions();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(notOk())
      .mockResolvedValueOnce(notOk());
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getExchangeRate("USD", "EUR");

    expect(rate).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
