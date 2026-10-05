import {
  generateLorem,
  parseLoremUnit,
  type RandomGenerator,
} from "@/lib/text/lorem";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Text…`;
}

/**
 * /text (alias /lorem): bare args open the lorem panel. "<count> <unit>"
 * answers inline with locally generated lorem ipsum — units are
 * case-insensitive and singular forms are accepted; the unit's limits
 * (words 1–1000, sentences 1–100, paragraphs 1–20) and count parsing live in
 * lib/text/lorem.ts, whose throws become fallbacks with the "I don't
 * understand" message and the panel. The RNG is injectable so tests stay
 * hermetic.
 */
export function runText(args: string, random?: RandomGenerator): CommandResult {
  const input = args.trim();
  if (input === "") {
    return { type: "open", slug: "text" };
  }
  const tokens = input.split(/\s+/);
  const unit = tokens.length === 2 ? parseLoremUnit(tokens[1] ?? "") : null;
  const count = Number(tokens[0]);
  if (unit === null || !Number.isInteger(count)) {
    return { type: "fallback", slug: "text", message: fallbackMessage(input) };
  }
  try {
    const text = generateLorem({ count, unit, ...(random ? { random } : {}) });
    return { type: "answer", output: [{ type: "text", text }] };
  } catch {
    return { type: "fallback", slug: "text", message: fallbackMessage(input) };
  }
}

export const textCommand: TerminalCommand = {
  name: "text",
  aliases: ["lorem"],
  summary: "Generate lorem ipsum placeholder text",
  usage: ["/text", "/text 5 words", "/text 2 paragraphs"],
  category: "Utilities",
  slug: "text",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    return runText(args);
  },
};
