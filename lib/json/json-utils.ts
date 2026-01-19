export type ValidationResult = {
  valid: boolean
  error?: {
    message: string
    line?: number
    column?: number
  }
  formatted?: string
}

export function validateJson(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, error: { message: "Input is empty" } }
  }

  try {
    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, 2)
    return { valid: true, formatted }
  } catch (e) {
    const error = e as SyntaxError
    const match = error.message.match(/position (\d+)/)
    if (match?.[1]) {
      const position = parseInt(match[1], 10)
      const { line, column } = getLineAndColumn(input, position)
      return {
        valid: false,
        error: { message: error.message, line, column }
      }
    }
    return { valid: false, error: { message: error.message } }
  }
}

function getLineAndColumn(text: string, position: number): { line: number; column: number } {
  const lines = text.substring(0, position).split("\n")
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1
  }
}

export function formatJson(input: string, indent = 2): string {
  try {
    return JSON.stringify(JSON.parse(input), null, indent)
  } catch {
    return input
  }
}

export function minifyJson(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input))
  } catch {
    return input
  }
}

export function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  return escaped
    .replace(/"([^"\\]|\\.)*"(?=\s*:)/g, '<span class="text-sky-400">$&</span>')
    .replace(/:\s*"([^"\\]|\\.)*"/g, (match) => {
      const colonPart = match.match(/^:\s*/)?.[0] ?? ": "
      const stringPart = match.slice(colonPart.length)
      return `${colonPart}<span class="text-emerald-400">${stringPart}</span>`
    })
    .replace(/:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g, (match, num) => {
      const colonPart = match.match(/^:\s*/)?.[0] ?? ": "
      return `${colonPart}<span class="text-amber-400">${num}</span>`
    })
    .replace(/:\s*(true|false|null)\b/g, (match, keyword) => {
      const colonPart = match.match(/^:\s*/)?.[0] ?? ": "
      return `${colonPart}<span class="text-purple-400">${keyword}</span>`
    })
}
