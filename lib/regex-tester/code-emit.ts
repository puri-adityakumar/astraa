import type { CodeLang } from "./types";

function escapeJsLiteral(pattern: string): string {
  return pattern.replace(/\//g, "\\/");
}

function escapeForJavaDoubleQuotes(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeForPythonRawDoubleQuotes(value: string): string {
  // Python r"..." preserves backslashes; only embedded " needs escaping.
  return value.replace(/"/g, '\\"');
}

function escapeForPhpSingleQuotes(value: string): string {
  // PHP single-quoted strings only process \\ and \'.
  return value.replace(/'/g, "\\'");
}

function pythonFlags(flags: string): string {
  const parts: string[] = [];
  if (flags.includes("i")) parts.push("re.IGNORECASE");
  if (flags.includes("m")) parts.push("re.MULTILINE");
  if (flags.includes("s")) parts.push("re.DOTALL");
  if (flags.includes("u")) parts.push("re.UNICODE");
  return parts.length === 0 ? "0" : parts.join(" | ");
}

function javaFlags(flags: string): string {
  const parts: string[] = [];
  if (flags.includes("i")) parts.push("Pattern.CASE_INSENSITIVE");
  if (flags.includes("m")) parts.push("Pattern.MULTILINE");
  if (flags.includes("s")) parts.push("Pattern.DOTALL");
  if (flags.includes("u")) parts.push("Pattern.UNICODE_CASE");
  return parts.length === 0 ? "0" : parts.join(" | ");
}

function goInlineFlags(flags: string): string {
  let out = "";
  if (flags.includes("i")) out += "i";
  if (flags.includes("m")) out += "m";
  if (flags.includes("s")) out += "s";
  return out;
}

function emitJs(pattern: string, flags: string): string {
  const literal = escapeJsLiteral(pattern);
  const flagsNote = flags.includes("g") ? "" : "\n// Add the 'g' flag for global matching.";
  return [
    "// JavaScript",
    `const re = /${literal}/${flags};${flagsNote}`,
    "const matches = input.match(re);",
  ].join("\n");
}

function emitPython(pattern: string, flags: string): string {
  const flagNotes: string[] = [];
  if (flags.includes("g")) flagNotes.push("# Python 're' is global by default; iterate with re.finditer().");
  if (flags.includes("y")) flagNotes.push("# 'y' (sticky) flag is JS-only — not represented in Python.");
  return [
    "# Python",
    "import re",
    `pattern = r"${escapeForPythonRawDoubleQuotes(pattern)}"`,
    `regex = re.compile(pattern, ${pythonFlags(flags)})`,
    "matches = [m.group(0) for m in regex.finditer(input)]",
    ...flagNotes,
  ].join("\n");
}

function emitJava(pattern: string, flags: string): string {
  const notes: string[] = [];
  if (flags.includes("g")) notes.push("// Iterate with matcher.find() in a loop for all matches.");
  if (flags.includes("y")) notes.push("// 'y' (sticky) flag is JS-only — not represented in Java.");
  return [
    "// Java",
    "import java.util.regex.Pattern;",
    "import java.util.regex.Matcher;",
    `Pattern p = Pattern.compile("${escapeForJavaDoubleQuotes(pattern)}", ${javaFlags(flags)});`,
    "Matcher m = p.matcher(input);",
    "while (m.find()) {",
    "    System.out.println(m.group());",
    "}",
    ...notes,
  ].join("\n");
}

function emitGo(pattern: string, flags: string): string {
  const inline = goInlineFlags(flags);
  const expr = inline ? `(?${inline})${pattern}` : pattern;
  const notes: string[] = [];
  if (flags.includes("u")) notes.push("// Go regexp is UTF-8 native — no explicit unicode flag needed.");
  if (flags.includes("y")) notes.push("// 'y' (sticky) flag is JS-only — not represented in Go.");
  return [
    "// Go",
    "import \"regexp\"",
    `re := regexp.MustCompile(\`${expr}\`)`,
    flags.includes("g")
      ? "matches := re.FindAllString(input, -1)"
      : "match := re.FindString(input)",
    ...notes,
  ].join("\n");
}

function emitPhp(pattern: string, flags: string): string {
  return [
    "// PHP",
    `$pattern = '/${escapeForPhpSingleQuotes(pattern)}/${flags.replace(/y/g, "")}';`,
    flags.includes("g")
      ? "preg_match_all($pattern, $input, $matches);"
      : "preg_match($pattern, $input, $matches);",
  ].join("\n");
}

export function emitCode(
  pattern: string,
  flags: string,
  lang: CodeLang,
): string {
  if (pattern.length === 0) return "// Enter a pattern to generate code.";
  switch (lang) {
    case "js":
      return emitJs(pattern, flags);
    case "python":
      return emitPython(pattern, flags);
    case "java":
      return emitJava(pattern, flags);
    case "go":
      return emitGo(pattern, flags);
    case "php":
      return emitPhp(pattern, flags);
    default: {
      const _exhaustive: never = lang;
      return _exhaustive;
    }
  }
}
