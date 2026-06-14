const TEST_BYTE_LIMIT = 8 * 1024;

export interface UrlState {
  pattern: string;
  flags: string;
  test: string;
  replacement: string;
}

export interface EncodeResult {
  hash: string;
  truncated: boolean;
}

interface ShortShape {
  p: string;
  f: string;
  t: string;
  r: string;
}

function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return binary;
}

function binaryToBytes(binary: string): Uint8Array {
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  const b64 = btoa(bytesToBinary(bytes));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLen);
  try {
    return binaryToBytes(atob(padded));
  } catch {
    return null;
  }
}

function truncateToByteLimit(input: string, limit: number): { value: string; truncated: boolean } {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(input);
  if (encoded.length <= limit) {
    return { value: input, truncated: false };
  }
  // Trim to the nearest valid UTF-8 boundary at or before `limit`.
  let end = limit;
  while (end > 0) {
    const byte = encoded[end];
    if (byte === undefined) break;
    if ((byte & 0xc0) !== 0x80) break;
    end--;
  }
  const sliced = encoded.subarray(0, end);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return { value: decoder.decode(sliced), truncated: true };
}

export function encodeState(state: UrlState): EncodeResult {
  const { value: testTrimmed, truncated } = truncateToByteLimit(state.test, TEST_BYTE_LIMIT);
  const payload: ShortShape = {
    p: state.pattern,
    f: state.flags,
    t: testTrimmed,
    r: state.replacement,
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return { hash: toBase64Url(bytes), truncated };
}

function isShortShape(value: unknown): value is ShortShape {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.p === "string" &&
    typeof record.f === "string" &&
    typeof record.t === "string" &&
    typeof record.r === "string"
  );
}

export function decodeState(hash: string): UrlState | null {
  if (!hash) return null;
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!trimmed) return null;
  const bytes = fromBase64Url(trimmed);
  if (!bytes) return null;
  let json: string;
  try {
    json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isShortShape(parsed)) return null;
  return {
    pattern: parsed.p,
    flags: parsed.f,
    test: parsed.t,
    replacement: parsed.r,
  };
}
