import type { Base64Options } from "./types";

function bytesToBinaryString(bytes: Uint8Array): string {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    out += String.fromCharCode(...slice);
  }
  return out;
}

function binaryStringToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function applyEncodeOptions(b64: string, opts: Base64Options): string {
  let out = b64;
  if (opts.urlSafe) {
    out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  if (opts.wrap76) {
    out = out.match(/.{1,76}/g)?.join("\n") ?? "";
  }
  return out;
}

function normalizeForDecode(input: string): string {
  let s = input.replace(/[\t\n\r\f\v ]/g, "");
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const mod = s.length % 4;
  if (mod === 2) s += "==";
  else if (mod === 3) s += "=";
  return s;
}

export function encodeBytes(bytes: Uint8Array, opts: Base64Options): string {
  const binary = bytesToBinaryString(bytes);
  const b64 = btoa(binary);
  return applyEncodeOptions(b64, opts);
}

export function encodeText(input: string, opts: Base64Options): string {
  const bytes = new TextEncoder().encode(input);
  return encodeBytes(bytes, opts);
}

export function decodeToBytes(input: string, _opts: Base64Options): Uint8Array {
  const normalized = normalizeForDecode(input);
  const binary = atob(normalized);
  return binaryStringToBytes(binary);
}

export function decodeToText(input: string, opts: Base64Options): string {
  const bytes = decodeToBytes(input, opts);
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
