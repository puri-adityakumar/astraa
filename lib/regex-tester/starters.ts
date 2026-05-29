import type { StarterPattern } from "./types";

export const STARTERS: StarterPattern[] = [
  {
    id: "email",
    label: "Email",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "g",
    description: "Loose RFC 5322 email matcher covering most everyday addresses.",
  },
  {
    id: "url",
    label: "URL (http/https)",
    pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
    flags: "gi",
    description: "Matches http:// and https:// URLs including paths and query strings.",
  },
  {
    id: "ipv4",
    label: "IPv4 address",
    pattern:
      "\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\b",
    flags: "g",
    description: "Dotted-quad IPv4 address with octet range validation (0-255).",
  },
  {
    id: "phone-e164",
    label: "Phone (E.164 loose)",
    pattern: "\\+?[1-9]\\d{1,14}",
    flags: "g",
    description: "E.164 international phone number, optional + prefix, up to 15 digits.",
  },
  {
    id: "hex-color",
    label: "Hex color",
    pattern: "#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b",
    flags: "g",
    description: "CSS hex color in #rgb or #rrggbb form.",
  },
  {
    id: "iso-date",
    label: "ISO date (YYYY-MM-DD)",
    pattern: "\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    description: "ISO 8601 calendar date with month and day range validation.",
  },
  {
    id: "uuid-v4",
    label: "UUID v4",
    pattern:
      "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b",
    flags: "g",
    description: "Version 4 UUID with correct version and variant nibbles.",
  },
  {
    id: "semver",
    label: "Semantic version",
    pattern:
      "\\b(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?\\b",
    flags: "g",
    description: "SemVer 2.0.0 — major.minor.patch with optional prerelease and build metadata.",
  },
  {
    id: "slug",
    label: "URL slug",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    flags: "",
    description: "Lowercase, hyphen-separated slug (no leading/trailing/double hyphens).",
  },
];
