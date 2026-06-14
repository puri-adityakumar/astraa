export type ReplaceResult =
  | { ok: true; result: string }
  | { ok: false; error: string };

export function applyReplace(
  regex: RegExp,
  input: string,
  replacement: string,
): ReplaceResult {
  try {
    const result = input.replace(regex, replacement);
    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
