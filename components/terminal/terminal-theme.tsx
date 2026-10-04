"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { serializeTermThemeCookie, type TermTheme } from "@/lib/terminal/cookies";
import { forcedThemeOf } from "@/lib/terminal/themes";

interface TerminalThemeContextValue {
  theme: TermTheme;
  setTheme: (theme: TermTheme) => void;
}

const TerminalThemeContext = createContext<TerminalThemeContextValue | null>(null);

/** The active terminal scheme and its setter (/theme and the picker share it). */
export function useTerminalTheme(): TerminalThemeContextValue {
  const value = useContext(TerminalThemeContext);
  if (!value) {
    throw new Error("useTerminalTheme must be used inside TerminalThemeProvider");
  }
  return value;
}

interface TerminalThemeProviderProps {
  /** Server-read astraa_term_theme value (garbage already parsed to auto). */
  initialTheme: TermTheme;
  children: ReactNode;
}

/**
 * Terminal-scoped scheme context around next-themes: switching schemes
 * updates the state, persists the cookie, flips the root's data-term-theme
 * attribute and re-forces the html class — all without a reload. The
 * provider never calls next-themes' setTheme, so its storage key (and the
 * legacy `theme` key) is never written.
 */
export function TerminalThemeProvider({
  initialTheme,
  children,
}: TerminalThemeProviderProps) {
  const [theme, setThemeState] = useState<TermTheme>(initialTheme);

  const setTheme = useCallback((next: TermTheme) => {
    setThemeState(next);
    document.cookie = serializeTermThemeCookie(next);
    document
      .querySelector("[data-flavour='terminal']")
      ?.setAttribute("data-term-theme", next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <TerminalThemeContext.Provider value={value}>
      <ThemeProvider
        attribute="class"
        enableSystem
        defaultTheme="system"
        forcedTheme={forcedThemeOf(theme)}
        storageKey="astraa-terminal-theme"
      >
        {children}
      </ThemeProvider>
    </TerminalThemeContext.Provider>
  );
}
