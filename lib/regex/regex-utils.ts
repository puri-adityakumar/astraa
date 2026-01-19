export type RegexMatch = {
  match: string
  index: number
  groups: string[]
}

export type RegexResult = {
  valid: boolean
  error?: string
  matches: RegexMatch[]
}

export function testRegex(pattern: string, flags: string, testString: string): RegexResult {
  if (!pattern) {
    return { valid: true, matches: [] }
  }

  try {
    const regex = new RegExp(pattern, flags)
    const matches: RegexMatch[] = []

    if (flags.includes("g")) {
      let match: RegExpExecArray | null
      const seenIndices = new Set<number>()
      while ((match = regex.exec(testString)) !== null) {
        if (seenIndices.has(match.index)) break
        seenIndices.add(match.index)
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })
        if (match[0].length === 0) regex.lastIndex++
      }
    } else {
      const match = regex.exec(testString)
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })
      }
    }

    return { valid: true, matches }
  } catch (e) {
    return { valid: false, error: (e as Error).message, matches: [] }
  }
}

export function highlightMatches(text: string, matches: RegexMatch[]): string {
  if (matches.length === 0) return escapeHtml(text)

  const sorted = [...matches].sort((a, b) => a.index - b.index)
  let result = ""
  let lastEnd = 0

  for (const m of sorted) {
    if (m.index < lastEnd) continue
    result += escapeHtml(text.slice(lastEnd, m.index))
    result += `<mark class="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">${escapeHtml(m.match)}</mark>`
    lastEnd = m.index + m.match.length
  }

  result += escapeHtml(text.slice(lastEnd))
  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

type ExplanationPart = {
  token: string
  description: string
}

export function explainRegex(pattern: string): ExplanationPart[] {
  if (!pattern) return []

  const parts: ExplanationPart[] = []
  let i = 0

  while (i < pattern.length) {
    const remaining = pattern.slice(i)

    const quantifierMatch = remaining.match(/^\{(\d+)(,(\d*))?\}/)
    if (quantifierMatch) {
      const [full, min, , max] = quantifierMatch
      if (max === "") {
        parts.push({ token: full, description: `${min} or more times` })
      } else if (max) {
        parts.push({ token: full, description: `Between ${min} and ${max} times` })
      } else {
        parts.push({ token: full, description: `Exactly ${min} times` })
      }
      i += full.length
      continue
    }

    const charClassMatch = remaining.match(/^\[(\^)?([^\]]+)\]/)
    if (charClassMatch) {
      const [full, negated, chars] = charClassMatch
      const desc = negated ? `Any character NOT in: ${chars}` : `Any character in: ${chars}`
      parts.push({ token: full, description: desc })
      i += full.length
      continue
    }

    const groupMatch = remaining.match(/^\((\?:|\?=|\?!|\?<=|\?<!)?/)
    if (groupMatch && remaining.startsWith("(")) {
      const [, modifier] = groupMatch
      if (modifier === "?:") {
        parts.push({ token: "(?:", description: "Non-capturing group" })
        i += 3
      } else if (modifier === "?=") {
        parts.push({ token: "(?=", description: "Positive lookahead" })
        i += 3
      } else if (modifier === "?!") {
        parts.push({ token: "(?!", description: "Negative lookahead" })
        i += 3
      } else if (modifier === "?<=") {
        parts.push({ token: "(?<=", description: "Positive lookbehind" })
        i += 4
      } else if (modifier === "?<!") {
        parts.push({ token: "(?<!", description: "Negative lookbehind" })
        i += 4
      } else {
        parts.push({ token: "(", description: "Capturing group start" })
        i += 1
      }
      continue
    }

    if (remaining.startsWith(")")) {
      parts.push({ token: ")", description: "Group end" })
      i += 1
      continue
    }

    if (remaining.startsWith("\\")) {
      const escaped = remaining.slice(0, 2)
      const descriptions: Record<string, string> = {
        "\\d": "Any digit (0-9)",
        "\\D": "Any non-digit",
        "\\w": "Any word character (a-z, A-Z, 0-9, _)",
        "\\W": "Any non-word character",
        "\\s": "Any whitespace",
        "\\S": "Any non-whitespace",
        "\\b": "Word boundary",
        "\\B": "Non-word boundary",
        "\\n": "Newline",
        "\\r": "Carriage return",
        "\\t": "Tab",
        "\\.": "Literal dot",
        "\\*": "Literal asterisk",
        "\\+": "Literal plus",
        "\\?": "Literal question mark",
        "\\^": "Literal caret",
        "\\$": "Literal dollar sign",
        "\\[": "Literal opening bracket",
        "\\]": "Literal closing bracket",
        "\\(": "Literal opening parenthesis",
        "\\)": "Literal closing parenthesis",
        "\\{": "Literal opening brace",
        "\\}": "Literal closing brace",
        "\\|": "Literal pipe",
        "\\\\": "Literal backslash"
      }
      parts.push({ token: escaped, description: descriptions[escaped] || `Escaped: ${escaped[1]}` })
      i += 2
      continue
    }

    const simpleTokens: Record<string, string> = {
      "^": "Start of string/line",
      "$": "End of string/line",
      ".": "Any character except newline",
      "*": "0 or more times (greedy)",
      "+": "1 or more times (greedy)",
      "?": "0 or 1 time (optional)",
      "|": "OR (alternation)",
      "*?": "0 or more times (lazy)",
      "+?": "1 or more times (lazy)",
      "??": "0 or 1 time (lazy)"
    }

    const twoChar = remaining.slice(0, 2)
    if (remaining.length >= 2 && simpleTokens[twoChar]) {
      parts.push({ token: twoChar, description: simpleTokens[twoChar] })
      i += 2
      continue
    }

    const oneChar = remaining[0]
    if (oneChar && simpleTokens[oneChar]) {
      parts.push({ token: oneChar, description: simpleTokens[oneChar] })
      i += 1
      continue
    }

    if (oneChar) {
      parts.push({ token: oneChar, description: `Literal: "${oneChar}"` })
    }
    i += 1
  }

  return parts
}

export const COMMON_PATTERNS = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?://[\\w.-]+(?:/[\\w./-]*)?" },
  { name: "Phone", pattern: "\\+?\\d{1,4}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Hex Color", pattern: "#[0-9A-Fa-f]{6}\\b" }
]
