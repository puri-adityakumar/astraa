import { FLAVOUR_LEGACY, serializeFlavourCookie } from "@/lib/terminal/cookies";

/**
 * Switch to the legacy flavour: persist the cookie and reload so the same
 * URL re-renders under the legacy routes. The terminal only renders on
 * terminal-capable URLs, so a plain reload is always correct here.
 */
export function switchToLegacyFlavour(): void {
  document.cookie = serializeFlavourCookie(FLAVOUR_LEGACY);
  window.location.reload();
}
