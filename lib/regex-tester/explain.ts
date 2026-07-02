import { tokenLabel } from "./token-labels";
import type { ExplainNode, PatternToken } from "./types";

/**
 * Build a human-readable explain tree from a flat stream of {@link PatternToken}s.
 *
 * Groups (capturing, non-capturing, named, lookaround) and character classes
 * become parent nodes whose children are the explain nodes for the tokens
 * inside them. All other tokens become leaf nodes with a human label/detail.
 *
 * Label/detail text is sourced from {@link tokenLabel} (the single source of
 * truth) wherever possible. The one exception is `groupOpen`, which augments
 * the base label with the capture-group index — information that isn't
 * available to `tokenLabel`.
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

  /** Build a leaf node from a token using {@link tokenLabel} for label/detail. */
  const leaf = (token: PatternToken): ExplainNode => {
    const meta = tokenLabel(token);
    return {
      id: nextId(),
      label: meta.label,
      detail: meta.detail,
      sourceRange: [token.startIndex, token.endIndex],
    };
  };

  /** Open a frame for a group-like token, sourcing label/detail from tokenLabel. */
  const openFrame = (token: PatternToken): void => {
    const meta = tokenLabel(token);
    stack.push({
      open: token,
      children: [],
      label: meta.label,
      detail: meta.detail,
    });
  };

  for (const token of tokens) {
    switch (token.type) {
      case "groupOpen": {
        captureGroupIndex += 1;
        const meta = tokenLabel(token);
        stack.push({
          open: token,
          children: [],
          // Augment with the capture-group index, which tokenLabel can't know.
          label: `${meta.label} #${captureGroupIndex}`,
          detail: meta.detail,
        });
        break;
      }
      case "nonCaptureGroupOpen":
      case "namedGroupOpen":
      case "lookaheadPositive":
      case "lookaheadNegative":
      case "lookbehindPositive":
      case "lookbehindNegative": {
        openFrame(token);
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
        openFrame(token);
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
      case "range":
      case "escape":
      case "quantifier":
      case "anchorStart":
      case "anchorEnd":
      case "wordBoundary":
      case "nonWordBoundary":
      case "alternation":
      case "backreference":
      case "literal": {
        push(leaf(token));
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
    const end = lastChild ? lastChild.sourceRange[1] : frame.open.endIndex;
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
