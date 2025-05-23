import { createHash } from "crypto"
import type { HashOutputs } from "./types"

export function generateHash(input: string, algorithm: string): string {
  return createHash(algorithm).update(input).digest("hex")
}