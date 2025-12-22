"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { CalculatorDisplay } from "@/components/calculator/calculator-display"
import { CalculatorButton } from "@/components/calculator/calculator-button"
import { evaluateExpression, scientificFunctions } from "@/lib/calculator/calculator-utils"

export default function Calculator() {
  const [display, setDisplay] = useState("")
  const [expression, setExpression] = useState("")
  const [isNewNumber, setIsNewNumber] = useState(true)

  const appendNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num)
      setIsNewNumber(false)
    } else {
      setDisplay(display + num)
    }
  }

  const appendOperator = (op: string) => {
    setExpression(expression + display + op)
    setIsNewNumber(true)
  }

  const calculate = () => {
    try {
      const fullExpression = expression + display
      const result = evaluateExpression(fullExpression)
      setDisplay(result.toString())
      setExpression("")
      setIsNewNumber(true)
    } catch (error) {
      setDisplay("Error")
      setExpression("")
      setIsNewNumber(true)
    }
  }

  const clear = () => {
    setDisplay("")
    setExpression("")
    setIsNewNumber(true)
  }

  const applyFunction = (fn: keyof typeof scientificFunctions) => {
    try {
      const num = parseFloat(display)
      const result = scientificFunctions[fn](num)
      setDisplay(result.toString())
      setIsNewNumber(true)
    } catch (error) {
      setDisplay("Error")
      setIsNewNumber(true)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 sm:space-y-8 px-4">
      <div>
        <h1 className="text-fluid-3xl font-bold">Scientific Calculator</h1>
        <p className="text-muted-foreground text-fluid-base">
          Perform complex calculations with ease
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        <CalculatorDisplay
          value={display}
          expression={expression}
        />

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Scientific Functions */}
          <CalculatorButton value="sin" onClick={() => applyFunction("sin")} />
          <CalculatorButton value="cos" onClick={() => applyFunction("cos")} />
          <CalculatorButton value="tan" onClick={() => applyFunction("tan")} />
          <CalculatorButton value="^" onClick={() => appendOperator("^")} />

          <CalculatorButton value="log" onClick={() => applyFunction("log")} />
          <CalculatorButton value="ln" onClick={() => applyFunction("ln")} />
          <CalculatorButton value="√" onClick={() => applyFunction("sqrt")} />
          <CalculatorButton value="abs" onClick={() => applyFunction("abs")} />

          {/* Numbers and Basic Operations */}
          <CalculatorButton value="7" onClick={() => appendNumber("7")} />
          <CalculatorButton value="8" onClick={() => appendNumber("8")} />
          <CalculatorButton value="9" onClick={() => appendNumber("9")} />
          <CalculatorButton
            value="÷"
            onClick={() => appendOperator("/")}
            variant="secondary"
          />

          <CalculatorButton value="4" onClick={() => appendNumber("4")} />
          <CalculatorButton value="5" onClick={() => appendNumber("5")} />
          <CalculatorButton value="6" onClick={() => appendNumber("6")} />
          <CalculatorButton
            value="×"
            onClick={() => appendOperator("*")}
            variant="secondary"
          />

          <CalculatorButton value="1" onClick={() => appendNumber("1")} />
          <CalculatorButton value="2" onClick={() => appendNumber("2")} />
          <CalculatorButton value="3" onClick={() => appendNumber("3")} />
          <CalculatorButton
            value="-"
            onClick={() => appendOperator("-")}
            variant="secondary"
          />

          <CalculatorButton value="0" onClick={() => appendNumber("0")} />
          <CalculatorButton value="." onClick={() => appendNumber(".")} />
          <CalculatorButton
            value="="
            onClick={calculate}
            variant="default"
          />
          <CalculatorButton
            value="+"
            onClick={() => appendOperator("+")}
            variant="secondary"
          />

          <CalculatorButton
            value="C"
            onClick={clear}
            variant="secondary"
            className="col-span-4"
          />
        </div>
      </Card>
    </div>
  )
}