"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalculatorDisplay } from "@/components/calculator/calculator-display";
import { CalculatorButton } from "@/components/calculator/calculator-button";
import {
  evaluateExpression,
  scientificFunctions,
} from "@/lib/calculator/calculator-utils";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [angleMode, setAngleMode] = useState<"RAD" | "DEG">("RAD");

  // Clear function
  const clear = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setIsNewNumber(true);
  }, []);

  // Append number
  const appendNumber = useCallback(
    (num: string) => {
      if (isNewNumber) {
        if (num === ".") {
          setDisplay("0.");
        } else {
          setDisplay(num);
        }
        setIsNewNumber(false);
      } else {
        if (num === ".") {
          if (display.includes(".")) return;
          setDisplay(display + ".");
        } else {
          if (num === "." && display.includes(".")) return;
          setDisplay(display === "0" ? num : display + num);
        }
      }
    },
    [isNewNumber, display],
  );

  // Append operator
  const appendOperator = useCallback(
    (op: string) => {
      if (display === "Error") return;

      if (isNewNumber && expression) {
        setExpression((prev) => prev.slice(0, -1) + op);
      } else {
        setExpression(expression + display + op);
        setIsNewNumber(true);
      }
    },
    [isNewNumber, expression, display],
  );

  // Calculate result
  const calculate = useCallback(() => {
    if (!expression && isNewNumber) return;

    try {
      const fullExpression = expression + display;
      const result = evaluateExpression(fullExpression);
      setDisplay(result.toString());
      setExpression("");
      setIsNewNumber(true);
    } catch (error) {
      setDisplay("Error");
      setExpression("");
      setIsNewNumber(true);
    }
  }, [expression, display, isNewNumber]);

  // Backspace
  const handleBackspace = useCallback(() => {
    if (display === "Error") {
      clear();
      return;
    }
    if (isNewNumber) {
      setDisplay("0");
      return;
    }

    setDisplay((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  }, [display, isNewNumber, clear]);

  // Apply scientific function
  const applyFunction = useCallback(
    (fn: keyof typeof scientificFunctions) => {
      if (display === "Error") return;

      try {
        const num = parseFloat(display);
        let result: number;

        if (fn === "sin" || fn === "cos" || fn === "tan") {
          const input = angleMode === "DEG" ? num * (Math.PI / 180) : num;
          result = scientificFunctions[fn](input);

          // Fix precision errors
          if (Math.abs(result) < 1e-10) result = 0;
          if (Math.abs(result - 1) < 1e-10) result = 1;
          if (Math.abs(result + 1) < 1e-10) result = -1;
        } else {
          result = scientificFunctions[fn](num);
        }

        setDisplay(result.toString());
        setIsNewNumber(true);
      } catch (error) {
        setDisplay("Error");
        setIsNewNumber(true);
      }
    },
    [display, angleMode],
  );

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow browser shortcuts (Ctrl/Meta/Alt + Anything)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;

      // Map keys
      if (key >= "0" && key <= "9") {
        e.preventDefault();
        appendNumber(key);
      } else if (key === ".") {
        e.preventDefault();
        appendNumber(".");
      } else if (["+", "-", "*", "/", "^"].includes(key)) {
        e.preventDefault();
        appendOperator(key);
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        calculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        e.preventDefault();
        clear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendNumber, appendOperator, calculate, handleBackspace, clear]);

  return (
    <div className="container max-w-5xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Scientific Calculator
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Perform complex math calculations with our Google-style scientific
          calculator.
        </p>
      </div>

      <Card className="max-w-3xl border-border/50 shadow-sm overflow-hidden bg-background">
        <CalculatorDisplay value={display} expression={expression} />

        {/* Toolbar */}
        <div className="bg-muted/30 p-2 flex items-center gap-2 border-b border-border/50 min-h-[50px]">
          <div className="flex bg-muted/50 rounded-md p-1">
            <button
              onClick={() => setAngleMode("RAD")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                angleMode === "RAD"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              RAD
            </button>
            <button
              onClick={() => setAngleMode("DEG")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                angleMode === "DEG"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              DEG
            </button>
          </div>
          <div className="h-4 w-[1px] bg-border mx-1" />

          <span className="text-xl font-semibold text-muted-foreground ml-auto">
            Ans = {display}
          </span>
        </div>

        <div className="grid md:grid-cols-[1.2fr_1fr] bg-muted/10">
          {/* Scientific Keypad (Left) */}
          <div className="p-2 grid grid-cols-3 gap-1 content-start border-r border-border/50">
            {/* Row 1 */}
            <CalculatorButton
              value="rad"
              onClick={() => setAngleMode("RAD")}
              variant="secondary"
              className={cn(
                "text-sm",
                angleMode === "RAD" && "bg-muted text-foreground font-semibold",
              )}
            />
            <CalculatorButton
              value="deg"
              onClick={() => setAngleMode("DEG")}
              variant="secondary"
              className={cn(
                "text-sm",
                angleMode === "DEG" && "bg-muted text-foreground font-semibold",
              )}
            />
            <CalculatorButton
              value="x!"
              onClick={() => applyFunction("fact")}
              variant="secondary"
              className="text-sm"
            />

            {/* Row 2 */}
            <CalculatorButton
              value="("
              onClick={() => appendOperator("(")}
              variant="secondary"
            />
            <CalculatorButton
              value=")"
              onClick={() => appendOperator(")")}
              variant="secondary"
            />
            <CalculatorButton
              value="%"
              onClick={() => appendOperator("%")}
              variant="secondary"
            />

            {/* Row 3 */}
            <CalculatorButton
              value="sin"
              onClick={() => applyFunction("sin")}
              variant="secondary"
            />
            <CalculatorButton
              value="cos"
              onClick={() => applyFunction("cos")}
              variant="secondary"
            />
            <CalculatorButton
              value="tan"
              onClick={() => applyFunction("tan")}
              variant="secondary"
            />

            {/* Row 4 */}
            <CalculatorButton
              value="ln"
              onClick={() => applyFunction("ln")}
              variant="secondary"
            />
            <CalculatorButton
              value="log"
              onClick={() => applyFunction("log")}
              variant="secondary"
            />
            <CalculatorButton
              value="√"
              onClick={() => applyFunction("sqrt")}
              variant="secondary"
            />

            {/* Row 5 */}
            <CalculatorButton
              value="π"
              onClick={() => appendNumber("3.14159")}
              variant="secondary"
            />
            <CalculatorButton
              value="e"
              onClick={() => appendNumber("2.71828")}
              variant="secondary"
            />
            <CalculatorButton
              value="^"
              onClick={() => appendOperator("^")}
              variant="secondary"
            />
          </div>

          {/* Numeric Keypad (Right) */}
          <div className="p-2 grid grid-cols-4 gap-1">
            <CalculatorButton
              value="C"
              onClick={clear}
              variant="secondary"
              className="text-destructive font-bold"
            />
            <CalculatorButton
              value="÷"
              onClick={() => appendOperator("/")}
              variant="secondary"
              className="text-primary font-bold bg-muted/50"
            />
            <CalculatorButton
              value="×"
              onClick={() => appendOperator("*")}
              variant="secondary"
              className="text-primary font-bold bg-muted/50"
            />
            <CalculatorButton
              value="⌫"
              onClick={handleBackspace}
              variant="secondary"
              className="text-primary font-bold bg-muted/50"
            />

            <CalculatorButton
              value="7"
              onClick={() => appendNumber("7")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="8"
              onClick={() => appendNumber("8")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="9"
              onClick={() => appendNumber("9")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="-"
              onClick={() => appendOperator("-")}
              variant="secondary"
              className="text-primary font-bold bg-muted/50"
            />

            <CalculatorButton
              value="4"
              onClick={() => appendNumber("4")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="5"
              onClick={() => appendNumber("5")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="6"
              onClick={() => appendNumber("6")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="+"
              onClick={() => appendOperator("+")}
              variant="secondary"
              className="text-primary font-bold bg-muted/50"
            />

            <CalculatorButton
              value="1"
              onClick={() => appendNumber("1")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="2"
              onClick={() => appendNumber("2")}
              className="bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="3"
              onClick={() => appendNumber("3")}
              className="bg-background hover:bg-muted/50"
            />

            {/* Equals button spans 2 rows vertically in some designs, but here we just fill grid */}
            <CalculatorButton
              value="="
              onClick={calculate}
              variant="default"
              className="row-span-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl"
            />

            <CalculatorButton
              value="0"
              onClick={() => appendNumber("0")}
              className="col-span-2 bg-background hover:bg-muted/50"
            />
            <CalculatorButton
              value="."
              onClick={() => appendNumber(".")}
              className="bg-background hover:bg-muted/50"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
