type HashAlgorithm = {
  id: string;
  name: string;
  description: string;
};

export const hashAlgorithms: HashAlgorithm[] = [
  {
    id: "md5",
    name: "MD5",
    description: "Legacy 128-bit digest. Collision attacks make it unsuitable for security use.",
  },
  {
    id: "sha1",
    name: "SHA-1",
    description:
      "Legacy 160-bit digest. Practical collision attacks make it unsuitable for security use.",
  },
  {
    id: "sha256",
    name: "SHA-256",
    description:
      "SHA-2 family digest with 256-bit output, commonly used for checksums and integrity comparisons.",
  },
  {
    id: "sha512",
    name: "SHA-512",
    description:
      "SHA-2 family digest with 512-bit output, commonly used for checksums and integrity comparisons.",
  },
  {
    id: "sha3-256",
    name: "SHA3-256",
    description: "SHA-3 family digest with 256-bit output for checksum and integrity comparisons.",
  },
  {
    id: "sha3-512",
    name: "SHA3-512",
    description: "SHA-3 family digest with 512-bit output for checksum and integrity comparisons.",
  },
];
