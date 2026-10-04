/**
 * Pure derivations of the registry-driven lists the shell renders (sidebar
 * rows, home category rows). Built-ins are excluded — only tool commands
 * become rows; coming-soon commands are included so lists can mark them.
 */
import type { TerminalCommand, ToolSlug } from "./types";

/** A command backed by a tool slug (i.e. not a built-in). */
export type ToolCommand = TerminalCommand & { slug: ToolSlug };

/** Tool commands only, in registry order. Empty-safe by construction. */
export function toolCommands(commands: readonly TerminalCommand[]): readonly ToolCommand[] {
  return commands.filter((c): c is ToolCommand => c.slug !== null);
}

/** Tool commands of one category, in registry order. */
export function commandsInCategory(
  commands: readonly TerminalCommand[],
  category: string,
): readonly ToolCommand[] {
  return toolCommands(commands).filter((c) => c.category === category);
}
