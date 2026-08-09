"use client";

import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { unitCategories, convertUnit, type Unit } from "@/lib/unit-conversions";
import { UnitConverterForm } from "@/components/units/unit-converter-form";

export function UnitConverterClient() {
  const [category, setCategory] = useState(unitCategories[0]?.name ?? "");
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<Unit>(unitCategories[0]?.units[0] ?? ({} as Unit));
  const [toUnit, setToUnit] = useState<Unit>(unitCategories[0]?.units[1] ?? ({} as Unit));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const result = useMemo(() => {
    if (!value || isNaN(Number(value))) {
      return "";
    }

    const converted = convertUnit(Number(value), fromUnit, toUnit, category);

    return converted.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  }, [value, fromUnit, toUnit, category]);

  const handleCategoryChange = (newCategory: string) => {
    const categoryUnits = unitCategories.find((c) => c.name === newCategory)?.units;
    if (categoryUnits && categoryUnits[0] && categoryUnits[1]) {
      setCategory(newCategory);
      setFromUnit(categoryUnits[0]);
      setToUnit(categoryUnits[1]);
    }
  };

  const currentUnits = unitCategories.find((c) => c.name === category)?.units || [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-3 border-b pb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Unit Converter
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
          Convert values across angle, length, mass, temperature, time, and other measurement
          categories.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Processed in this browser
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 sm:gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-1">
          <div className="mb-3 ml-2 px-2 md:ml-0 md:px-0 lg:ml-0">
            <h2 className="hidden text-sm font-semibold uppercase tracking-wider text-muted-foreground md:block">
              Categories
            </h2>
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="flex min-h-touch w-full items-center justify-between rounded-md px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={`Categories, selected ${category}`}
              aria-controls="unit-category-options"
              aria-expanded={isMobileMenuOpen}
            >
              <span aria-hidden="true">Categories</span>
              {isMobileMenuOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <nav
            id="unit-category-options"
            aria-label="Unit categories"
            className={cn(
              "space-y-1",
              isMobileMenuOpen ? "block" : "hidden md:block", // Toggle on mobile, always visible on desktop
            )}
          >
            {unitCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                aria-pressed={category === cat.name}
                onClick={() => {
                  handleCategoryChange(cat.name);
                  if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                    window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
                  }
                }}
                className={cn(
                  "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-left",
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
          <Card className="h-full border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
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
