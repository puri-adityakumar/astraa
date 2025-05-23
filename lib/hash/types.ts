export type HashAlgorithm = {
  id: string
  name: string
  description: string
}

export interface HashOutputs {
  [key: string]: string
}

export const hashAlgorithms: HashAlgorithm[] = [
  {
    id: "md5",
    name: "MD5",
    description: "A widely used hash function producing a 128-bit hash value. Not cryptographically secure."
  },
  {
    id: "sha1",
    name: "SHA-1",
    description: "Produces a 160-bit hash value. Legacy algorithm, not recommended for security-critical applications."
  },
  {
    id: "sha256",
    name: "SHA-256",
    description: "Part of SHA-2 family, produces a 256-bit hash value. Widely used in security applications and blockchain."
  },
  {
    id: "sha512",
    name: "SHA-512",
    description: "Produces a 512-bit hash value. Provides stronger security than SHA-256, ideal for critical applications."
  },
  {
    id: "sha3-256",
    name: "SHA3-256",
    description: "Part of SHA-3 family, produces a 256-bit hash value. Modern and highly secure."
  },
  {
    id: "sha3-512",
    name: "SHA3-512",
    description: "Produces a 512-bit hash value. Strongest variant of SHA-3 family."
  }
]