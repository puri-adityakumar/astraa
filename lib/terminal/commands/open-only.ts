import type { CommandResult, TerminalCommand, ToolSlug } from "../types";

/** Inputs shared by the open-only and coming-soon command factories. */
export interface ToolCommandSpec {
  name: string;
  aliases: string[];
  summary: string;
  usage: string[];
  category: string;
  slug: ToolSlug;
  /** Tool name used in the command's one-line messages. */
  displayName: string;
}

/** Rule 4's output line: "<Tool> opens in a panel." */
export function openOnlyLine(displayName: string): string {
  return `${displayName} opens in a panel.`;
}

/**
 * Rule 4: open-only tools open their panel even when args are given — the
 * args are never computed. Bare calls open silently; args add the one-line
 * notice before the panel.
 */
export function runOpenOnly(
  args: string,
  slug: ToolSlug,
  displayName: string,
): CommandResult {
  if (args.trim() === "") return { type: "open", slug };
  return {
    type: "open",
    slug,
    output: [{ type: "text", text: openOnlyLine(displayName) }],
  };
}

/** Build an open-only tool command (rule 4). */
export function makeOpenOnlyCommand(spec: ToolCommandSpec): TerminalCommand {
  return {
    name: spec.name,
    aliases: spec.aliases,
    summary: spec.summary,
    usage: spec.usage,
    category: spec.category,
    slug: spec.slug,
    status: "live",
    run(args: string): CommandResult {
      return runOpenOnly(args, spec.slug, spec.displayName);
    },
  };
}
