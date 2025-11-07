"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useAccessibility } from "./enhanced-theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * Demo component showcasing the enhanced theme system
 * This component demonstrates all theme colors and accessibility features
 */
export function ThemeDemo() {
  const { theme } = useTheme()
  const { preferences } = useAccessibility()

  const colorTokens = [
    { name: 'Primary', bg: 'bg-primary', text: 'text-primary-foreground' },
    { name: 'Secondary', bg: 'bg-secondary', text: 'text-secondary-foreground' },
    { name: 'Accent', bg: 'bg-accent', text: 'text-accent-foreground' },
    { name: 'Muted', bg: 'bg-muted', text: 'text-muted-foreground' },
    { name: 'Success', bg: 'bg-success', text: 'text-success-foreground' },
    { name: 'Warning', bg: 'bg-warning', text: 'text-warning-foreground' },
    { name: 'Info', bg: 'bg-info', text: 'text-info-foreground' },
    { name: 'Destructive', bg: 'bg-destructive', text: 'text-destructive-foreground' },
  ]

  return (
    <div className="space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Theme Settings</CardTitle>
          <CardDescription>
            Active theme and accessibility preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Theme</p>
              <Badge variant="outline" className="capitalize">
                {theme || 'system'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Font Size</p>
              <Badge variant="outline" className="capitalize">
                {preferences.fontSize}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Reduced Motion</p>
              <Badge variant={preferences.reducedMotion ? "default" : "outline"}>
                {preferences.reducedMotion ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Enhanced Focus</p>
              <Badge variant={preferences.focusIndicators === 'enhanced' ? "default" : "outline"}>
                {preferences.focusIndicators === 'enhanced' ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Tokens</CardTitle>
          <CardDescription>
            All available theme color tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className={`${token.bg} ${token.text} p-4 rounded-lg text-center font-medium`}
              >
                {token.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>
            Test keyboard navigation and focus indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Try navigating these buttons with Tab key to see focus indicators
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Messages</CardTitle>
          <CardDescription>
            Different status message styles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="status-success">
            <strong>Success:</strong> Operation completed successfully
          </div>
          <div className="status-warning">
            <strong>Warning:</strong> Please review before proceeding
          </div>
          <div className="status-error">
            <strong>Error:</strong> Something went wrong
          </div>
          <div className="status-info">
            <strong>Info:</strong> Additional information available
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
