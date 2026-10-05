import { makeOpenOnlyCommand } from "./open-only";

/**
 * /markdown (alias /md): open-only — the markdown editor always opens as a
 * panel; args are never computed (architecture §5 rule 4).
 */
export const markdownCommand = makeOpenOnlyCommand({
  name: "markdown",
  aliases: ["md"],
  summary: "Open the markdown editor panel",
  usage: ["/markdown", "/md"],
  category: "Utilities",
  slug: "markdown",
  displayName: "Markdown",
});
