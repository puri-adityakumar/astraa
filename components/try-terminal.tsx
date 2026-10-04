"use client";

import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FLAVOUR_TERMINAL, serializeFlavourCookie } from "@/lib/terminal/cookies";
import { isTerminalCapablePath } from "@/lib/terminal/flavour";

/**
 * Switch to the terminal flavour: persist the cookie, then reload the page
 * when the current URL is one the terminal serves (home, /tools or a
 * registered tool) — otherwise full-load the home page, the terminal's
 * entry point.
 */
export function switchToTerminalFlavour(): void {
  document.cookie = serializeFlavourCookie(FLAVOUR_TERMINAL);
  if (isTerminalCapablePath(window.location.pathname)) {
    window.location.reload();
  } else {
    window.location.assign("/");
  }
}

/**
 * The legacy navigation's "Try terminal" control, styled like the other
 * ghost nav buttons. Rendered in the landing navigation (desktop and mobile
 * menu) and the floating navbar.
 */
export function TryTerminalButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={switchToTerminalFlavour}
      className={className}
    >
      <Terminal className="h-4 w-4" aria-hidden="true" />
      Try terminal
    </Button>
  );
}
