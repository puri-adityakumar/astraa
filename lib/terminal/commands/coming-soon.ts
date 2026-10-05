import type { CommandResult, TerminalCommand } from "../types";
import type { ToolCommandSpec } from "./open-only";

/** Rule 5's answer line: "<Tool> is coming soon." */
export function comingSoonMessage(displayName: string): string {
  return `${displayName} is coming soon.`;
}

/**
 * Build a coming-soon tool command (rule 5): it always answers the
 * coming-soon line, ignores args, and never opens a panel.
 */
export function makeComingSoonCommand(spec: ToolCommandSpec): TerminalCommand {
  return {
    name: spec.name,
    aliases: spec.aliases,
    summary: spec.summary,
    usage: spec.usage,
    category: spec.category,
    slug: spec.slug,
    status: "coming-soon",
    run(_args: string): CommandResult {
      return {
        type: "answer",
        output: [{ type: "text", text: comingSoonMessage(spec.displayName) }],
      };
    },
  };
}
