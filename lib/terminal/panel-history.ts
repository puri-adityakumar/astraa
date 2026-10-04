/**
 * Pure decisions for panel URL sync (architecture §8): which History API
 * call a panel open or close needs, and which document.title belongs to
 * each state. The hook in components/terminal applies these to
 * window.history — pushState home→panel, replaceState panel→panel,
 * history.back() on close when we pushed the entry, replaceState("/")
 * otherwise, and popstate carries the panel state for Back/Forward.
 */
import type { Metadata } from "next";
import { homeMetadata, toolMetadataBySlug } from "@/lib/site-metadata";
import { isTerminalToolSlug, type TerminalToolSlug } from "./slugs";

/** Key carried by history entries that open a tool panel. */
export const PANEL_STATE_KEY = "termPanel";

export interface PanelHistoryState {
  [PANEL_STATE_KEY]?: string;
}

/** Keep in sync with the root layout's title template ("%s | Astraa"). */
const TITLE_TEMPLATE = "%s | Astraa";

function metadataTitle(title: Metadata["title"]): string {
  if (typeof title === "string") return TITLE_TEMPLATE.replace("%s", title);
  if (title && typeof title === "object" && "absolute" in title && title.absolute) {
    return title.absolute;
  }
  return "";
}

/** The home document title, from the shared home metadata. */
export function homeDocTitle(): string {
  return metadataTitle(homeMetadata.title);
}

/** A tool's document title, from the shared per-tool metadata. */
export function toolDocTitle(slug: TerminalToolSlug): string {
  return metadataTitle(toolMetadataBySlug[slug]?.title);
}

export type PanelTransition =
  | {
      kind: "push";
      url: string;
      state: PanelHistoryState;
      title: string;
      panel: TerminalToolSlug;
    }
  | {
      kind: "replace";
      url: string;
      state: PanelHistoryState;
      title: string;
      panel: TerminalToolSlug | null;
    }
  | { kind: "back"; panel: null; title: string }
  | { kind: "none" };

/** Open `next` while `current` shows (null = home): push or replace. */
export function openPanelTransition(
  current: TerminalToolSlug | null,
  next: TerminalToolSlug,
): PanelTransition {
  if (current === next) return { kind: "none" };
  const url = `/tools/${next}`;
  const state: PanelHistoryState = { [PANEL_STATE_KEY]: next };
  const title = toolDocTitle(next);
  if (current === null) {
    return { kind: "push", url, state, title, panel: next };
  }
  return { kind: "replace", url, state, title, panel: next };
}

/** Close the current panel; `pushed` says whether our pushState created the entry. */
export function closePanelTransition(pushed: boolean): PanelTransition {
  const title = homeDocTitle();
  if (pushed) return { kind: "back", panel: null, title };
  return { kind: "replace", url: "/", state: {}, title, panel: null };
}

/** Where a popstate (Back/Forward) leaves the panel and title. */
export function popstatePanel(state: unknown): {
  panel: TerminalToolSlug | null;
  pushed: boolean;
  title: string;
} {
  const slug = (state as PanelHistoryState | null)?.[PANEL_STATE_KEY];
  if (typeof slug === "string" && isTerminalToolSlug(slug)) {
    return { panel: slug, pushed: true, title: toolDocTitle(slug) };
  }
  return { panel: null, pushed: false, title: homeDocTitle() };
}
