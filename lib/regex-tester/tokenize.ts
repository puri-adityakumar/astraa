import type { PatternToken, PatternTokenType, TokenizeResult } from "./types";

/**
 * Lightweight regex pattern tokenizer.
 *
 * Produces a flat stream of {@link PatternToken}s annotated with nesting depth
 * for downstream use by the explain tree builder and pattern hover tooltips.
 *
 * This is a pragmatic recognizer, not a full ECMAScript regex parser:
 * - Inside character classes, `]` always closes (no escape-tracking edge cases
 *   beyond `\]`).
 * - Quantifiers are recognized greedily based on the immediately-preceding
 *   atom-like token.
 * - Malformed input still produces a best-effort token list, with `balanced`
 *   set to false when groups or character classes are left open.
 */
export function tokenize(pattern: string): TokenizeResult {
  const tokens: PatternToken[] = [];
  let depth = 0;
  let inClass = false;
  let classDepth = 0;
  let i = 0;
  let counter = 0;
  const nextId = (): string => `t${counter++}`;

  const push = (
    type: PatternTokenType,
    value: string,
    startIndex: number,
    endIndex: number,
    tokenDepth: number,
  ): void => {
    tokens.push({
      id: nextId(),
      type,
      value,
      startIndex,
      endIndex,
      depth: tokenDepth,
    });
  };

  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === undefined) break;

    if (inClass) {
      // Range like a-z (only when both sides are simple chars and not at the
      // very start/end of the class).
      if (ch === "]") {
        push("charClassClose", "]", i, i + 1, classDepth);
        inClass = false;
        i += 1;
        continue;
      }
      if (ch === "\\" && i + 1 < pattern.length) {
        const next = pattern[i + 1] ?? "";
        push("escape", `\\${next}`, i, i + 2, classDepth + 1);
        i += 2;
        continue;
      }
      // Detect range: simple char, "-", simple char (where the next "-" isn't
      // immediately before "]").
      const next = pattern[i + 1];
      const after = pattern[i + 2];
      if (
        next === "-" &&
        after !== undefined &&
        after !== "]" &&
        ch !== "-"
      ) {
        push("range", `${ch}-${after}`, i, i + 3, classDepth + 1);
        i += 3;
        continue;
      }
      push("literal", ch, i, i + 1, classDepth + 1);
      i += 1;
      continue;
    }

    // Escapes outside character classes.
    if (ch === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1] ?? "";
      if (next === "b") {
        push("wordBoundary", "\\b", i, i + 2, depth);
        i += 2;
        continue;
      }
      if (next === "B") {
        push("nonWordBoundary", "\\B", i, i + 2, depth);
        i += 2;
        continue;
      }
      if (/[1-9]/.test(next)) {
        // Multi-digit backreference (\10, \11...).
        let j = i + 2;
        while (j < pattern.length) {
          const c = pattern[j];
          if (c === undefined || !/[0-9]/.test(c)) break;
          j += 1;
        }
        push("backreference", pattern.slice(i, j), i, j, depth);
        i = j;
        continue;
      }
      push("escape", `\\${next}`, i, i + 2, depth);
      i += 2;
      continue;
    }

    if (ch === "[") {
      push("charClassOpen", "[", i, i + 1, depth);
      inClass = true;
      classDepth = depth;
      i += 1;
      continue;
    }

    if (ch === "(") {
      // Look for group prefixes: (?: (?= (?! (?<= (?<! (?<name>
      const rest = pattern.slice(i);
      if (rest.startsWith("(?:")) {
        push("nonCaptureGroupOpen", "(?:", i, i + 3, depth);
        depth += 1;
        i += 3;
        continue;
      }
      if (rest.startsWith("(?=")) {
        push("lookaheadPositive", "(?=", i, i + 3, depth);
        depth += 1;
        i += 3;
        continue;
      }
      if (rest.startsWith("(?!")) {
        push("lookaheadNegative", "(?!", i, i + 3, depth);
        depth += 1;
        i += 3;
        continue;
      }
      if (rest.startsWith("(?<=")) {
        push("lookbehindPositive", "(?<=", i, i + 4, depth);
        depth += 1;
        i += 4;
        continue;
      }
      if (rest.startsWith("(?<!")) {
        push("lookbehindNegative", "(?<!", i, i + 4, depth);
        depth += 1;
        i += 4;
        continue;
      }
      const named = /^\(\?<([A-Za-z_][A-Za-z0-9_]*)>/.exec(rest);
      if (named) {
        const value = named[0];
        push("namedGroupOpen", value, i, i + value.length, depth);
        depth += 1;
        i += value.length;
        continue;
      }
      push("groupOpen", "(", i, i + 1, depth);
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      push("groupClose", ")", i, i + 1, depth);
      i += 1;
      continue;
    }

    if (ch === "|") {
      push("alternation", "|", i, i + 1, depth);
      i += 1;
      continue;
    }

    if (ch === "^") {
      push("anchorStart", "^", i, i + 1, depth);
      i += 1;
      continue;
    }

    if (ch === "$") {
      push("anchorEnd", "$", i, i + 1, depth);
      i += 1;
      continue;
    }

    if (ch === "*" || ch === "+" || ch === "?") {
      const lazy = pattern[i + 1] === "?";
      const value = lazy ? `${ch}?` : ch;
      push("quantifier", value, i, i + value.length, depth);
      i += value.length;
      continue;
    }

    if (ch === "{") {
      // Match a {n}, {n,}, or {n,m} quantifier.
      const rest = pattern.slice(i);
      const match = /^\{\d+(?:,\d*)?\}\??/.exec(rest);
      if (match) {
        const value = match[0];
        push("quantifier", value, i, i + value.length, depth);
        i += value.length;
        continue;
      }
      // Treat as literal if not a valid quantifier.
      push("literal", ch, i, i + 1, depth);
      i += 1;
      continue;
    }

    push("literal", ch, i, i + 1, depth);
    i += 1;
  }

  const balanced = depth === 0 && !inClass;
  return { tokens, balanced };
}
