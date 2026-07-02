export type Operation = {
  symbol: string;
  precedence: number;
  associativity: "left" | "right";
  execute: (a: number, b: number) => number;
};

export const operations: { [key: string]: Operation } = {
  "+": { symbol: "+", precedence: 1, associativity: "left", execute: (a, b) => a + b },
  "-": { symbol: "-", precedence: 1, associativity: "left", execute: (a, b) => a - b },
  "*": { symbol: "×", precedence: 2, associativity: "left", execute: (a, b) => a * b },
  "/": { symbol: "÷", precedence: 2, associativity: "left", execute: (a, b) => a / b },
  "^": { symbol: "^", precedence: 3, associativity: "right", execute: (a, b) => Math.pow(a, b) },
};

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
  },
};

const WHITESPACE_RE = /\s+/g;

export function evaluateExpression(expression: string): number {
  // Remove whitespace and validate
  expression = expression.replace(WHITESPACE_RE, "");
  if (!expression) return 0;

  // Tokenize the expression
  const tokens = tokenize(expression);

  // Convert to postfix notation
  const postfix = toPostfix(tokens);

  // Evaluate postfix expression
  return evaluatePostfix(postfix);
}

// Returns true for binary operators (+, -, *, /, ^). Parentheses and the
// postfix percent operator are handled separately and are NOT binary operators.
function isBinaryOperator(token: string): boolean {
  return Boolean(operations[token]);
}

function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let current = "";

  const flush = () => {
    if (current) {
      tokens.push(current);
      current = "";
    }
  };

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    if (char && isTokenBoundary(char)) {
      // Binary operators, parentheses, and % each form their own token.
      flush();
      tokens.push(char);
    } else if (char) {
      current += char;
    }
  }

  flush();

  return tokens;
}

// Single characters that terminate a number/operand token and are emitted as
// standalone tokens. Includes binary operators, parentheses, and percent.
function isTokenBoundary(char: string): boolean {
  return isBinaryOperator(char) || char === "(" || char === ")" || char === "%";
}

function toPostfix(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];

  for (const token of tokens) {
    if (isBinaryOperator(token)) {
      while (operators.length > 0) {
        const top = operators[operators.length - 1];
        // Stop at a left paren or any non-operator on the stack.
        if (!top || top === "(" || !operations[top] || !operations[token]) break;
        // Pop higher-precedence ops, and equal-precedence ops only when the
        // incoming operator is left-associative. Right-associative ^ therefore
        // does not pop an equal-precedence ^ on the stack.
        const shouldPop =
          operations[top].precedence > operations[token].precedence ||
          (operations[top].precedence === operations[token].precedence &&
            operations[token].associativity === "left");
        if (!shouldPop) break;
        const popped = operators.pop();
        if (popped) output.push(popped);
      }
      operators.push(token);
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      // Pop operators to output until the matching left paren (discard both).
      while (operators.length > 0) {
        const top = operators[operators.length - 1];
        if (top === "(") {
          operators.pop();
          break;
        }
        const popped = operators.pop();
        if (popped) output.push(popped);
      }
    } else if (token === "%") {
      // Postfix unary operator: emit directly to output so it binds to the
      // immediately preceding operand during postfix evaluation.
      output.push(token);
    } else {
      output.push(token);
    }
  }

  // Drain remaining operators. Parentheses are structural, not operators, and
  // are never emitted to output.
  while (operators.length > 0) {
    const popped = operators.pop();
    if (popped && isBinaryOperator(popped)) {
      output.push(popped);
    }
  }

  return output;
}

function evaluatePostfix(tokens: string[]): number {
  const stack: number[] = [];

  for (const token of tokens) {
    if (isBinaryOperator(token) && operations[token]) {
      const b = stack.pop();
      const a = stack.pop();

      if (a !== undefined && b !== undefined) {
        stack.push(operations[token]!.execute(a, b));
      } else {
        // Handle error case for fewer operands than needed
        return NaN;
      }
    } else if (token === "%") {
      // Postfix unary percent: divide the preceding operand by 100.
      const a = stack.pop();
      if (a !== undefined) {
        stack.push(a / 100);
      } else {
        return NaN;
      }
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0] ?? 0;
}
