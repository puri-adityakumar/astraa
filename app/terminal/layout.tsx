import type { ReactNode } from "react";
import { GeistPixelSquare } from "geist/font/pixel";
import { autoThemeCss } from "@/lib/terminal/theme-css";
import "./terminal.css";

/**
 * Terminal-only layout: loads the Geist Pixel Square font (legacy pages never
 * request it), exposes its variable on the terminal root, and injects the
 * temporary default-scheme CSS variables.
 */
export default function TerminalLayout({ children }: { children: ReactNode }) {
  return (
    <div data-flavour="terminal" className={GeistPixelSquare.variable}>
      <style dangerouslySetInnerHTML={{ __html: autoThemeCss() }} />
      {children}
    </div>
  );
}
