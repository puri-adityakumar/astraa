export type RepairResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function repair(text: string): Promise<RepairResult> {
  try {
    const { jsonrepair } = await import("jsonrepair");
    const fixed = jsonrepair(text);
    JSON.parse(fixed);
    return { ok: true, text: fixed };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
