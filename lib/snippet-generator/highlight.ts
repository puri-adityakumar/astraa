import type { Highlighter } from "shiki";
import { LANGUAGES, THEMES } from "./defaults";
import type { HighlightResult, LanguageId, ThemeId } from "./types";

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    const { createHighlighter } = await import("shiki");
    const created = createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript"],
    });
    highlighterPromise = created.catch((err) => {
      highlighterPromise = null;
      throw err;
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
  const lang: LanguageId = (
    isSupportedLanguage(language) ? language : getDefaultLanguage()
  ) as LanguageId;
  const themeId: ThemeId = (isSupportedTheme(theme) ? theme : "github-dark") as ThemeId;
  const h = await getHighlighter();
  if (!h.getLoadedThemes().includes(themeId)) await h.loadTheme(themeId);
  if (!h.getLoadedLanguages().includes(lang)) await h.loadLanguage(lang);
  const tokenized = h.codeToTokens(code, { lang, theme: themeId });
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
