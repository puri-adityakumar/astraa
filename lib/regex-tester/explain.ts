import { tokenLabel } from "./token-labels";
import type { ExplainNode, PatternToken } from "./types";

/**
 * Build a human-readable explain tree from a flat stream of {@link PatternToken}s.
 *
 * Groups (capturing, non-capturing, named, lookaround) and character classes
 * become parent nodes whose children are the explain nodes for the tokens
 * inside them. All other tokens become leaf nodes with a human label/detail.
 */
export function buildExplainTree(tokens: PatternToken[]): ExplainNode[] {
  let counter = 0;
  const nextId = (): string => `e${counter++}`;

  // Track named-group registrations so backreferences can mention them by name
  // if we ever extend the format (currently we just count groups for numeric
  // backreferences).
  let captureGroupIndex = 0;

  type Frame = {
    open: PatternToken;
    children: ExplainNode[];
    label: string;
    detail: string;
  };

  const root: ExplainNode[] = [];
  const stack: Frame[] = [];

  const push = (node: ExplainNode): void => {
    const top = stack[stack.length - 1];
    if (top) {
      top.children.push(node);
    } else {
      root.push(node);
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case "groupOpen": {
        captureGroupIndex += 1;
        stack.push({
          open: token,
          children: [],
          label: `Capturing group #${captureGroupIndex}`,
          detail: "Captures the inner pattern and exposes it as a numbered group.",
        });
        break;
      }
      case "nonCaptureGroupOpen": {
        stack.push({
          open: token,
          children: [],
          label: "Non-capturing group",
          detail: "Groups the inner pattern without exposing it as a capture.",
        });
        break;
      }
      case "namedGroupOpen": {
        captureGroupIndex += 1;
        const name = token.value.slice(3, -1); // strip "(?<" and ">"
        stack.push({
          open: token,
          children: [],
          label: "Named group",
          detail: `Captures the inner pattern as group "${name}".`,
        });
        break;
      }
      case "lookaheadPositive": {
        stack.push({
          open: token,
          children: [],
          label: "Positive lookahead",
          detail: "Asserts that the inner pattern matches at this position without consuming.",
        });
        break;
      }
      case "lookaheadNegative": {
        stack.push({
          open: token,
          children: [],
          label: "Negative lookahead",
          detail: "Asserts that the inner pattern does NOT match at this position.",
        });
        break;
      }
      case "lookbehindPositive": {
        stack.push({
          open: token,
          children: [],
          label: "Positive lookbehind",
          detail: "Asserts that the inner pattern matches immediately before this position.",
        });
        break;
      }
      case "lookbehindNegative": {
        stack.push({
          open: token,
          children: [],
          label: "Negative lookbehind",
          detail:
            "Asserts that the inner pattern does NOT match immediately before this position.",
        });
        break;
      }
      case "groupClose": {
        const frame = stack.pop();
        if (!frame) {
          // Stray close — render as a leaf.
          push({
            id: nextId(),
            label: "Stray )",
            detail: "Unmatched closing parenthesis.",
            sourceRange: [token.startIndex, token.endIndex],
          });
          break;
        }
        push({
          id: nextId(),
          label: frame.label,
          detail: frame.detail,
          sourceRange: [frame.open.startIndex, token.endIndex],
          children: frame.children,
        });
        break;
      }
      case "charClassOpen": {
        stack.push({
          open: token,
          children: [],
          label: "Character class",
          detail: "Matches any one character listed inside the brackets.",
        });
        break;
      }
      case "charClassClose": {
        const frame = stack.pop();
        if (!frame) {
          push({
            id: nextId(),
            label: "Stray ]",
            detail: "Unmatched closing bracket.",
            sourceRange: [token.startIndex, token.endIndex],
          });
          break;
        }
        push({
          id: nextId(),
          label: frame.label,
          detail: frame.detail,
          sourceRange: [frame.open.startIndex, token.endIndex],
          children: frame.children,
        });
        break;
      }
      case "range": {
        const [from, , to] = token.value;
        push({
          id: nextId(),
          label: "Range",
          detail: `Matches any character from "${from ?? ""}" to "${to ?? ""}".`,
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "escape": {
        const meta = tokenLabel(token);
        push({
          id: nextId(),
          label: meta.label,
          detail: meta.detail,
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "quantifier": {
        const meta = tokenLabel(token);
        push({
          id: nextId(),
          label: meta.label,
          detail: meta.detail,
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "anchorStart": {
        push({
          id: nextId(),
          label: "Start anchor",
          detail: "Matches the start of the string (or line with the m flag).",
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "anchorEnd": {
        push({
          id: nextId(),
          label: "End anchor",
          detail: "Matches the end of the string (or line with the m flag).",
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "wordBoundary": {
        push({
          id: nextId(),
          label: "Word boundary",
          detail: "Matches a position between a word and non-word character.",
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "nonWordBoundary": {
        push({
          id: nextId(),
          label: "Non-word boundary",
          detail: "Matches a position that is NOT a word boundary.",
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "alternation": {
        push({
          id: nextId(),
          label: "Alternation",
          detail: "Matches either the left side or the right side.",
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "backreference": {
        const num = token.value.slice(1);
        push({
          id: nextId(),
          label: "Backreference",
          detail: `Matches the same text captured by group ${num}.`,
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      case "literal": {
        push({
          id: nextId(),
          label: "Literal",
          detail: `Matches the character "${token.value}".`,
          sourceRange: [token.startIndex, token.endIndex],
        });
        break;
      }
      default: {
        // Exhaustive guard — should never hit.
        const _exhaustive: never = token.type;
        void _exhaustive;
        break;
      }
    }
  }

  // Any frames left on the stack are unclosed; flush them as best-effort
  // parent nodes so the tree still renders.
  while (stack.length > 0) {
    const frame = stack.pop();
    if (!frame) break;
    const lastChild = frame.children[frame.children.length - 1];
    const end = lastChild
      ? lastChild.sourceRange[1]
      : frame.open.endIndex;
    const node: ExplainNode = {
      id: nextId(),
      label: frame.label,
      detail: `${frame.detail} (unclosed)`,
      sourceRange: [frame.open.startIndex, end],
      children: frame.children,
    };
    const top = stack[stack.length - 1];
    if (top) {
      top.children.push(node);
    } else {
      root.push(node);
    }
  }

  return root;
}

