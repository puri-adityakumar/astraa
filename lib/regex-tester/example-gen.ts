import { tokenize } from "./tokenize";
import type { PatternToken } from "./types";

const MAX_LENGTH = 32;
const MAX_REPEAT = 5;

type Atom = string | null;

function escapeSample(value: string): Atom {
  const c = value[1];
  switch (c) {
    case "d":
      return "5";
    case "w":
      return "a";
    case "s":
      return " ";
    case "D":
      return "x";
    case "W":
      return "!";
    case "S":
      return "a";
    case "n":
      return "\n";
    case "r":
      return "\r";
    case "t":
      return "\t";
    case ".":
      return ".";
    case "\\":
      return "\\";
    default:
      return c ?? "";
  }
}

function rangeFirst(value: string): Atom {
  const [from] = value;
  return from ?? null;
}

function expandQuantifier(
  base: string,
  quantifierValue: string,
): string | null {
  const lazy = quantifierValue.endsWith("?") && quantifierValue.length > 1;
  const core = lazy ? quantifierValue.slice(0, -1) : quantifierValue;

  if (core === "*") return base;
  if (core === "+") return base.repeat(2);
  if (core === "?") return base;

  const braced = core.match(/^\{(\d+)(?:,(\d*))?\}$/);
  if (!braced) return null;
  const min = Number(braced[1]);
  if (!Number.isFinite(min) || min < 0) return null;
  if (min > MAX_REPEAT) return null;
  return base.repeat(min || 1);
}

export function generateExample(pattern: string): string | null {
  if (!pattern) return null;
  const result = tokenize(pattern);
  if (!result.balanced) return null;

  const out: string[] = [];
  let inClass = false;
  let groupAltDepth = 0;
  let skipGroup = false;
  // First-alternation tracking per group (depth -> seenAlternation?).
  const alternationSeen: boolean[] = [];

  for (let i = 0; i < result.tokens.length; i++) {
    const token = result.tokens[i];
    if (!token) continue;

    // Unsupported constructs → bail out cleanly.
    if (
      token.type === "lookbehindPositive" ||
      token.type === "lookbehindNegative" ||
      token.type === "lookaheadNegative" ||
      token.type === "backreference"
    ) {
      return null;
    }

    if (token.type === "charClassOpen") {
      inClass = true;
      continue;
    }
    if (token.type === "charClassClose") {
      inClass = false;
      continue;
    }

    if (inClass) {
      // Inside a class, pick the first concrete atom we find for this class.
      // To keep things simple we emit each character-class entry's first atom
      // immediately, then skip until the closing bracket on the next iteration.
      if (token.type === "range") {
        const sample = rangeFirst(token.value);
        if (sample) out.push(sample);
        // Skip to class close.
        while (
          i + 1 < result.tokens.length &&
          result.tokens[i + 1] &&
          result.tokens[i + 1]!.type !== "charClassClose"
        ) {
          i++;
        }
        continue;
      }
      if (token.type === "literal") {
        out.push(token.value);
        while (
          i + 1 < result.tokens.length &&
          result.tokens[i + 1] &&
          result.tokens[i + 1]!.type !== "charClassClose"
        ) {
          i++;
        }
        continue;
      }
      if (token.type === "escape") {
        const sample = escapeSample(token.value);
        if (sample !== null) out.push(sample);
        while (
          i + 1 < result.tokens.length &&
          result.tokens[i + 1] &&
          result.tokens[i + 1]!.type !== "charClassClose"
        ) {
          i++;
        }
        continue;
      }
      continue;
    }

    if (
      token.type === "groupOpen" ||
      token.type === "namedGroupOpen" ||
      token.type === "nonCaptureGroupOpen" ||
      token.type === "lookaheadPositive"
    ) {
      groupAltDepth += 1;
      alternationSeen[groupAltDepth] = false;
      if (token.type === "lookaheadPositive") {
        // Skip past closing ).
        skipGroup = true;
      }
      continue;
    }

    if (token.type === "groupClose") {
      alternationSeen[groupAltDepth] = false;
      groupAltDepth = Math.max(0, groupAltDepth - 1);
      skipGroup = false;
      continue;
    }

    if (skipGroup) continue;

    if (token.type === "alternation") {
      // Skip until the matching groupClose at the current depth.
      if (groupAltDepth > 0) {
        alternationSeen[groupAltDepth] = true;
        let depthCursor = groupAltDepth;
        while (i + 1 < result.tokens.length) {
          const next = result.tokens[i + 1];
          if (!next) break;
          if (
            next.type === "groupOpen" ||
            next.type === "namedGroupOpen" ||
            next.type === "nonCaptureGroupOpen" ||
            next.type === "lookaheadPositive"
          ) {
            depthCursor += 1;
          } else if (next.type === "groupClose") {
            if (depthCursor === groupAltDepth) break;
            depthCursor -= 1;
          }
          i++;
        }
        continue;
      }
      // Top-level alternation: stop after the first branch.
      break;
    }

    if (
      token.type === "anchorStart" ||
      token.type === "anchorEnd" ||
      token.type === "wordBoundary" ||
      token.type === "nonWordBoundary"
    ) {
      continue;
    }

    if (token.type === "quantifier") {
      const last = out.pop();
      if (last === undefined) continue;
      const expanded = expandQuantifier(last, token.value);
      if (expanded === null) return null;
      out.push(expanded);
      if (out.join("").length > MAX_LENGTH) {
        return out.join("").slice(0, MAX_LENGTH);
      }
      continue;
    }

    if (token.type === "literal") {
      out.push(token.value);
    } else if (token.type === "escape") {
      const sample = escapeSample(token.value);
      if (sample !== null) out.push(sample);
    }

    if (out.join("").length > MAX_LENGTH) {
      return out.join("").slice(0, MAX_LENGTH);
    }
  }

  const composed = out.join("");
  if (composed.length === 0) return null;
  return composed.slice(0, MAX_LENGTH);
}
