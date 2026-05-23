import type { Highlighter } from "shiki";
import { LANGUAGES, THEMES } from "./defaults";
import type { HighlightResult } from "./types";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    const { createHighlighter } = await import("shiki");
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript"],
    });
  }
  return highlighterPromise;
}

export function isSupportedLanguage(id: string): boolean {
  return LANGUAGES.some((l) => l.id === id);
}

export function isSupportedTheme(id: string): boolean {
  return THEMES.some((t) => t.id === id);
}

export function getDefaultLanguage(): string {
  return "typescript";
}

export async function highlight(
  code: string,
  language: string,
  theme: string,
): Promise<HighlightResult> {
  const lang = isSupportedLanguage(language) ? language : getDefaultLanguage();
  const themeId = isSupportedTheme(theme) ? theme : "github-dark";
  const h = await getHighlighter();
  if (!h.getLoadedThemes().includes(themeId)) await h.loadTheme(themeId as never);
  if (!h.getLoadedLanguages().includes(lang)) await h.loadLanguage(lang as never);
  const tokenized = h.codeToTokens(code, { lang: lang as never, theme: themeId });
  return {
    lines: tokenized.tokens.map((line) =>
      line.map((t) =>
        t.color === undefined ? { content: t.content } : { content: t.content, color: t.color },
      ),
    ),
    bg: tokenized.bg ?? "#0d1117",
    fg: tokenized.fg ?? "#e6edf3",
  };
}
