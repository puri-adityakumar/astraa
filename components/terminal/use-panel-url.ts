"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  closePanelTransition,
  openPanelTransition,
  popstatePanel,
  toolDocTitle,
} from "@/lib/terminal/panel-history";
import type { ToolSlug } from "@/lib/terminal/types";

interface UsePanelUrl {
  panel: ToolSlug | null;
  open: (slug: ToolSlug) => void;
  close: () => void;
}

/**
 * Panel URL sync (architecture §8): home→panel pushState("/tools/<slug>")
 * with the tool's metadata title, panel→panel replaceState, closing via
 * history.back() when we pushed the entry or replaceState("/") otherwise,
 * and popstate driving open/close so Back closes and Forward reopens. No
 * path reloads the document.
 */
export function usePanelUrl(initialSlug?: ToolSlug, onPopPanel?: () => void): UsePanelUrl {
  const [panel, setPanel] = useState<ToolSlug | null>(initialSlug ?? null);
  const panelRef = useRef<ToolSlug | null>(initialSlug ?? null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (initialSlug) {
      // Direct load: keep the client title in sync with the server-rendered one.
      document.title = toolDocTitle(initialSlug);
    }
    const handlePopState = (event: PopStateEvent) => {
      const next = popstatePanel(event.state);
      pushedRef.current = next.pushed;
      panelRef.current = next.panel;
      document.title = next.title;
      if (next.panel !== null) onPopPanel?.();
      setPanel(next.panel);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialSlug, onPopPanel]);

  const open = useCallback((slug: ToolSlug) => {
    const transition = openPanelTransition(panelRef.current, slug);
    if (transition.kind === "push") {
      pushedRef.current = true;
      window.history.pushState(transition.state, "", transition.url);
      panelRef.current = transition.panel;
      document.title = transition.title;
      setPanel(transition.panel);
    } else if (transition.kind === "replace") {
      window.history.replaceState(transition.state, "", transition.url);
      panelRef.current = transition.panel;
      document.title = transition.title;
      setPanel(transition.panel);
    }
  }, []);

  const close = useCallback(() => {
    if (panelRef.current === null) return;
    const transition = closePanelTransition(pushedRef.current);
    if (transition.kind === "none") return;
    pushedRef.current = false;
    panelRef.current = null;
    document.title = transition.title;
    setPanel(null);
    if (transition.kind === "back") {
      // Optimistically closed; popstate confirms with the same state.
      window.history.back();
    } else if (transition.kind === "replace") {
      window.history.replaceState(transition.state, "", transition.url);
    }
  }, []);

  return { panel, open, close };
}
