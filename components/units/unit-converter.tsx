
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { unitCategories, convertUnit, type Unit } from "@/lib/unit-conversions"
import { UnitConverterForm } from "@/components/units/unit-converter-form"

export function UnitConverterClient() {
  const [category, setCategory] = useState(unitCategories[0]?.name ?? "")
  const [value, setValue] = useState("1")
  const [fromUnit, setFromUnit] = useState<Unit>(unitCategories[0]?.units[0] ?? {} as Unit)
  const [toUnit, setToUnit] = useState<Unit>(unitCategories[0]?.units[1] ?? {} as Unit)
  const [result, setResult] = useState<string>("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!value || isNaN(Number(value))) {
      setResult("")
      return
    }

    const converted = convertUnit(
      Number(value),
      fromUnit,
      toUnit,
      category
    )

    setResult(
      converted.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    )
  }, [value, fromUnit, toUnit, category])

  const handleCategoryChange = (newCategory: string) => {
    const categoryUnits = unitCategories.find(c => c.name === newCategory)?.units
    if (categoryUnits && categoryUnits[0] && categoryUnits[1]) {
      setCategory(newCategory)
      setFromUnit(categoryUnits[0])
      setToUnit(categoryUnits[1])
    }
  }

  const currentUnits = unitCategories.find(c => c.name === category)?.units || []

  return (
    <div className="container px-4 sm:px-6 max-w-5xl pt-24 pb-12 space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Unit Converter
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
          Seamlessly convert between different units of measurement. Select a category from the menu to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 sm:gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between md:block px-2 md:px-0 mb-3 ml-2 lg:ml-0">
            <h2 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              Categories
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className={cn(
            "space-y-1",
            isMobileMenuOpen ? "block" : "hidden md:block" // Toggle on mobile, always visible on desktop
          )}>
            {unitCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  handleCategoryChange(cat.name)
                  setIsMobileMenuOpen(false) // Close menu on selection (mobile)
                }}
                className={cn(
                  "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-left",
                  category === cat.name
                    ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          <Card className="h-full border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Convert {category}</h2>
              </div>

              <UnitConverterForm
                units={currentUnits}
                value={value}
                fromUnit={fromUnit}
                toUnit={toUnit}
                onValueChange={setValue}
                onFromUnitChange={setFromUnit}
                onToUnitChange={setToUnit}
                resultValue={result}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}