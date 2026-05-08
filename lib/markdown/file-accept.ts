export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = [".md", ".markdown", ".txt"] as const;

export type AcceptResult =
  | { kind: "ok"; name: string; text: string }
  | { kind: "rejected"; reason: string };

const hasAllowedExt = (name: string): boolean => {
  const lower = name.toLowerCase();
  return ALLOWED_EXT.some((ext) => lower.endsWith(ext));
};

export async function acceptMarkdownFile(file: File): Promise<AcceptResult> {
  if (!hasAllowedExt(file.name)) {
    return { kind: "rejected", reason: "Unsupported file type. Use .md, .markdown, or .txt." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { kind: "rejected", reason: "File too large (max 5 MB)." };
  }
  try {
    const text = await file.text();
    return { kind: "ok", name: file.name, text };
  } catch (e) {
    return {
      kind: "rejected",
      reason: e instanceof Error ? e.message : "Couldn't read file.",
    };
  }
}
