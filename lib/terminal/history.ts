/**
 * Pure in-memory history navigation for the prompt. `index` is the history
 * position currently on screen, or null when the user is editing a fresh
 * line; `draft` preserves the in-progress input from the moment recall
 * started so ArrowDown can restore it at the end of the walk.
 */
export interface HistoryNav {
  /** Position in the history array being viewed; null = editing freely. */
  readonly index: number | null;
  /** Input as typed before recall began; restored at the end of recall. */
  readonly draft: string;
}

export const initialHistoryNav: HistoryNav = { index: null, draft: "" };

/** ArrowUp: newest entry first, then backwards; no-op on an empty history. */
export function recallPrevious(
  nav: HistoryNav,
  history: readonly string[],
  currentInput: string,
): HistoryNav {
  if (history.length === 0) return nav;
  if (nav.index === null) return { index: history.length - 1, draft: currentInput };
  return nav.index > 0 ? { ...nav, index: nav.index - 1 } : nav;
}

/** ArrowDown: forward again; at the end, restore the draft. */
export function recallNext(nav: HistoryNav, history: readonly string[]): HistoryNav {
  if (nav.index === null) return nav;
  if (nav.index < history.length - 1) return { ...nav, index: nav.index + 1 };
  return { index: null, draft: nav.draft };
}
