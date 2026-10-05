import { compileRegex } from "@/lib/regex-tester/compile";
import { MATCH_CAP } from "@/lib/regex-tester/match";
import { runMatchesSafe } from "@/lib/regex-tester/redos-client";
import type { CommandContext, CommandResult, OutputBlock, TerminalCommand } from "../types";

function fallbackMessage(args: string): string {
  return `I don't understand "${args}". Opening Regex…`;
}

/** How many (index, value) rows are listed before the output truncates. */
const LIST_CAP = 50;

export type ParsedRegexArgs = {
  pattern: string;
  flags: string;
  text: string;
};

/**
 * Splits "/<pattern>/<flags> <text>" into its parts. The pattern may contain
 * escaped forward slashes; the text is everything after the first whitespace
 * following the flags, kept verbatim. Returns null when the shape does not
 * match (missing delimiter) so the caller can fall back.
 */
export function parseRegexArgs(input: string): ParsedRegexArgs | null {
  if (!input.startsWith("/") || input.length < 2) return null;
  let i = 1;
  let close = -1;
  while (i < input.length) {
    const ch = input.charAt(i);
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "/") {
      close = i;
      break;
    }
    i += 1;
  }
  if (close === -1) return null;
  const pattern = input.slice(1, close);
  const rest = input.slice(close + 1);
  const firstWhitespace = rest.search(/\s/);
  if (firstWhitespace === -1) {
    return { pattern, flags: rest, text: "" };
  }
  return {
    pattern,
    flags: rest.slice(0, firstWhitespace),
    text: rest.slice(firstWhitespace + 1),
  };
}

/**
 * /regex (alias /re): bare or empty args open the panel.
 * "/<pattern>/<flags> <text>" reports the match count and lists every match
 * with its index and value. Matching runs through runMatchesSafe — the
 * ReDoS-safe worker route with a hard timeout — so catastrophic patterns
 * fall back instead of freezing the page. An invalid pattern, invalid flags
 * or missing test text also falls back.
 */
export const regexCommand: TerminalCommand = {
  name: "regex",
  aliases: ["re"],
  summary: "Match a regular expression against text inline",
  usage: ["/regex", "/regex /\\d+/g a1b22c333", "/regex /[a-z]+/i Find Me"],
  category: "Developer Tools",
  slug: "regex",
  status: "live",
  async run(args: string, _ctx: CommandContext): Promise<CommandResult> {
    const input = args.trim();
    if (input === "") {
      return { type: "open", slug: "regex" };
    }

    const parsed = parseRegexArgs(input);
    const compiled = parsed ? compileRegex(parsed.pattern, parsed.flags) : null;
    if (!parsed || !compiled?.ok || parsed.text.trim() === "") {
      return { type: "fallback", slug: "regex", message: fallbackMessage(input) };
    }

    const safe = await runMatchesSafe(parsed.pattern, parsed.flags, parsed.text);
    if (safe.timedOut || safe.hardTimeout) {
      return { type: "fallback", slug: "regex", message: fallbackMessage(input) };
    }
    if (safe.results.length === 0) {
      return { type: "answer", output: [{ type: "text", text: "No matches." }] };
    }

    const total = safe.results.length;
    const shown = safe.results.slice(0, LIST_CAP);
    const output: OutputBlock[] = [
      { type: "text", text: `${total} match${total === 1 ? "" : "es"}` },
      {
        type: "list",
        items: shown.map((m) => `${JSON.stringify(m.full)} at index ${m.index}`),
      },
    ];
    if (shown.length < total) {
      output.push({
        type: "text",
        text: `… ${total - shown.length} more not shown.`,
      });
    }
    if (safe.capped) {
      output.push({
        type: "text",
        text: `Stopped at the ${MATCH_CAP}-match cap.`,
      });
    }
    return { type: "answer", output };
  },
};
