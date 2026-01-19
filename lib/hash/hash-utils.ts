import { createHash } from "crypto";

export function generateHash(input: string, algorithm: string): string {
  return createHash(algorithm).update(input).digest("hex");
}
