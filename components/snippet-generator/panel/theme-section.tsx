// components/snippet-generator/panel/theme-section.tsx
"use client";

import { cn } from "@/lib/utils";
import { THEMES, LANGUAGES } from "@/lib/snippet-generator/defaults";
import { Label } from "@/components/ui/label";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

const THEME_SWATCH: Record<string, { bg: string; accent: string }> = {
  "github-dark":       { bg: "#0d1117", accent: "#79c0ff" },
  "github-light":      { bg: "#ffffff", accent: "#6f42c1" },
  "dracula":           { bg: "#282a36", accent: "#bd93f9" },
  "one-dark-pro":      { bg: "#282c34", accent: "#c678dd" },
  "nord":              { bg: "#2e3440", accent: "#88c0d0" },
  "tokyo-night":       { bg: "#1a1b26", accent: "#7aa2f7" },
  "catppuccin-mocha":  { bg: "#1e1e2e", accent: "#cba6f7" },
  "monokai":           { bg: "#272822", accent: "#f92672" },
  "solarized-dark":    { bg: "#002b36", accent: "#b58900" },
};

const FALLBACK = { bg: "#0d1117", accent: "#79c0ff" };

export function ThemeSection() {
  const theme = useSnippetGenerator((s) => s.theme);
  const language = useSnippetGenerator((s) => s.language);
  const setTheme = useSnippetGenerator((s) => s.setTheme);
  const setLanguage = useSnippetGenerator((s) => s.setLanguage);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="lang-select">Language</Label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded-md px-2 py-1.5 bg-background min-h-touch transition-colors duration-100 ease-out hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Theme</Label>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {THEMES.map((t) => {
            const swatch = THEME_SWATCH[t.id] ?? FALLBACK;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 text-xs rounded-md border bg-background min-h-touch text-left",
                  "transition-colors duration-100 ease-out",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className="h-4 w-4 flex-shrink-0 rounded ring-1 ring-inset ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${swatch.bg} 40%, ${swatch.accent})`,
                  }}
                  aria-hidden
                />
                <span className="truncate">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
