import { readFileAsDataURL } from "@/lib/file-reader";

const SOFT_LIMIT = 2 * 1024 * 1024;
const HARD_LIMIT = 10 * 1024 * 1024;

export type ImageDropResult =
  | { kind: "ok"; markdown: string; warning?: string }
  | { kind: "blocked"; reason: string }
  | { kind: "ignored" }
  | { kind: "error"; message: string };

export async function processImageDrop(file: File): Promise<ImageDropResult> {
  if (!file.type.startsWith("image/")) {
    return { kind: "ignored" };
  }
  if (file.size > HARD_LIMIT) {
    return { kind: "blocked", reason: "Image too large. Resize first (max 10MB)." };
  }
  try {
    const dataUrl = await readFileAsDataURL(file);
    const markdown = `![${file.name}](${dataUrl})`;
    if (file.size > SOFT_LIMIT) {
      return {
        kind: "ok",
        markdown,
        warning:
          "That image is large — consider resizing in /tools/image to keep your files snappy.",
      };
    }
    return { kind: "ok", markdown };
  } catch (error) {
    return {
      kind: "error",
      message: error instanceof Error ? error.message : "Couldn't read image file.",
    };
  }
}
