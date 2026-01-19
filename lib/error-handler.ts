/**
 * Error handling utilities for user-friendly error messages
 */

export interface ErrorDetails {
  title: string;
  message: string;
  action?: string;
  technical?: string;
}

/**
 * Convert various error types into user-friendly messages
 */
export function getUserFriendlyError(error: unknown): ErrorDetails {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      title: "Connection Error",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
      action: "Retry",
      technical: error.message,
    };
  }

  // Timeout errors
  if (
    error instanceof Error &&
    error.message.toLowerCase().includes("timeout")
  ) {
    return {
      title: "Request Timeout",
      message: "The request took too long to complete. Please try again.",
      action: "Retry",
      technical: error.message,
    };
  }

  // Permission errors
  if (
    error instanceof Error &&
    (error.message.toLowerCase().includes("permission") ||
      error.message.toLowerCase().includes("unauthorized"))
  ) {
    return {
      title: "Permission Denied",
      message: "You don't have permission to perform this action.",
      action: "Go Back",
      technical: error.message,
    };
  }

  // Validation errors
  if (
    error instanceof Error &&
    error.message.toLowerCase().includes("invalid")
  ) {
    return {
      title: "Invalid Input",
      message:
        "The provided input is invalid. Please check your data and try again.",
      action: "Fix Input",
      technical: error.message,
    };
  }

  // File errors
  if (
    error instanceof Error &&
    (error.message.toLowerCase().includes("file") ||
      error.message.toLowerCase().includes("upload"))
  ) {
    return {
      title: "File Error",
      message:
        "There was a problem with the file. Please ensure it's the correct format and size.",
      action: "Try Another File",
      technical: error.message,
    };
  }

  // Generic error
  if (error instanceof Error) {
    return {
      title: "Something Went Wrong",
      message:
        "An unexpected error occurred. Please try again or contact support if the problem persists.",
      action: "Try Again",
      technical: error.message,
    };
  }

  // Unknown error type
  return {
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
    action: "Try Again",
    technical: String(error),
  };
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorDetails = getUserFriendlyError(error);

  console.error("Error occurred:", {
    ...errorDetails,
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  });
}

/**
 * Handle async errors with user-friendly messages
 */
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorCallback?: (error: ErrorDetails) => void,
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    const errorDetails = getUserFriendlyError(error);
    logError(error);
    errorCallback?.(errorDetails);
    return null;
  }
}

/**
 * Create a safe error message for display (removes sensitive info)
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove file paths
  let sanitized = message.replace(/[A-Za-z]:\\[\w\\\-. ]+/g, "[path]");
  sanitized = sanitized.replace(/\/[\w\/\-. ]+/g, "[path]");

  // Remove URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, "[url]");

  // Remove email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email]");

  // Remove IP addresses
  sanitized = sanitized.replace(
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    "[ip]",
  );

  return sanitized;
}
