import type { PatternToken } from "./types";

export interface TokenLabel {
  label: string;
  detail: string;
}

function escapeLabel(value: string): TokenLabel {
  const c = value[1];
  switch (c) {
    case "d":
      return { label: "Digit class", detail: "Matches any single digit (0-9)." };
    case "D":
      return {
        label: "Non-digit class",
        detail: "Matches any character that is not a digit.",
      };
    case "w":
      return {
        label: "Word class",
        detail: "Matches any word character (A-Z, a-z, 0-9, _).",
      };
    case "W":
      return {
        label: "Non-word class",
        detail: "Matches any character that is not a word character.",
      };
    case "s":
      return {
        label: "Whitespace class",
        detail: "Matches any whitespace character (space, tab, newline...).",
      };
    case "S":
      return {
        label: "Non-whitespace class",
        detail: "Matches any character that is not whitespace.",
      };
    case "n":
      return { label: "Newline", detail: "Matches a newline (LF) character." };
    case "r":
      return {
        label: "Carriage return",
        detail: "Matches a carriage return (CR) character.",
      };
    case "t":
      return { label: "Tab", detail: "Matches a tab character." };
    case ".":
      return { label: "Literal dot", detail: "Matches a literal period." };
    case "\\":
      return {
        label: "Literal backslash",
        detail: "Matches a literal backslash.",
      };
    default:
      return {
        label: "Escaped character",
        detail: `Matches the literal character "${c ?? ""}".`,
      };
  }
}

function quantifierLabel(value: string): TokenLabel {
  const lazy = value.endsWith("?") && value.length > 1 && value !== "?";
  const core = lazy ? value.slice(0, -1) : value;
  const suffix = lazy ? " (lazy)" : "";
  if (core === "*") {
    return {
      label: `Quantifier *${suffix}`,
      detail: `Matches zero or more of the previous token${suffix}.`,
    };
  }
  if (core === "+") {
    return {
      label: `Quantifier +${suffix}`,
      detail: `Matches one or more of the previous token${suffix}.`,
    };
  }
  if (core === "?") {
    return {
      label: `Quantifier ?${suffix}`,
      detail: `Matches zero or one of the previous token${suffix}.`,
    };
  }
  return {
    label: `Quantifier ${value}`,
    detail: `Matches the previous token a specific number of times${suffix}.`,
  };
}

export function tokenLabel(token: PatternToken): TokenLabel {
  switch (token.type) {
    case "literal":
      return {
        label: "Literal",
        detail: `Matches the character "${token.value}".`,
      };
    case "escape":
      return escapeLabel(token.value);
    case "charClassOpen":
      return {
        label: "Character class start",
        detail: "Starts a [...] class — matches any one character inside.",
      };
    case "charClassClose":
      return {
        label: "Character class end",
        detail: "Closes the character class.",
      };
    case "range": {
      const [from, , to] = token.value;
      return {
        label: "Range",
        detail: `Matches any character from "${from ?? ""}" to "${to ?? ""}".`,
      };
    }
    case "groupOpen":
      return {
        label: "Capturing group",
        detail: "Captures the inner pattern as a numbered group.",
      };
    case "namedGroupOpen": {
      const name = token.value.slice(3, -1);
      return {
        label: "Named group",
        detail: `Captures the inner pattern as group "${name}".`,
      };
    }
    case "nonCaptureGroupOpen":
      return {
        label: "Non-capturing group",
        detail: "Groups the inner pattern without exposing a capture.",
      };
    case "groupClose":
      return { label: "Group end", detail: "Closes the group." };
    case "lookaheadPositive":
      return {
        label: "Positive lookahead",
        detail: "Asserts that the inner pattern follows, without consuming.",
      };
    case "lookaheadNegative":
      return {
        label: "Negative lookahead",
        detail: "Asserts that the inner pattern does NOT follow.",
      };
    case "lookbehindPositive":
      return {
        label: "Positive lookbehind",
        detail: "Asserts that the inner pattern immediately precedes.",
      };
    case "lookbehindNegative":
      return {
        label: "Negative lookbehind",
        detail: "Asserts that the inner pattern does NOT immediately precede.",
      };
    case "alternation":
      return {
        label: "Alternation",
        detail: "Matches either the left side or the right side.",
      };
    case "quantifier":
      return quantifierLabel(token.value);
    case "anchorStart":
      return {
        label: "Start anchor",
        detail: "Matches the start of the string (or line with m flag).",
      };
    case "anchorEnd":
      return {
        label: "End anchor",
        detail: "Matches the end of the string (or line with m flag).",
      };
    case "wordBoundary":
      return {
        label: "Word boundary",
        detail: "Matches a position between a word and non-word character.",
      };
    case "nonWordBoundary":
      return {
        label: "Non-word boundary",
        detail: "Matches a position that is NOT a word boundary.",
      };
    case "backreference":
      return {
        label: "Backreference",
        detail: `Matches the same text captured by group ${token.value.slice(1)}.`,
      };
    default: {
      const _exhaustive: never = token.type;
      void _exhaustive;
      return { label: "Token", detail: token.value };
    }
  }
}
