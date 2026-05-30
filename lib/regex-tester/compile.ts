import type { CompileResult } from "./types";

export function compileRegex(pattern: string, flags: string): CompileResult {
  if (!pattern) {
    return { ok: false, error: "Empty pattern" };
  }
  try {
    return { ok: true, regex: new RegExp(pattern, flags) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
