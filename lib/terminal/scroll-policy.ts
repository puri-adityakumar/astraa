/**
 * Pure scroll policy for the terminal main column (architecture §13): an
 * empty history shows the home view and must stay at its top (fresh load
 * and /clear), nonempty scrollback chases its newest entry, a newly opened
 * or switched panel scrolls to the top of the column so its header (and
 * Esc hint) stays visible, and everything else — entries added while a
 * panel stays open, direct panel loads — must not scroll at all.
 */
export type ScrollAction = "top" | "bottom" | "panel" | "none";

export interface ScrollState {
  /** A tool panel is currently open. */
  panelOpen: boolean;
  /** The open panel changed since the previous run (open or switch). */
  panelChanged: boolean;
  /** The scrollback holds at least one entry. */
  hasEntries: boolean;
}

/** The scroll action the shell performs for the given column state. */
export function scrollAction({
  panelOpen,
  panelChanged,
  hasEntries,
}: ScrollState): ScrollAction {
  if (panelOpen) {
    return panelChanged ? "panel" : "none";
  }
  return hasEntries ? "bottom" : "top";
}
