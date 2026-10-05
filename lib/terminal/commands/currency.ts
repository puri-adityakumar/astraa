import { currencies } from "@/lib/currency-data";
import { cryptocurrencies } from "@/lib/crypto-data";
import { getExchangeRate } from "@/lib/api";
import type { CommandContext, CommandResult, OutputBlock, TerminalCommand } from "../types";

const CRYPTO_MESSAGE = "Crypto rates open in the Currency panel.";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Currency…`;
}

/** Where a command gets its exchange rate — lib/api's getExchangeRate in production. */
export type RateFetcher = (from: string, to: string) => Promise<number | null>;

/** Case-insensitive check against the 25 fiat ISO codes in lib/currency-data.ts. */
export function isFiatCode(code: string): boolean {
  const needle = code.toUpperCase();
  return currencies.some((c) => c.code === needle);
}

/** Case-insensitive check against the crypto symbols in lib/crypto-data.ts. */
export function isCryptoCode(code: string): boolean {
  const needle = code.toUpperCase();
  return cryptocurrencies.some((c) => c.symbol === needle);
}

/** Canonical amount echo: trims zeroes and normalises "100.0" → "100". */
function formatAmount(value: number): string {
  return String(value);
}

/**
 * /currency (alias /fx): bare or empty args open the panel. "<amount> <FROM>
 * to <TO>" answers inline for fiat ISO codes (case-insensitive) using
 * getExchangeRate — the keyless fawazahmed0 API with the exchangerate-api
 * fallback. Any crypto code (lib/crypto-data.ts) opens the panel with the
 * crypto message instead: the terminal never calls getCryptoPrice. Unknown
 * codes or a bad amount fall back with the "I don't understand" message;
 * a null/throwing rate fetch degrades to an error line plus the panel.
 * The fetcher is injected so tests stay hermetic.
 */
export async function runCurrency(
  args: string,
  fetchRate: RateFetcher,
): Promise<CommandResult> {
  const input = args.trim();
  if (input === "") {
    return { type: "open", slug: "currency" };
  }
  const tokens = input.split(/\s+/);
  if (tokens.length !== 4 || tokens[2]?.toLowerCase() !== "to") {
    return { type: "fallback", slug: "currency", message: fallbackMessage(input) };
  }
  const amount = Number(tokens[0]);
  const from = (tokens[1] ?? "").toUpperCase();
  const to = (tokens[3] ?? "").toUpperCase();
  if (!Number.isFinite(amount)) {
    return { type: "fallback", slug: "currency", message: fallbackMessage(input) };
  }
  if (isCryptoCode(from) || isCryptoCode(to)) {
    return {
      type: "open",
      slug: "currency",
      output: [{ type: "text", text: CRYPTO_MESSAGE }],
    };
  }
  if (!isFiatCode(from) || !isFiatCode(to)) {
    return { type: "fallback", slug: "currency", message: fallbackMessage(input) };
  }

  let rate: number | null;
  try {
    rate = await fetchRate(from, to);
  } catch {
    rate = null;
  }
  if (rate === null) {
    const output: OutputBlock[] = [
      {
        type: "error",
        text: `Could not fetch the ${from} → ${to} exchange rate. Opening the converter instead.`,
      },
    ];
    return { type: "open", slug: "currency", output };
  }
  return {
    type: "answer",
    output: [
      {
        type: "text",
        text: `${formatAmount(amount)} ${from} = ${(amount * rate).toFixed(2)} ${to}`,
      },
    ],
  };
}

export const currencyCommand: TerminalCommand = {
  name: "currency",
  aliases: ["fx"],
  summary: "Convert fiat currencies inline at live rates",
  usage: ["/currency", "/currency 100 usd to eur", "/currency 250 GBP to JPY"],
  category: "Utilities",
  slug: "currency",
  status: "live",
  run(args: string, _ctx: CommandContext): Promise<CommandResult> {
    return runCurrency(args, getExchangeRate);
  },
};
