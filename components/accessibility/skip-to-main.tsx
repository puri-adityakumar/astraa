"use client"

/**
 * Skip to main content link for keyboard navigation
 * Allows users to bypass navigation and jump directly to main content
 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="skip-to-main"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}
