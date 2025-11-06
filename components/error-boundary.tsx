"use client"

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Card className="glass p-6 md:p-8 text-center space-y-6 max-w-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
              <div className="relative mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred in this component.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Go Home
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
