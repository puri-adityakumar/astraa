"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Contrast } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useAccessibility } from "./enhanced-theme-provider"
import { themes } from "@/lib/themes/theme-config"

export function EnhancedThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { preferences, updatePreferences } = useAccessibility()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="min-h-touch min-w-touch"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" aria-hidden="true" />
      </Button>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light-high-contrast', label: 'Light High Contrast', icon: Contrast },
    { value: 'dark-high-contrast', label: 'Dark High Contrast', icon: Contrast },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const currentThemeIcon = themeOptions.find(opt => opt.value === theme)?.icon || Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-touch min-w-touch hover:bg-primary/10 transition-colors duration-200"
          aria-label="Theme settings"
        >
          {React.createElement(currentThemeIcon, {
            className: "h-5 w-5",
            "aria-hidden": "true"
          })}
          <span className="sr-only">Theme settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((option) => {
          const Icon = option.icon
          const themeConfig = option.value !== 'system' 
            ? themes[option.value as keyof typeof themes]
            : null
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <div className="flex flex-col">
                <span>{option.label}</span>
                {themeConfig?.description && (
                  <span className="text-xs text-muted-foreground">
                    {themeConfig.description}
                  </span>
                )}
              </div>
              {theme === option.value && (
                <span className="ml-auto text-primary" aria-label="Selected">✓</span>
              )}
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        
        <DropdownMenuCheckboxItem
          checked={preferences.reducedMotion}
          onCheckedChange={(checked) => 
            updatePreferences({ reducedMotion: checked })
          }
        >
          Reduce Motion
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={preferences.focusIndicators === 'enhanced'}
          onCheckedChange={(checked) => 
            updatePreferences({ focusIndicators: checked ? 'enhanced' : 'default' })
          }
        >
          Enhanced Focus
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Font Size</DropdownMenuLabel>
        
        {(['small', 'medium', 'large'] as const).map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => updatePreferences({ fontSize: size })}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="capitalize">{size}</span>
            {preferences.fontSize === size && (
              <span className="text-primary" aria-label="Selected">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
