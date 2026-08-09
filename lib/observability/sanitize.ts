const MAX_DIAGNOSTIC_STRING_LENGTH = 240;
const MAX_CONTEXT_DEPTH = 3;

const URL_RE = /\bhttps?:\/\/[^\s<>"']+/gi;
const AUTH_HEADER_RE =
  /\b(authorization|proxy-authorization|cookie|set-cookie)\s*[:=]\s*[^\r\n]+/gi;
const BEARER_TOKEN_RE = /\bbearer\s+[A-Za-z0-9._~+\/-]+=*/gi;
const NAMED_SECRET_RE =
  /\b(api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|passwd)\s*[:=]\s*["']?[^\s"',;}\]]+/gi;
const PROVIDER_KEY_RE = /\b(?:sk|CG)-[A-Za-z0-9_-]{8,}\b/g;
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const WINDOWS_PATH_RE = /\b[A-Za-z]:\\(?:[^\\\r\n]+\\)*[^\s\r\n]+/g;
const UNIX_PATH_RE =
  /(^|[\s([])\/(?:Users|home|private|tmp|var|opt|etc|srv|workspace)(?:\/[^\s:;,)}\]]+)+/g;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_-]{40,}\b/g;

const CONTEXT_KEYS = new Set([
  "buildVersion",
  "code",
  "details",
  "digest",
  "durationMs",
  "environment",
  "errorCode",
  "operation",
  "release",
  "routeTemplate",
  "status",
  "statusClass",
  "timestamp",
]);

const SENSITIVE_TELEMETRY_KEYS = new Set([
  "address",
  "authorization",
  "clipboard",
  "cookie",
  "cookies",
  "email",
  "file",
  "filecontent",
  "files",
  "form",
  "input",
  "inputs",
  "ip",
  "markdown",
  "output",
  "passphrase",
  "password",
  "prompt",
  "provideroutput",
  "ratelimitidentity",
  "regex",
  "setcookie",
  "teststring",
  "topic",
  "user",
]);

export function sanitizeDiagnosticMessage(
  value: string,
  maxLength: number = MAX_DIAGNOSTIC_STRING_LENGTH,
): string {
  const redacted = value
    .replace(URL_RE, "[url]")
    .replace(AUTH_HEADER_RE, "$1: [redacted]")
    .replace(BEARER_TOKEN_RE, "Bearer [redacted]")
    .replace(NAMED_SECRET_RE, "$1=[redacted]")
    .replace(PROVIDER_KEY_RE, "[credential]")
    .replace(EMAIL_RE, "[email]")
    .replace(IPV4_RE, "[ip]")
    .replace(WINDOWS_PATH_RE, "[path]")
    .replace(UNIX_PATH_RE, "$1[path]")
    .replace(LONG_TOKEN_RE, "[token]");

  return capString(redacted, maxLength);
}

export function sanitizeDiagnosticContext(value: unknown, depth = 0): Record<string, unknown> {
  if (depth >= MAX_CONTEXT_DEPTH || typeof value !== "object" || value === null) {
    return {};
  }

  const result: Record<string, unknown> = {};
  for (const [key, candidate] of Object.entries(value)) {
    if (!CONTEXT_KEYS.has(key)) continue;

    if (key === "details") {
      const details = sanitizeDiagnosticContext(candidate, depth + 1);
      if (Object.keys(details).length > 0) result.details = details;
      continue;
    }

    const sanitized = sanitizeContextValue(key, candidate);
    if (sanitized !== undefined) result[key] = sanitized;
  }

  return result;
}

export function sanitizeSentryEvent<T>(event: T): T | null {
  if (typeof event !== "object" || event === null) return null;
  return sanitizeTelemetryValue(event, "", [], 0) as T;
}

export function sanitizeSentryBreadcrumb<T>(breadcrumb: T): T | null {
  if (typeof breadcrumb !== "object" || breadcrumb === null) return null;
  const category = (breadcrumb as { category?: unknown }).category;
  if (typeof category === "string" && category.toLowerCase().includes("ui.input")) {
    return null;
  }
  return sanitizeTelemetryValue(breadcrumb, "", ["breadcrumb"], 0) as T;
}

export function stripUrlDetails(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "[url]";
    return `${url.origin}${url.pathname}`;
  } catch {
    return sanitizeDiagnosticMessage(value);
  }
}

function sanitizeContextValue(key: string, value: unknown): string | number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  if (key === "routeTemplate") {
    const route = value.split(/[?#]/, 1)[0] ?? "";
    return route.startsWith("/") ? capString(route, 120) : "[route]";
  }

  if (key === "digest") {
    return /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : "[digest]";
  }

  return sanitizeDiagnosticMessage(value, 120);
}

function sanitizeTelemetryValue(
  value: unknown,
  key: string,
  path: string[],
  depth: number,
): unknown {
  if (depth > 8) return "[truncated]";

  const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");
  if (SENSITIVE_TELEMETRY_KEYS.has(normalizedKey)) return "[redacted]";
  if (path.includes("request") && ["body", "data", "querystring"].includes(normalizedKey)) {
    return "[redacted]";
  }

  if (typeof value === "string") {
    if (["url", "filename", "source"].includes(normalizedKey)) {
      return stripUrlDetails(value);
    }
    return sanitizeDiagnosticMessage(value);
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeTelemetryValue(item, "", path, depth + 1));
  }
  if (typeof value !== "object" || value === null) return undefined;

  const result: Record<string, unknown> = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    const sanitized = sanitizeTelemetryValue(
      childValue,
      childKey,
      [...path, key].filter(Boolean),
      depth + 1,
    );
    if (sanitized !== undefined) result[childKey] = sanitized;
  }
  return result;
}

function capString(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}…[truncated]`;
}
