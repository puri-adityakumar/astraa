import { makeOpenOnlyCommand } from "./open-only";

/**
 * /snippet (alias /snippets): open-only — the code snippet generator always
 * opens as a panel; args are never computed (architecture §5 rule 4). The
 * public URL is /tools/snippet-generator.
 */
export const snippetCommand = makeOpenOnlyCommand({
  name: "snippet",
  aliases: ["snippets"],
  summary: "Open the code snippet generator panel",
  usage: ["/snippet", "/snippets"],
  category: "Developer Tools",
  slug: "snippet-generator",
  displayName: "Snippet Generator",
});
