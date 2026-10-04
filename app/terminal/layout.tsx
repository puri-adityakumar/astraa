import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { GeistPixelSquare } from "geist/font/pixel";
import { TERM_THEME_COOKIE_NAME, parseTermTheme } from "@/lib/terminal/cookies";
import { schemeCss } from "@/lib/terminal/theme-css";
import { TerminalThemeProvider } from "@/components/terminal/terminal-theme";
import "./terminal.css";

/**
 * Terminal-only layout: loads the Geist Pixel Square font (legacy pages never
 * request it), reads the astraa_term_theme cookie server-side so the scheme
 * attribute and colours render with the first byte (no flash), and scopes the
 * html dark class to the active scheme via next-themes.
 */
export default async function TerminalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = parseTermTheme(cookieStore.get(TERM_THEME_COOKIE_NAME)?.value);

  return (
    <div
      data-flavour="terminal"
      data-term-theme={theme}
      className={GeistPixelSquare.variable}
    >
      <style dangerouslySetInnerHTML={{ __html: schemeCss() }} />
      <TerminalThemeProvider initialTheme={theme}>
        {children}
      </TerminalThemeProvider>
    </div>
  );
}
