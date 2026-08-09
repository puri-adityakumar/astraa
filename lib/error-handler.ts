import { sanitizeDiagnosticContext, sanitizeDiagnosticMessage } from "@/lib/observability/sanitize";

export type PublicErrorCode =
  | "CONNECTION_ERROR"
  | "FILE_ERROR"
  | "INVALID_INPUT"
  | "PERMISSION_DENIED"
  | "REQUEST_TIMEOUT"
  | "UNEXPECTED_ERROR";

export interface ErrorDetails {
  code: PublicErrorCode;
  title: string;
  message: string;
  action: string;
  retryable: boolean;
}

export interface DiagnosticRecord {
  code: PublicErrorCode;
  context: Record<string, unknown>;
  message: string;
  name: string;
  stack?: string;
  timestamp: string;
}

export interface SafeErrorReport {
  code: PublicErrorCode;
  digest?: string;
  routeTemplate: string;
  timestamp: string;
}

const PUBLIC_ERRORS: Record<PublicErrorCode, ErrorDetails> = {
  CONNECTION_ERROR: {
    code: "CONNECTION_ERROR",
    title: "Connection Error",
    message: "The service could not be reached. Check your connection and try again.",
    action: "Retry",
    retryable: true,
  },
  FILE_ERROR: {
    code: "FILE_ERROR",
    title: "File Error",
    message: "The file could not be processed. Check its format and size, then try again.",
    action: "Try Another File",
    retryable: true,
  },
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    title: "Invalid Input",
    message: "The provided input is invalid. Check it and try again.",
    action: "Fix Input",
    retryable: false,
  },
  PERMISSION_DENIED: {
    code: "PERMISSION_DENIED",
    title: "Permission Denied",
    message: "This action is not permitted.",
    action: "Go Back",
    retryable: false,
  },
  REQUEST_TIMEOUT: {
    code: "REQUEST_TIMEOUT",
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    action: "Retry",
    retryable: true,
  },
  UNEXPECTED_ERROR: {
    code: "UNEXPECTED_ERROR",
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    action: "Try Again",
    retryable: true,
  },
};

export class AppError extends Error {
  constructor(public readonly code: PublicErrorCode) {
    super(code);
    this.name = "AppError";
  }
}

export function getUserFriendlyError(error: unknown): ErrorDetails {
  return PUBLIC_ERRORS[getPublicErrorCode(error)];
}

export function createDiagnosticRecord(
  error: unknown,
  context: Record<string, unknown> = {},
  now: Date = new Date(),
): DiagnosticRecord {
  const publicError = getUserFriendlyError(error);
  const rawMessage = error instanceof Error ? error.message : String(error);
  const rawStack = error instanceof Error ? error.stack : undefined;

  return {
    code: publicError.code,
    context: sanitizeDiagnosticContext(context),
    message: sanitizeDiagnosticMessage(rawMessage),
    name: sanitizeErrorName(error instanceof Error ? error.name : "UnknownThrownValue"),
    ...(rawStack ? { stack: sanitizeDiagnosticMessage(rawStack, 4_000) } : {}),
    timestamp: now.toISOString(),
  };
}

export function logError(error: unknown, context: Record<string, unknown> = {}): DiagnosticRecord {
  const diagnostic = createDiagnosticRecord(error, context);
  console.error("Astraa diagnostic:", diagnostic);
  return diagnostic;
}

export function createSafeErrorReport(
  error: unknown,
  digest: string | undefined,
  routeTemplate: string,
  now: Date = new Date(),
): SafeErrorReport {
  const context = sanitizeDiagnosticContext({ digest, routeTemplate });
  return {
    code: getUserFriendlyError(error).code,
    ...(typeof context.digest === "string" ? { digest: context.digest } : {}),
    routeTemplate:
      typeof context.routeTemplate === "string" ? context.routeTemplate : "/[app-route]",
    timestamp: now.toISOString(),
  };
}

export function formatSafeErrorReport(report: SafeErrorReport): string {
  return [
    `Code: ${report.code}`,
    ...(report.digest ? [`Digest: ${report.digest}`] : []),
    `Route: ${report.routeTemplate}`,
    `Timestamp: ${report.timestamp}`,
  ].join("\n");
}

export function sanitizeErrorMessage(message: string): string {
  return sanitizeDiagnosticMessage(message);
}

function getPublicErrorCode(error: unknown): PublicErrorCode {
  if (error instanceof AppError) return error.code;
  if (isNamedError(error, "TimeoutError")) return "REQUEST_TIMEOUT";

  const code = readErrorCode(error);
  switch (code) {
    case "INVALID_INPUT":
    case "INVALID_PAIR":
      return "INVALID_INPUT";
    case "PERMISSION_DENIED":
    case "UNAUTHORIZED":
      return "PERMISSION_DENIED";
    case "FILE_ERROR":
      return "FILE_ERROR";
    case "UPSTREAM_TIMEOUT":
      return "REQUEST_TIMEOUT";
    case "CONNECTION_ERROR":
    case "NOT_CONFIGURED":
    case "SERVICE_UNAVAILABLE":
    case "UPSTREAM_UNAVAILABLE":
      return "CONNECTION_ERROR";
    default:
      return "UNEXPECTED_ERROR";
  }
}

function readErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : null;
}

function isNamedError(error: unknown, name: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === name
  );
}

function sanitizeErrorName(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 80);
  return sanitized || "Error";
}
