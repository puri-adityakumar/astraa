"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UnitConverterForm } from "@/components/units/unit-converter-form";
import { unitCategories, convertUnit, type Unit } from "@/lib/unit-conversions";
import { cn } from "@/lib/utils";

export function UnitConverterClient() {
  const [category, setCategory] = useState(unitCategories[0]?.name ?? "");
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<Unit>(
    unitCategories[0]?.units[0] ?? ({} as Unit),
  );
  const [toUnit, setToUnit] = useState<Unit>(
    unitCategories[0]?.units[1] ?? ({} as Unit),
  );
  const [result, setResult] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!value || isNaN(Number(value))) {
      setResult("");
      return;
    }

    const converted = convertUnit(Number(value), fromUnit, toUnit, category);

    setResult(
      converted.toLocaleString(undefined, {
        maximumFractionDigits: 6,
      }),
    );
  }, [value, fromUnit, toUnit, category]);

  const handleCategoryChange = (newCategory: string) => {
    const categoryUnits = unitCategories.find(
      (c) => c.name === newCategory,
    )?.units;
    if (categoryUnits && categoryUnits[0] && categoryUnits[1]) {
      setCategory(newCategory);
      setFromUnit(categoryUnits[0]);
      setToUnit(categoryUnits[1]);
    }
  };

  const currentUnits =
    unitCategories.find((c) => c.name === category)?.units || [];

  return (
    <div className="container max-w-5xl space-y-8 px-4 pb-12 pt-24 sm:px-6">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Unit Converter
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Seamlessly convert between different units of measurement. Select a
          category from the menu to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          <div className="mb-3 ml-2 flex items-center justify-between px-2 md:block md:px-0 lg:ml-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav
            className={cn(
              "space-y-1",
              isMobileMenuOpen ? "block" : "hidden md:block", // Toggle on mobile, always visible on desktop
            )}
          >
            {unitCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  handleCategoryChange(cat.name);
                  setIsMobileMenuOpen(false); // Close menu on selection (mobile)
                }}
                className={cn(
                  "flex w-full items-center rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all duration-200",
                  category === cat.name
                    ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          <Card className="h-full overflow-hidden border-border/50 shadow-sm">
            <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Convert {category}
                </h2>
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
  );
}
