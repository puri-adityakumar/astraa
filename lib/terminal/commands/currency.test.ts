import { describe, expect, it, vi } from "vitest";
import { currencyCommand, runCurrency } from "@/lib/terminal/commands/currency";
import { getExchangeRate, getCryptoPrice } from "@/lib/api";
import type { CommandContext } from "@/lib/terminal/types";

vi.mock("@/lib/api", () => ({
  getExchangeRate: vi.fn(),
  getCryptoPrice: vi.fn(),
}));

/**
 * The rate fetcher is injected so tests never touch the network. The real
 * command wires lib/api's getExchangeRate (keyless, with its own fallback).
 */
const fetchRate = vi.fn<(from: string, to: string) => Promise<number | null>>();

function run(args: string) {
  return runCurrency(args, fetchRate);
}

const ctx: CommandContext = { theme: "auto", commands: [] };

describe("runCurrency (injected fetcher)", () => {
  it("opens the panel for bare and whitespace args without fetching", async () => {
    fetchRate.mockClear();
    await expect(run("")).resolves.toEqual({ type: "open", slug: "currency" });
    await expect(run("   ")).resolves.toEqual({ type: "open", slug: "currency" });
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("answers a fiat conversion inline with 2 decimals", async () => {
    fetchRate.mockResolvedValue(0.9231);
    const result = await run("100 usd to eur");
    expect(fetchRate).toHaveBeenCalledWith("USD", "EUR");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "100 USD = 92.31 EUR" }],
    });
  });

  it("keeps the trailing zero of a 2-decimal result", async () => {
    fetchRate.mockResolvedValue(1.5);
    const result = await run("1 usd to eur");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "1 USD = 1.50 EUR" }],
    });
  });

  it("canonicalises code case but not the echoed amount", async () => {
    fetchRate.mockResolvedValue(187.123);
    const result = await run("250 gBp To jPy");
    expect(fetchRate).toHaveBeenCalledWith("GBP", "JPY");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "250 GBP = 46780.75 JPY" }],
    });
  });

  it("answers a second fiat pair from the 25-code list", async () => {
    fetchRate.mockResolvedValue(0.665);
    const result = await run("42 EUR to USD");
    expect(fetchRate).toHaveBeenCalledWith("EUR", "USD");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "42 EUR = 27.93 USD" }],
    });
  });

  it("opens the panel with the crypto message when the FROM code is crypto", async () => {
    fetchRate.mockClear();
    const result = await run("1 btc to usd");
    expect(result).toEqual({
      type: "open",
      slug: "currency",
      output: [{ type: "text", text: "Crypto rates open in the Currency panel." }],
    });
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("opens the panel with the crypto message when the TO code is crypto", async () => {
    fetchRate.mockClear();
    const result = await run("100 usd to eth");
    expect(result.type).toBe("open");
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("classifies crypto codes case-insensitively", async () => {
    fetchRate.mockClear();
    const result = await run("1 BtC to USD");
    expect(result.type).toBe("open");
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("falls back on an unknown code with the exact message", async () => {
    fetchRate.mockClear();
    const result = await run("100 xyz to eur");
    expect(result).toEqual({
      type: "fallback",
      slug: "currency",
      message: `I don't understand "100 xyz to eur". Opening Currency…`,
    });
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("falls back on an unknown target code", async () => {
    const result = await run("100 usd to zorp");
    expect(result).toEqual({
      type: "fallback",
      slug: "currency",
      message: `I don't understand "100 usd to zorp". Opening Currency…`,
    });
  });

  it.each([
    "abc usd to eur",
    "lots usd to eur",
    "usd to eur",
    "100 usd eur",
    "100 usd into eur",
    "100 usd to eur extra",
  ])("falls back on malformed input %q", async (input) => {
    const result = await run(input);
    expect(result).toEqual({
      type: "fallback",
      slug: "currency",
      message: `I don't understand "${input}". Opening Currency…`,
    });
    expect(fetchRate).not.toHaveBeenCalled();
  });

  it("opens the panel with an error line when the rate fetch returns null", async () => {
    fetchRate.mockResolvedValue(null);
    const result = await run("100 usd to eur");
    expect(result.type).toBe("open");
    if (result.type === "open") {
      expect(result.slug).toBe("currency");
      expect(result.output?.[0]?.type).toBe("error");
    }
  });

  it("opens the panel with an error line when the rate fetch throws", async () => {
    fetchRate.mockRejectedValue(new Error("offline"));
    const result = await run("100 usd to eur");
    expect(result.type).toBe("open");
    if (result.type === "open") {
      expect(result.slug).toBe("currency");
      expect(result.output?.[0]?.type).toBe("error");
    }
  });
});

describe("currencyCommand", () => {
  it("is registered under the currency slug with the fx alias", () => {
    expect(currencyCommand.name).toBe("currency");
    expect(currencyCommand.aliases).toContain("fx");
    expect(currencyCommand.slug).toBe("currency");
    expect(currencyCommand.status).toBe("live");
  });

  it("wires the real getExchangeRate for fiat pairs", async () => {
    vi.mocked(getExchangeRate).mockResolvedValue(0.9231);
    const result = await currencyCommand.run("100 usd to eur", ctx);
    expect(getExchangeRate).toHaveBeenCalledWith("USD", "EUR");
    expect(result).toEqual({
      type: "answer",
      output: [{ type: "text", text: "100 USD = 92.31 EUR" }],
    });
  });

  it("never calls getCryptoPrice — even for crypto codes", async () => {
    vi.mocked(getCryptoPrice).mockClear();
    const result = await currencyCommand.run("1 btc to usd", ctx);
    expect(result.type).toBe("open");
    expect(getCryptoPrice).not.toHaveBeenCalled();
  });
});
