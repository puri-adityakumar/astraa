/**
 * Safely copy text to clipboard with error handling.
 * 
 * @param text - The text to copy to clipboard
 * @returns Promise with success status and optional error message
 */
export async function copyToClipboard(text: string): Promise<{ success: boolean; error?: string }> {
  // Check if clipboard API is available
  if (!navigator?.clipboard) {
    return {
      success: false,
      error: "Clipboard not available. Your browser may not support this feature or requires HTTPS."
    };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    // Handle specific permission errors
    if (err instanceof DOMException) {
      if (err.name === "NotAllowedError") {
        return {
          success: false,
          error: "Clipboard access denied. Please allow clipboard permissions."
        };
      }
      if (err.name === "SecurityError") {
        return {
          success: false,
          error: "Clipboard access blocked. This feature requires a secure context (HTTPS)."
        };
      }
    }

    // Generic fallback error
    return {
      success: false,
      error: "Failed to copy to clipboard. Please try again."
    };
  }
}
