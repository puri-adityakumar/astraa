import { makeOpenOnlyCommand } from "./open-only";

/**
 * /image (alias /img): open-only — the image resizer always opens as a
 * panel; args are never computed (architecture §5 rule 4).
 */
export const imageCommand = makeOpenOnlyCommand({
  name: "image",
  aliases: ["img"],
  summary: "Open the image resizer panel",
  usage: ["/image", "/img"],
  category: "Utilities",
  slug: "image",
  displayName: "Image",
});
