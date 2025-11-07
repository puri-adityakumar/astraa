"use client"

import * as React from "react"
import { Settings, Type, Eye, Focus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAccessibility } from "@/components/theme/enhanced-theme-provider"
import { Separator } from "@/components/ui/separator"

export function AccessibilityPanel() {
  const { preferences, updatePreferences } = useAccessibility()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-touch min-w-touch hover:bg-primary/10 transition-colors duration-200"
          aria-label="Accessibility settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Accessibility settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" aria-hidden="true" />
            Accessibility Settings
          </SheetTitle>
          <SheetDescription>
            Customize your experience for better accessibility
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Motion Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion" className="text-base font-medium">
                  Reduce Motion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={preferences.reducedMotion}
                onCheckedChange={(checked) =>
                  updatePreferences({ reducedMotion: checked })
                }
                aria-describedby="reduced-motion-description"
              />
            </div>
            <p id="reduced-motion-description" className="sr-only">
              When enabled, animations and transitions will be minimized throughout the interface
            </p>
          </div>

          <Separator />

          {/* Focus Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enhanced-focus" className="text-base font-medium flex items-center gap-2">
                  <Focus className="h-4 w-4" aria-hidden="true" />
                  Enhanced Focus
                </Label>
                <p className="text-sm text-muted-foreground">
                  Stronger focus indicators for keyboard navigation
                </p>
              </div>
              <Switch
                id="enhanced-focus"
                checked={preferences.focusIndicators === 'enhanced'}
                onCheckedChange={(checked) =>
                  updatePreferences({ focusIndicators: checked ? 'enhanced' : 'default' })
                }
                aria-describedby="enhanced-focus-description"
              />
            </div>
            <p id="enhanced-focus-description" className="sr-only">
              When enabled, focus indicators will be more prominent for better visibility during keyboard navigation
            </p>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <Type className="h-4 w-4" aria-hidden="true" />
                Font Size
              </Label>
              <p className="text-sm text-muted-foreground">
                Adjust text size for better readability
              </p>
            </div>
            <RadioGroup
              value={preferences.fontSize}
              onValueChange={(value) =>
                updatePreferences({ fontSize: value as 'small' | 'medium' | 'large' })
              }
              aria-label="Font size selection"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="font-small" />
                <Label htmlFor="font-small" className="font-normal cursor-pointer">
                  Small (87.5%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="font-medium" />
                <Label htmlFor="font-medium" className="font-normal cursor-pointer">
                  Medium (100%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large" className="font-normal cursor-pointer">
                  Large (112.5%)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Information */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium">Additional Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use Tab to navigate between interactive elements</li>
              <li>Press Enter or Space to activate buttons</li>
              <li>Use Escape to close dialogs and menus</li>
              <li>Enable high contrast themes from the theme menu</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
