import { tokenLabel } from "./token-labels";
import type { ExplainNode, PatternToken, PatternTokenType } from "./types";

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

/**
 * Metadata for the "open" token types — those that start a parent frame on the
 * stack. Presence in this map marks a type as an open. The optional fields
 * override the {@link tokenLabel} label/detail, and `capture` marks the type as
 * a numbered capturing group (whose label is augmented with `#<index>`).
 */
const OPEN_META: Partial<
  Record<PatternTokenType, { label?: string; detail?: string; capture?: boolean }>
> = {
  groupOpen: { capture: true },
  nonCaptureGroupOpen: {},
  namedGroupOpen: {},
  lookaheadPositive: {},
  lookaheadNegative: {},
  lookbehindPositive: {},
  lookbehindNegative: {},
  charClassOpen: {},
};

export function buildExplainTree(tokens: PatternToken[]): ExplainNode[] {
  let counter = 0;
  const nextId = (): string => `e${counter++}`;

  // Counted so capturing-group labels can be augmented with a 1-based index.
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

  /**
   * Open a frame for a group-like token. Label/detail come from
   * {@link tokenLabel} (overridable via {@link OPEN_META}); capturing groups
   * additionally bump the index and augment their label with `#<index>`.
   */
  const openFrame = (token: PatternToken): void => {
    const base = tokenLabel(token);
    const meta = OPEN_META[token.type];
    let label = meta?.label ?? base.label;
    let detail = meta?.detail ?? base.detail;
    if (meta?.capture) {
      captureGroupIndex += 1;
      label = `${label} #${captureGroupIndex}`;
    }
    stack.push({ open: token, children: [], label, detail });
  };

  /**
   * Close the top frame, promoting it to a parent node spanning from the open
   * token to this close token. A stray close (empty stack) renders as a leaf
   * using the supplied fallback label/detail.
   */
  const closeFrame = (token: PatternToken, strayLabel: string, strayDetail: string): void => {
    const frame = stack.pop();
    if (!frame) {
      push({
        id: nextId(),
        label: strayLabel,
        detail: strayDetail,
        sourceRange: [token.startIndex, token.endIndex],
      });
      return;
    }
    push({
      id: nextId(),
      label: frame.label,
      detail: frame.detail,
      sourceRange: [frame.open.startIndex, token.endIndex],
      children: frame.children,
    });
  };

  for (const token of tokens) {
    switch (token.type) {
      case "groupOpen":
      case "nonCaptureGroupOpen":
      case "namedGroupOpen":
      case "lookaheadPositive":
      case "lookaheadNegative":
      case "lookbehindPositive":
      case "lookbehindNegative":
      case "charClassOpen": {
        openFrame(token);
        break;
      }
      case "groupClose": {
        closeFrame(token, "Stray )", "Unmatched closing parenthesis.");
        break;
      }
      case "charClassClose": {
        closeFrame(token, "Stray ]", "Unmatched closing bracket.");
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
