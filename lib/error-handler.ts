/**
 * Error handling utilities for user-friendly error messages
 */

export interface ErrorDetails {
  title: string
  message: string
  action?: string
  technical?: string
}

// Pre-compiled RegExp constants for sanitization (avoids re-creation per call)
const WINDOWS_PATH_RE = /[A-Za-z]:\\[\w\\\-.]+/g
const UNIX_PATH_RE = /\/[\w\/\-.]+/g
const URL_RE = /https?:\/\/[^\s]+/gi
const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w+/g
const IP_RE = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g

/**
 * Convert various error types into user-friendly messages
 */
export function getUserFriendlyError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase()
    const technical = sanitizeErrorMessage(error.message)

    // Timeout errors
    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      lowerMessage.includes("timeout")
    ) {
      return {
        title: "Request Timeout",
        message: "The request took too long to complete. Please try again.",
        action: "Retry",
        technical,
      }
    }

    // Network errors differ between browsers.
    if (
      (error instanceof TypeError && lowerMessage.includes("fetch")) ||
      lowerMessage.includes("load failed") ||
      lowerMessage.includes("networkerror") ||
      error.name === "NetworkError"
    ) {
      return {
        title: "Connection Error",
        message: "Unable to connect to the server. Please check your internet connection and try again.",
        action: "Retry",
        technical,
      }
    }

    // Permission errors
    if (lowerMessage.includes("permission") || lowerMessage.includes("unauthorized")) {
      return {
        title: "Permission Denied",
        message: "You don't have permission to perform this action.",
        action: "Go Back",
        technical,
      }
    }

    // Validation errors
    if (lowerMessage.includes("invalid")) {
      return {
        title: "Invalid Input",
        message: "The provided input is invalid. Please check your data and try again.",
        action: "Fix Input",
        technical,
      }
    }

    // File errors
    if (lowerMessage.includes("file") || lowerMessage.includes("upload")) {
      return {
        title: "File Error",
        message: "There was a problem with the file. Please ensure it's the correct format and size.",
        action: "Try Another File",
        technical,
      }
    }

    // Generic error
    return {
      title: "Something Went Wrong",
      message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
      action: "Try Again",
      technical,
    }
  }

  // Unknown error type
  return {
    title: "Unknown Error",
    message: "An unexpected error occurred. Please try again.",
    action: "Try Again",
    technical: sanitizeErrorMessage(String(error)),
  }
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorDetails = getUserFriendlyError(error)

  console.error("Error occurred:", {
    ...errorDetails,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  })
}

/**
 * Handle async errors with user-friendly messages
 */
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorCallback?: (error: ErrorDetails) => void
): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    const errorDetails = getUserFriendlyError(error)
    logError(error)
    errorCallback?.(errorDetails)
    return null
  }
}

/**
 * Create a safe error message for display (removes sensitive info)
 */
export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(URL_RE, "[url]")
    .replace(WINDOWS_PATH_RE, "[path]")
    .replace(UNIX_PATH_RE, "[path]")
    .replace(EMAIL_RE, "[email]")
    .replace(IP_RE, "[ip]")
}
