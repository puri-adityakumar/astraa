import { generatePassword } from "@/lib/password/password-utils";
import type { CommandContext, CommandResult, OutputBlock, TerminalCommand } from "../types";

const DEFAULT_LENGTH = 16;
const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const HINT = "Use /password <8-128> or open the generator";
const ALL_CHAR_TYPES = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
} as const;

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Password…`;
}

/**
 * /password (aliases /pw, /pass): the bare command answers a 16-character
 * password (every character type enabled) as a secret block plus the length
 * hint — the exception to the bare-opens-panel rule. "/password <length>"
 * answers with a password of that length; the terminal enforces 8–128 (the
 * lib itself only demands length ≥ character-type count). Anything else —
 * out-of-range, non-integer or non-numeric lengths — falls back with the
 * "I don't understand" message and opens the panel. The generated secret
 * lives only in the secret block; the command result is never stored in
 * history with its arguments.
 */
export const passwordCommand: TerminalCommand = {
  name: "password",
  aliases: ["pw", "pass"],
  summary: "Generate a strong password inline",
  usage: ["/password", "/password 24"],
  category: "Utilities",
  slug: "password",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const input = args.trim();
    const bare = input === "";
    let length: number;
    if (bare) {
      length = DEFAULT_LENGTH;
    } else {
      const parsed = Number(input);
      if (
        !Number.isInteger(parsed) ||
        parsed < MIN_LENGTH ||
        parsed > MAX_LENGTH
      ) {
        return { type: "fallback", slug: "password", message: fallbackMessage(input) };
      }
      length = parsed;
    }

    const result = generatePassword(length, ALL_CHAR_TYPES);
    if (!result.success) {
      return { type: "fallback", slug: "password", message: fallbackMessage(input) };
    }
    const output: OutputBlock[] = [{ type: "secret", secret: result.password }];
    if (bare) output.push({ type: "text", text: HINT });
    return { type: "answer", output };
  },
};
