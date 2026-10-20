import { makeComingSoonCommand } from "./coming-soon";

/**
 * /music: coming soon — it answers the coming-soon line, ignores args and
 * never opens a panel (architecture §5 rule 5).
 */
export const musicCommand = makeComingSoonCommand({
  name: "music",
  aliases: [],
  summary: "Stream lofi music with productivity tools",
  usage: ["/music"],
  category: "Utilities",
  slug: "music",
  displayName: "Music",
});
