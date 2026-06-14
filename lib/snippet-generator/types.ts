// lib/snippet-generator/types.ts

export type Mode = "code" | "screenshot";

export type WindowChrome = "macos" | "none";

export type Padding = 16 | 32 | 64 | 128;

export type BackgroundState =
  | { kind: "preset"; id: string }
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "image"; dataUrl: string; opacity: number };

export type FontConfig = {
  family: string;
  size: number;
};

export type AspectRatio = {
  w: number;
  h: number;
};

export type SnippetState = {
  schemaVersion: 1;
  mode: Mode;
  code: string;
  language: string;
  filename: string;
  theme: string;
  font: FontConfig;
  padding: Padding;
  windowChrome: WindowChrome;
  lineNumbers: boolean;
  dropShadow: boolean;
  aspect: AspectRatio;
  background: BackgroundState;
  screenshotDataUrl: string | null;
};

export type BgPreset = {
  id: string;
  name: string;
  css: string;
};

export type ThemeOption = {
  id: string;
  name: string;
};

export type FontOption = {
  family: string;
  label: string;
};

export type LanguageOption = {
  id: string;
  name: string;
};

export type HighlightToken = {
  content: string;
  color?: string;
};

export type HighlightResult = {
  lines: HighlightToken[][];
  bg: string;
  fg: string;
};
