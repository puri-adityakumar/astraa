/**
 * Plain-text rendering of command output for the scrollback's aria-live
 * region, which announces the latest output only. Secrets are never
 * announced: any output containing a secret block is announced as
 * generated-and-hidden instead, so a password can never leak through the
 * live region.
 */
import type { OutputBlock } from "./types";

/** Announcement for output containing a secret block. */
export const SECRET_LIVE_TEXT = "Password generated, hidden";

function blockToText(block: OutputBlock): string {
  switch (block.type) {
    case "text":
      return block.text;
    case "error":
      return block.text;
    case "kv":
      return block.entries.map((entry) => `${entry.key}: ${entry.value}`).join("\n");
    case "code":
      return block.code;
    case "list":
      return block.items.join("\n");
    case "secret":
      return SECRET_LIVE_TEXT;
  }
}

export function outputToLiveText(blocks: readonly OutputBlock[]): string {
  if (blocks.some((block) => block.type === "secret")) return SECRET_LIVE_TEXT;
  return blocks.map(blockToText).join("\n");
}
