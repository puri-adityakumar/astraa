export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CODE_BYTES = 100 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "type" | "size" };

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, reason: "type" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

export function validateCodeLength(code: string): ValidationResult {
  if (new Blob([code]).size > MAX_CODE_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FileReader returned non-string"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}
