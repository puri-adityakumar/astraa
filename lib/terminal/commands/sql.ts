import { makeComingSoonCommand } from "./coming-soon";

/**
 * /sql: coming soon — it answers the coming-soon line, ignores args and
 * never opens a panel (architecture §5 rule 5).
 */
export const sqlCommand = makeComingSoonCommand({
  name: "sql",
  aliases: [],
  summary: "Format and validate SQL queries",
  usage: ["/sql"],
  category: "Developer Tools",
  slug: "sql",
  displayName: "SQL",
});
