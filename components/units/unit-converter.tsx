"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { unitCategories, convertUnit, type Unit } from "@/lib/unit-conversions"
import { UnitConverterForm } from "@/components/units/unit-converter-form"

export function UnitConverterClient() {
  const [category, setCategory] = useState(unitCategories[0].name)
  const [value, setValue] = useState("")
  const [fromUnit, setFromUnit] = useState<Unit>(unitCategories[0].units[0])
  const [toUnit, setToUnit] = useState<Unit>(unitCategories[0].units[1])
  const [result, setResult] = useState<string>("")

  const handleConvert = () => {
    if (!value || isNaN(Number(value))) return

    const converted = convertUnit(
      Number(value),
      fromUnit,
      toUnit,
      category
    )
    
    setResult(
      `${value} ${fromUnit.symbol} = ${converted.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })} ${toUnit.symbol}`
    )
  }

  const handleCategoryChange = (newCategory: string) => {
    const categoryUnits = unitCategories.find(c => c.name === newCategory)?.units
    if (categoryUnits) {
      setCategory(newCategory)
      setFromUnit(categoryUnits[0])
      setToUnit(categoryUnits[1])
      setResult("")
    }
  }

  const currentUnits = unitCategories.find(c => c.name === category)?.units || []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Unit Converter</h1>
        <p className="text-muted-foreground">
          Convert between different units of measurement with precision
        </p>
      </div>

      <Card className="p-6">
        <Tabs
          defaultValue={unitCategories[0].name}
          onValueChange={handleCategoryChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            {unitCategories.map((cat) => (
              <TabsTrigger key={cat.name} value={cat.name}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {unitCategories.map((cat) => (
            <TabsContent key={cat.name} value={cat.name} className="space-y-6">
              <UnitConverterForm
                units={currentUnits}
                value={value}
                fromUnit={fromUnit}
                toUnit={toUnit}
                onValueChange={setValue}
                onFromUnitChange={setFromUnit}
                onToUnitChange={setToUnit}
                onConvert={handleConvert}
              />

              {result && (
                <div className="p-4 rounded-lg glass text-center">
                  <p className="text-lg font-mono">{result}</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}