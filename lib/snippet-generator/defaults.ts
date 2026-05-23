import type {
  BgPreset,
  ThemeOption,
  FontOption,
  LanguageOption,
  SnippetState,
} from "./types";

export const BG_PRESETS: BgPreset[] = [
  { id: "violet",      name: "Violet",   css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "sunset",      name: "Sunset",   css: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)" },
  { id: "ocean",       name: "Ocean",    css: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { id: "forest",      name: "Forest",   css: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
  { id: "rose",        name: "Rose",     css: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "midnight",    name: "Midnight", css: "linear-gradient(135deg, #2c3e50 0%, #4a00e0 100%)" },
  { id: "mesh-aurora", name: "Aurora",   css: "radial-gradient(at 0% 0%, #ff006e 0%, transparent 50%), radial-gradient(at 100% 100%, #3a86ff 0%, transparent 50%), #0d1117" },
  { id: "mesh-candy",  name: "Candy",    css: "radial-gradient(at 20% 80%, #ffafbd 0%, transparent 50%), radial-gradient(at 80% 20%, #ffc3a0 0%, transparent 50%), #fff5e1" },
  { id: "mesh-arctic", name: "Arctic",   css: "radial-gradient(at 50% 0%, #a1c4fd 0%, transparent 60%), radial-gradient(at 50% 100%, #c2e9fb 0%, transparent 60%), #e0f2fe" },
  { id: "solid-zinc",  name: "Zinc",     css: "#18181b" },
  { id: "solid-paper", name: "Paper",    css: "#fafaf9" },
  { id: "solid-brand", name: "Astraa",   css: "hsl(var(--primary))" },
];

export const THEMES: ThemeOption[] = [
  { id: "github-dark",        name: "GitHub Dark" },
  { id: "github-light",       name: "GitHub Light" },
  { id: "dracula",            name: "Dracula" },
  { id: "one-dark-pro",       name: "One Dark Pro" },
  { id: "nord",               name: "Nord" },
  { id: "tokyo-night",        name: "Tokyo Night" },
  { id: "catppuccin-mocha",   name: "Catppuccin Mocha" },
  { id: "monokai",            name: "Monokai" },
  { id: "solarized-dark",     name: "Solarized Dark" },
];

export const FONTS: FontOption[] = [
  { family: "JetBrains Mono", label: "JetBrains Mono" },
  { family: "Geist Mono",     label: "Geist Mono" },
  { family: "Fira Code",      label: "Fira Code" },
  { family: "IBM Plex Mono",  label: "IBM Plex Mono" },
];

export const LANGUAGES: LanguageOption[] = [
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "python",     name: "Python" },
  { id: "go",         name: "Go" },
  { id: "rust",       name: "Rust" },
  { id: "java",       name: "Java" },
  { id: "c",          name: "C" },
  { id: "cpp",        name: "C++" },
  { id: "csharp",     name: "C#" },
  { id: "ruby",       name: "Ruby" },
  { id: "php",        name: "PHP" },
  { id: "swift",      name: "Swift" },
  { id: "kotlin",     name: "Kotlin" },
  { id: "html",       name: "HTML" },
  { id: "css",        name: "CSS" },
  { id: "json",       name: "JSON" },
  { id: "yaml",       name: "YAML" },
  { id: "sql",        name: "SQL" },
  { id: "bash",       name: "Bash" },
  { id: "markdown",   name: "Markdown" },
];

export const DEFAULT_CODE = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("astraa"));`;

export const DEFAULT_STATE: SnippetState = {
  schemaVersion: 1,
  mode: "code",
  code: DEFAULT_CODE,
  language: "typescript",
  filename: "index.ts",
  theme: "github-dark",
  font: { family: "JetBrains Mono", size: 14 },
  padding: 64,
  windowChrome: "macos",
  lineNumbers: false,
  dropShadow: true,
  aspect: { w: 1200, h: 675 },
  background: { kind: "preset", id: "violet" },
  screenshotDataUrl: null,
};

export const ASPECT_PRESETS = [
  { id: "twitter",  name: "Twitter 16:9", w: 1200, h: 675 },
  { id: "square",   name: "Square 1:1",   w: 1080, h: 1080 },
  { id: "linkedin", name: "LinkedIn",     w: 1200, h: 627 },
  { id: "story",    name: "Story 9:16",   w: 1080, h: 1920 },
];

export const PADDING_PRESETS = [16, 32, 64, 128] as const;
