"use client"

import { useEffect } from 'react'

/**
 * Detects keyboard navigation and adds appropriate data attribute
 * to improve focus visibility for keyboard users
 */
export function KeyboardNavDetector() {
  useEffect(() => {
    let isUsingKeyboard = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true
        document.documentElement.setAttribute('data-keyboard-nav', 'true')
      }
    }

    const handleMouseDown = () => {
      isUsingKeyboard = false
      document.documentElement.setAttribute('data-keyboard-nav', 'false')
    }

    const handleFocus = () => {
      if (isUsingKeyboard) {
        document.documentElement.setAttribute('data-keyboard-nav', 'true')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('focus', handleFocus, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('focus', handleFocus, true)
    }
  }, [])

  return null
}
