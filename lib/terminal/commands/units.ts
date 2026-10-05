import { convertUnit, unitCategories, type Unit } from "@/lib/unit-conversions";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Units…`;
}

/**
 * Temperature aliases are pinned deliberately: the lib's symbol "c" is the
 * speed of light, so plain "c"/"f"/"k" must map to °C/°F/K before any
 * generic symbol matching runs.
 */
const TOKEN_ALIASES: Record<string, { category: string; symbol: string }> = {
  c: { category: "Temperature", symbol: "°C" },
  f: { category: "Temperature", symbol: "°F" },
  k: { category: "Temperature", symbol: "K" },
  celsius: { category: "Temperature", symbol: "°C" },
  fahrenheit: { category: "Temperature", symbol: "°F" },
  kelvin: { category: "Temperature", symbol: "K" },
  meters: { category: "Length", symbol: "m" },
  kilometers: { category: "Length", symbol: "km" },
  miles: { category: "Length", symbol: "mi" },
  feet: { category: "Length", symbol: "ft" },
  inches: { category: "Length", symbol: "in" },
  yards: { category: "Length", symbol: "yd" },
  grams: { category: "Mass", symbol: "g" },
  kilograms: { category: "Mass", symbol: "kg" },
  pounds: { category: "Mass", symbol: "lb" },
  ounces: { category: "Mass", symbol: "oz" },
  liters: { category: "Volume", symbol: "L" },
  gallons: { category: "Volume", symbol: "gal" },
};

interface ResolvedUnit {
  unit: Unit;
  category: string;
}

/** Case-insensitive lookup by symbol, name or pluralised name. */
function resolveUnitToken(token: string): ResolvedUnit | undefined {
  const trimmed = token.trim();
  if (trimmed === "") return undefined;
  const needle = trimmed.toLowerCase();

  const aliased = TOKEN_ALIASES[needle];
  if (aliased) {
    const category = unitCategories.find((c) => c.name === aliased.category);
    const unit = category?.units.find((u) => u.symbol === aliased.symbol);
    if (category && unit) return { unit, category: category.name };
  }

  for (const category of unitCategories) {
    const exact = category.units.find(
      (u) => u.symbol === trimmed || u.name.toLowerCase() === needle,
    );
    if (exact) return { unit: exact, category: category.name };
  }
  for (const category of unitCategories) {
    const loose = category.units.find(
      (u) =>
        u.symbol.toLowerCase() === needle ||
        u.name.toLowerCase() === needle ||
        u.name.toLowerCase() === `${needle}s`,
    );
    if (loose) return { unit: loose, category: category.name };
  }
  return undefined;
}

/** At most 4 decimals with trailing zeros trimmed (212.0000 → "212"). */
function formatNumber(value: number): string {
  return String(Number(value.toFixed(4)));
}

/**
 * /units (aliases /unit, /convert): bare or empty args open the panel;
 * "<number> <from> to <to>" answers inline with canonical unit symbols.
 * Unknown units, cross-category pairs and non-numeric amounts fall back
 * with the "I don't understand" message and open the panel.
 */
export const unitsCommand: TerminalCommand = {
  name: "units",
  aliases: ["unit", "convert"],
  summary: "Convert between units of measurement inline",
  usage: ["/units", "/units 10 km to mi", "/units 100 c to f"],
  category: "Utilities",
  slug: "units",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const input = args.trim();
    if (input === "") {
      return { type: "open", slug: "units" };
    }
    const tokens = input.split(/\s+/);
    if (tokens.length !== 4 || tokens[2]?.toLowerCase() !== "to") {
      return { type: "fallback", slug: "units", message: fallbackMessage(input) };
    }
    const amount = Number(tokens[0]);
    const from = resolveUnitToken(tokens[1] ?? "");
    const to = resolveUnitToken(tokens[3] ?? "");
    if (
      !Number.isFinite(amount) ||
      from === undefined ||
      to === undefined ||
      from.category !== to.category
    ) {
      return { type: "fallback", slug: "units", message: fallbackMessage(input) };
    }
    const result = convertUnit(amount, from.unit, to.unit, from.category);
    return {
      type: "answer",
      output: [
        {
          type: "text",
          text: `${formatNumber(amount)} ${from.unit.symbol} = ${formatNumber(result)} ${to.unit.symbol}`,
        },
      ],
    };
  },
};
