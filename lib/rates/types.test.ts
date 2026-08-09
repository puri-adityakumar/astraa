import { describe, expect, it } from "vitest";

import { isRateErrorCode, parseExchangeRate } from "./types";

describe("rate contract", () => {
  it("accepts a valid allowlisted rate payload", () => {
    expect(
      parseExchangeRate({
        base: "USD",
        quote: "EUR",
        rate: 0.92,
        asOf: "2026-08-08T00:00:00.000Z",
        source: "currency-api",
      }),
    ).toEqual({
      base: "USD",
      quote: "EUR",
      rate: 0.92,
      asOf: "2026-08-08T00:00:00.000Z",
      source: "currency-api",
    });
  });

  it("rejects invalid rates, dates, and sources", () => {
    expect(parseExchangeRate({ base: "USD", quote: "EUR", rate: 0 })).toBeNull();
    expect(
      parseExchangeRate({
        base: "USD",
        quote: "EUR",
        rate: 1,
        asOf: "not-a-date",
        source: "unknown",
      }),
    ).toBeNull();
  });

  it("recognizes only stable public error codes", () => {
    expect(isRateErrorCode("UPSTREAM_TIMEOUT")).toBe(true);
    expect(isRateErrorCode("UPSTREAM_INVALID")).toBe(false);
  });
});
