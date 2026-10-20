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
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
}

const WHITESPACE_RE = /\s+/g;
const TOKEN_RE = /(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[()+\-*/^%]/g;

export function evaluateExpression(expression: string): number {
  // Remove whitespace and validate
  expression = expression.replace(WHITESPACE_RE, "");
  if (!expression) return 0;

  const tokens = expression.match(TOKEN_RE) ?? [];
  if (tokens.join("") !== expression) return NaN;
  let index = 0;

  function parseOperand(): number {
    const token = tokens[index++];
    let value: number;
    if (token === "+" || token === "-") {
      // Exponents bind more tightly than a leading sign: -2^2 = -(2^2).
      value = parseBinary(3) * (token === "-" ? -1 : 1);
    } else if (token === "(") {
      value = parseBinary(1);
      if (tokens[index++] !== ")") return NaN;
    } else if (token && !["%", ")", "*", "/", "^"].includes(token)) {
      value = Number(token);
    } else {
      return NaN;
    }
    while (tokens[index] === "%") {
      value /= 100;
      index++;
    }
    return value;
  }

  function parseBinary(minPrecedence: number): number {
    let value = parseOperand();
    while (index < tokens.length) {
      const token = tokens[index] ?? "";
      const operation = operations[token];
      if (!operation || operation.precedence < minPrecedence) break;
      index++;
      value = operation.execute(value, parseBinary(operation.precedence + 1));
    }
    return value;
  }

  const result = parseBinary(1);
  return index === tokens.length ? result : NaN;
}