export type Operation = {
  symbol: string
  precedence: number
  execute: (a: number, b: number) => number
}

export const operations: { [key: string]: Operation } = {
  '+': { symbol: '+', precedence: 1, execute: (a, b) => a + b },
  '-': { symbol: '-', precedence: 1, execute: (a, b) => a - b },
  '*': { symbol: '×', precedence: 2, execute: (a, b) => a * b },
  '/': { symbol: '÷', precedence: 2, execute: (a, b) => a / b },
  '^': { symbol: '^', precedence: 3, execute: (a, b) => Math.pow(a, b) }
}

export const scientificFunctions = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt,
  abs: Math.abs,
  fact: (n: number) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
}

const WHITESPACE_RE = /\s+/g;
const OPERATOR_SET = new Set(["+", "-", "*", "/", "^"]);
const RIGHT_ASSOCIATIVE = new Set(["^"]);

export function evaluateExpression(expression: string): number {
  // Remove whitespace and validate
  expression = expression.replace(WHITESPACE_RE, "");
  if (!expression) return 0;

  // Tokenize the expression
  const tokens = tokenize(expression)

  // Convert to postfix notation
  const postfix = toPostfix(tokens)

  // Evaluate postfix expression
  return evaluatePostfix(postfix)
}

function tokenize(expression: string): string[] {
  const tokens: string[] = []
  let current = ''

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]

    if (char && (isOperator(char) || isParenthesis(char) || char === "%")) {
      if (current) tokens.push(current)
      tokens.push(char)
      current = ''
    } else if (char) {
      current += char
    }
  }

  if (current) tokens.push(current)

  return tokens
}

function isOperator(char: string): boolean {
  return OPERATOR_SET.has(char);
}

function isParenthesis(char: string): boolean {
  return char === "(" || char === ")";
}

function toPostfix(tokens: string[]): string[] {
  const output: string[] = []
  const operators: string[] = []

  for (const token of tokens) {
    if (token === "%") {
      // Postfix percent: applies directly to the preceding value (x% = x / 100).
      output.push(token)
    } else if (isOperator(token)) {
      const current = operations[token]
      if (!current) continue
      const rightAssociative = RIGHT_ASSOCIATIVE.has(token)
      while (operators.length > 0) {
        const lastOp = operators[operators.length - 1]
        if (!lastOp || !operations[lastOp]) break
        const last = operations[lastOp]
        // Right-associative operators (^) only pop on strictly-higher precedence;
        // left-associative operators pop on equal-or-higher precedence.
        if (rightAssociative) {
          if (last.precedence <= current.precedence) break
        } else if (last.precedence < current.precedence) {
          break
        }
        const popped = operators.pop()
        if (popped) output.push(popped)
      }
      operators.push(token)
    } else if (token === "(") {
      operators.push(token)
    } else if (token === ")") {
      while (operators.length > 0 && operators[operators.length - 1] !== "(") {
        const popped = operators.pop()
        if (popped) output.push(popped)
      }
      // Discard the matching "(" if present.
      if (operators[operators.length - 1] === "(") operators.pop()
    } else {
      output.push(token)
    }
  }

  while (operators.length > 0) {
    const popped = operators.pop()
    if (popped && popped !== "(") output.push(popped)
  }

  return output
}

function evaluatePostfix(tokens: string[]): number {
  const stack: number[] = []

  for (const token of tokens) {
    if (token === "%") {
      const a = stack.pop()
      if (a !== undefined) {
        stack.push(a / 100)
      } else {
        return NaN
      }
    } else if (isOperator(token) && operations[token]) {
      const b = stack.pop()
      const a = stack.pop()

      if (a !== undefined && b !== undefined) {
        stack.push(operations[token].execute(a, b))
      } else {
        // Handle error case for fewer operands than needed
        return NaN
      }
    } else {
      stack.push(Number(token))
    }
  }

  return stack[0] ?? 0
}