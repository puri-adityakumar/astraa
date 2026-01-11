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

export function evaluateExpression(expression: string): number {
  // Remove whitespace and validate
  expression = expression.replace(/\s+/g, '')
  if (!expression) return 0

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

    if (char && isOperator(char)) {
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
  return '+-*/^'.includes(char)
}

function toPostfix(tokens: string[]): string[] {
  const output: string[] = []
  const operators: string[] = []

  for (const token of tokens) {
    if (isOperator(token)) {
      while (operators.length > 0) {
        const lastOp = operators[operators.length - 1]
        if (!lastOp || !operations[lastOp] || !operations[token]) break
        if (operations[lastOp].precedence < operations[token].precedence) break
        const popped = operators.pop()
        if (popped) output.push(popped)
      }
      operators.push(token)
    } else {
      output.push(token)
    }
  }

  while (operators.length > 0) {
    const popped = operators.pop()
    if (popped) output.push(popped)
  }

  return output
}

function evaluatePostfix(tokens: string[]): number {
  const stack: number[] = []

  for (const token of tokens) {
    if (isOperator(token) && operations[token]) {
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