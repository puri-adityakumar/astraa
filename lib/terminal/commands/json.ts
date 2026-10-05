import { serialize } from "@/lib/json/serialize";
import type { JsonValue } from "@/lib/json/types";
import type { CommandContext, CommandResult, TerminalCommand } from "../types";

function fallbackMessage(args: string, position: number | null): string {
  const at = position === null ? "" : ` Invalid JSON at position ${position}.`;
  return `I don't understand "${args}".${at} Opening JSON…`;
}

const NUMBER_RE = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const HEX_RE = /[0-9a-fA-F]{4}/y;
const ESCAPE_CHARS = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);

class JsonScanError extends Error {
  readonly at: number;
  constructor(at: number) {
    super("invalid JSON");
    this.at = at;
  }
}

function fail(at: number): never {
  throw new JsonScanError(at);
}

function skipWhitespace(text: string, index: number): number {
  while (index < text.length) {
    const ch = text.charCodeAt(index);
    if (ch !== 0x20 && ch !== 0x09 && ch !== 0x0a && ch !== 0x0d) break;
    index += 1;
  }
  return index;
}

function parseString(text: string, start: number): number {
  let i = start + 1;
  while (i < text.length) {
    const ch = text.charAt(i);
    if (ch === "\\") {
      const next = text.charAt(i + 1);
      if (next === "") fail(i);
      if (next === "u") {
        HEX_RE.lastIndex = i + 2;
        if (!HEX_RE.test(text)) fail(i);
        i += 6;
        continue;
      }
      if (!ESCAPE_CHARS.has(next)) fail(i);
      i += 2;
      continue;
    }
    if (ch === '"') return i + 1;
    if (ch < " ") fail(i);
    i += 1;
  }
  fail(i);
}

function parseNumber(text: string, start: number): number {
  NUMBER_RE.lastIndex = start;
  const match = NUMBER_RE.exec(text);
  const [full] = match ?? [];
  if (!full) fail(start);
  return start + full.length;
}

function parseValue(text: string, index: number): number {
  const i = skipWhitespace(text, index);
  const ch = text.charAt(i);
  if (ch === "") fail(i);
  if (ch === "{") return parseObject(text, i);
  if (ch === "[") return parseArray(text, i);
  if (ch === '"') return parseString(text, i);
  if (ch === "-" || (ch >= "0" && ch <= "9")) return parseNumber(text, i);
  if (text.startsWith("true", i)) return i + 4;
  if (text.startsWith("false", i)) return i + 5;
  if (text.startsWith("null", i)) return i + 4;
  fail(i);
}

function parseObject(text: string, start: number): number {
  let i = skipWhitespace(text, start + 1);
  if (text.charAt(i) === "}") return i + 1;
  for (;;) {
    if (text.charAt(i) !== '"') fail(i);
    i = parseString(text, i);
    i = skipWhitespace(text, i);
    if (text.charAt(i) !== ":") fail(i);
    i = parseValue(text, i + 1);
    i = skipWhitespace(text, i);
    const ch = text.charAt(i);
    if (ch === ",") {
      i = skipWhitespace(text, i + 1);
      continue;
    }
    if (ch === "}") return i + 1;
    fail(i);
  }
}

function parseArray(text: string, start: number): number {
  let i = skipWhitespace(text, start + 1);
  if (text.charAt(i) === "]") return i + 1;
  for (;;) {
    i = parseValue(text, i);
    i = skipWhitespace(text, i);
    const ch = text.charAt(i);
    if (ch === ",") {
      i = skipWhitespace(text, i + 1);
      continue;
    }
    if (ch === "]") return i + 1;
    fail(i);
  }
}

/**
 * The 0-based index of the first syntax violation in a JSON document, or
 * null when none is found. Only called after JSON.parse already rejected
 * the input: validity stays with JSON.parse, this only locates the failure
 * for the error message. Runtime parse errors often carry no position, so
 * the scan is the dependable source for one.
 */
export function findFirstSyntaxError(text: string): number | null {
  try {
    let i = parseValue(text, skipWhitespace(text, 0));
    i = skipWhitespace(text, i);
    return i < text.length ? i : null;
  } catch (error) {
    if (error instanceof JsonScanError) return error.at;
    return null;
  }
}

/**
 * /json: bare or empty args open the panel. Any JSON that JSON.parse
 * accepts — including bare literals like 42 or "x" — answers with a
 * "Valid JSON" line and a 2-space pretty-printed code block. Invalid JSON
 * falls back with the parse error position in the message and opens the
 * panel.
 */
export const jsonCommand: TerminalCommand = {
  name: "json",
  aliases: [],
  summary: "Validate and pretty-print JSON inline",
  usage: ["/json", "/json {\"a\":1}", "/json 42"],
  category: "Developer Tools",
  slug: "json",
  status: "live",
  run(args: string, _ctx: CommandContext): CommandResult {
    const input = args.trim();
    if (input === "") {
      return { type: "open", slug: "json" };
    }
    try {
      const value = JSON.parse(input) as JsonValue;
      const pretty = serialize(value, { indent: 2, sortKeys: false });
      return {
        type: "answer",
        output: [
          { type: "text", text: "Valid JSON" },
          { type: "code", code: pretty, language: "json" },
        ],
      };
    } catch {
      return {
        type: "fallback",
        slug: "json",
        message: fallbackMessage(input, findFirstSyntaxError(input)),
      };
    }
  },
};
