export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "non-base64 chars" | "bad padding" };

export interface ValidateOptions {
  urlSafe: boolean;
}

const STD_ALPHA = /^[A-Za-z0-9+/]+=*$/;
const URL_SAFE_ALPHA = /^[A-Za-z0-9\-_]+=*$/;

export function validateBase64(
  input: string,
  opts: ValidateOptions,
): ValidationResult {
  const stripped = input.replace(/[\t\n\r ]/g, "");
  if (stripped.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const alpha = opts.urlSafe ? URL_SAFE_ALPHA : STD_ALPHA;
  if (!alpha.test(stripped)) {
    return { ok: false, reason: "non-base64 chars" };
  }

  // Compute effective length excluding trailing padding.
  const trimmed = stripped.replace(/=+$/g, "");
  const padded = opts.urlSafe
    ? trimmed + "=".repeat((4 - (trimmed.length % 4)) % 4)
    : stripped;

  if (padded.length % 4 !== 0) {
    return { ok: false, reason: "bad padding" };
  }

  // Standard alphabet requires explicit padding (not just length divisible by 4).
  if (!opts.urlSafe) {
    const need = (4 - (trimmed.length % 4)) % 4;
    const actual = stripped.length - trimmed.length;
    if (need !== actual) {
      return { ok: false, reason: "bad padding" };
    }
  }

  return { ok: true };
}
