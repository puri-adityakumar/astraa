import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { sha3_256, sha3_512 } from "@noble/hashes/sha3.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

const HASH_FUNCTIONS: Record<string, (input: Uint8Array) => Uint8Array> = {
  md5,
  sha1,
  sha256,
  sha512,
  "sha3-256": sha3_256,
  "sha3-512": sha3_512,
};

export function generateHash(input: string, algorithm: string): string {
  const hash = Object.hasOwn(HASH_FUNCTIONS, algorithm) ? HASH_FUNCTIONS[algorithm] : undefined;
  if (!hash) throw new Error("Unsupported hash algorithm");
  return bytesToHex(hash(utf8ToBytes(input)));
}