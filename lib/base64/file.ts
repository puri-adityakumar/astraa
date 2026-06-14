import { MAX_FILE_BYTES } from "./types";

export type ImageMime =
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp";

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const JPEG_SIG = [0xff, 0xd8, 0xff] as const;
const GIF87_SIG = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] as const;
const GIF89_SIG = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] as const;
const RIFF_SIG = [0x52, 0x49, 0x46, 0x46] as const;
const WEBP_SIG = [0x57, 0x45, 0x42, 0x50] as const;

function startsWith(bytes: Uint8Array, sig: readonly number[]): boolean {
  if (bytes.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false;
  }
  return true;
}

export function sniffImageMime(bytes: Uint8Array): ImageMime | null {
  if (bytes.length === 0) return null;
  if (startsWith(bytes, PNG_SIG)) return "image/png";
  if (startsWith(bytes, JPEG_SIG)) return "image/jpeg";
  if (startsWith(bytes, GIF87_SIG) || startsWith(bytes, GIF89_SIG)) {
    return "image/gif";
  }
  if (
    startsWith(bytes, RIFF_SIG) &&
    bytes.length >= 12 &&
    bytes[8] === WEBP_SIG[0] &&
    bytes[9] === WEBP_SIG[1] &&
    bytes[10] === WEBP_SIG[2] &&
    bytes[11] === WEBP_SIG[3]
  ) {
    return "image/webp";
  }
  return null;
}

export class FileTooLargeError extends Error {
  constructor(public sizeBytes: number) {
    super(
      `File too large: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB exceeds the ${(
        MAX_FILE_BYTES / 1024 / 1024
      ).toFixed(0)} MB limit.`,
    );
    this.name = "FileTooLargeError";
  }
}

export async function readFileAsBytes(file: File): Promise<Uint8Array> {
  if (file.size > MAX_FILE_BYTES) {
    throw new FileTooLargeError(file.size);
  }
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) {
        resolve(new Uint8Array(result));
      } else {
        reject(new Error("FileReader returned an unexpected result type."));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}
