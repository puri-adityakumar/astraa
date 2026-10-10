"use client";

import type { ToolSlug } from "@/lib/terminal/types";
import { PANEL_CLIENTS } from "./panel-clients";
import { PanelFrame } from "./panel-frame";
import { toolDisplayName } from "./tool-names";

interface PanelHostProps {
  slug: ToolSlug;
  onClose: () => void;
}

/**
 * The panel host: mounts the tool client for `slug` inside the shared panel
 * frame above the prompt. Focus moves into the panel on open and back to
 * the prompt on close (via the prompt's autoFocus flip); Escape and the
 * close button live in PanelFrame.
 */
export function PanelHost({ slug, onClose }: PanelHostProps) {
  const Client = PANEL_CLIENTS[slug];
  const name = toolDisplayName(slug);

  return (
    <PanelFrame title={name} panelKey={slug} focusKey={slug} onClose={onClose}>
      <Client variant="panel" />
    </PanelFrame>
  );
}
