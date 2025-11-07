# Component Documentation

This document provides comprehensive documentation for all React components in the Astraa application.

## Table of Contents

- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [UI Components](#ui-components)
- [Feature Components](#feature-components)
- [Layout Components](#layout-components)
- [Best Practices](#best-practices)
- [Component Storybook](#component-storybook)

## Overview

Astraa uses a component-based architecture built with React and Next.js. Components are organized into several categories:

- **UI Components** (`components/ui/`): Reusable, low-level UI primitives based on Radix UI
- **Feature Components**: Tool-specific components (calculator, currency converter, etc.)
- **Layout Components**: Navigation, footer, and page structure components
- **Utility Components**: Theme providers, accessibility helpers, etc.

## Component Architecture

### Directory Structure

```
components/
├── ui/                      # Base UI components (Radix UI + shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── calculator/              # Calculator tool components
│   ├── calculator-button.tsx
│   └── calculator-display.tsx
├── currency/                # Currency converter components
│   ├── crypto-converter.tsx
│   ├── fiat-converter.tsx
│   └── currency-select.tsx
├── theme/                   # Theme-related components
│   ├── theme-toggle.tsx
│   └── theme-provider.tsx
├── accessibility/           # Accessibility components
│   ├── keyboard-nav-detector.tsx
│   └── skip-to-main.tsx
├── navigation.tsx           # Main navigation
├── footer.tsx              # Footer
└── ...
```

### Component Types

#### 1. Presentational Components
Pure components that receive data via props and render UI.

```typescript
// Example: calculator-display.tsx
interface CalculatorDisplayProps {
  value: string
  className?: string
}

export function CalculatorDisplay({ value, className }: CalculatorDisplayProps) {
  return (
    <div className={cn("calculator-display", className)}>
      {value}
    </div>
  )
}
```

#### 2. Container Components
Components that manage state and logic.

```typescript
// Example: currency-converter.tsx
export function CurrencyConverter() {
  const [amount, setAmount] = useState(0)
  const [rate, setRate] = useState(1)

  // Logic and state management

  return (
    <div>
      {/* Presentational components */}
    </div>
  )
}
```

#### 3. Layout Components
Components that define page structure.

```typescript
// Example: app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## UI Components

### Base Components (Radix UI)

All base UI components are built using Radix UI primitives, providing:
- Accessibility (WCAG 2.1 AA)
- Keyboard navigation
- Focus management
- ARIA attributes

#### Button Component

**Location**: `components/ui/button.tsx`

**Usage**:
```typescript
import { Button } from '@/components/ui/button'

<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**:
- `default`: Primary button style
- `destructive`: For dangerous actions
- `outline`: Secondary button style
- `ghost`: Minimal button style
- `link`: Link-styled button

**Sizes**:
- `sm`: Small button
- `md`: Medium button (default)
- `lg`: Large button
- `icon`: Icon-only button

#### Input Component

**Location**: `components/ui/input.tsx`

**Usage**:
```typescript
import { Input } from '@/components/ui/input'

<Input
  type="text"
  placeholder="Enter value..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Props**:
- All standard HTML input attributes
- Automatically styled with consistent design system

#### Card Component

**Location**: `components/ui/card.tsx`

**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Select Component

**Location**: `components/ui/select.tsx`

**Usage**:
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Complete UI Component List

All available UI components:

- `accordion`: Collapsible content sections
- `alert`: Alert messages and notifications
- `alert-dialog`: Modal confirmation dialogs
- `avatar`: User avatars and profile images
- `badge`: Status badges and labels
- `button`: Buttons and button groups
- `card`: Content cards
- `carousel`: Image/content carousels
- `checkbox`: Checkboxes
- `collapsible`: Collapsible content
- `dialog`: Modal dialogs
- `drawer`: Side drawers
- `form`: Form components with validation
- `input`: Text inputs
- `label`: Form labels
- `navigation-menu`: Complex navigation menus
- `popover`: Popover tooltips
- `progress`: Progress bars
- `radio-group`: Radio button groups
- `scroll-area`: Scrollable areas
- `select`: Dropdown selects
- `separator`: Visual separators
- `sheet`: Side sheets
- `slider`: Range sliders
- `switch`: Toggle switches
- `table`: Data tables
- `tabs`: Tabbed interfaces
- `textarea`: Multi-line text inputs
- `toast`: Toast notifications
- `toggle`: Toggle buttons
- `tooltip`: Tooltips

## Feature Components

### Calculator Components

#### CalculatorButton

**Location**: `components/calculator/calculator-button.tsx`

**Purpose**: Individual calculator button

**Usage**:
```typescript
import { CalculatorButton } from '@/components/calculator/calculator-button'

<CalculatorButton
  value="5"
  onClick={(value) => handleInput(value)}
/>
```

**Props**:
```typescript
interface CalculatorButtonProps {
  value: string
  onClick: (value: string) => void
  variant?: 'default' | 'operator' | 'equals'
  className?: string
}
```

#### CalculatorDisplay

**Location**: `components/calculator/calculator-display.tsx`

**Purpose**: Calculator display screen

**Usage**:
```typescript
import { CalculatorDisplay } from '@/components/calculator/calculator-display'

<CalculatorDisplay value={displayValue} />
```

### Currency Components

#### CryptoConverter

**Location**: `components/currency/crypto-converter.tsx`

**Purpose**: Cryptocurrency conversion tool

**Features**:
- Real-time crypto price fetching
- Multiple currency support
- Input validation
- Error handling

**Usage**:
```typescript
import { CryptoConverter } from '@/components/currency/crypto-converter'

<CryptoConverter />
```

#### FiatConverter

**Location**: `components/currency/fiat-converter.tsx`

**Purpose**: Fiat currency conversion tool

**Features**:
- Exchange rate fetching
- Bi-directional conversion
- Currency selection

**Usage**:
```typescript
import { FiatConverter } from '@/components/currency/fiat-converter'

<FiatConverter />
```

#### CurrencySelect

**Location**: `components/currency/currency-select.tsx`

**Purpose**: Currency selection dropdown

**Usage**:
```typescript
import { CurrencySelect } from '@/components/currency/currency-select'

<CurrencySelect
  value={selectedCurrency}
  onChange={setSelectedCurrency}
  currencies={availableCurrencies}
/>
```

### Hash Components

#### HashInput

**Location**: `components/hash/hash-input.tsx`

**Purpose**: Input field for text to be hashed

#### HashOutput

**Location**: `components/hash/hash-output.tsx`

**Purpose**: Display hashed output with copy functionality

#### HashSelector

**Location**: `components/hash/hash-selector.tsx`

**Purpose**: Select hash algorithm (MD5, SHA-256, etc.)

### Image Components

#### ImagePreview

**Location**: `components/image/image-preview.tsx`

**Purpose**: Preview uploaded images

#### ImageResizer

**Location**: `components/image/image-resizer.tsx`

**Purpose**: Resize and crop images

#### CropOverlay

**Location**: `components/image/crop-overlay.tsx`

**Purpose**: Visual crop overlay for images

## Layout Components

### Navigation

**Location**: `components/navigation.tsx`

**Purpose**: Main application navigation

**Features**:
- Responsive design
- Mobile menu
- Active link highlighting
- Keyboard navigation

**Structure**:
```typescript
export function Navigation() {
  return (
    <nav>
      <div className="container">
        <Logo />
        <NavigationMenu>
          {/* Navigation items */}
        </NavigationMenu>
        <ThemeToggle />
      </div>
    </nav>
  )
}
```

### Footer

**Location**: `components/footer.tsx`

**Purpose**: Application footer

**Features**:
- Links to important pages
- Social media links
- Copyright information

### Theme Components

#### ThemeProvider

**Location**: `components/theme/theme-provider.tsx`

**Purpose**: Provide theme context to application

**Usage**:
```typescript
import { ThemeProvider } from '@/components/theme/theme-provider'

<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
>
  {children}
</ThemeProvider>
```

#### ThemeToggle

**Location**: `components/theme/theme-toggle.tsx`

**Purpose**: Toggle between light/dark themes

**Usage**:
```typescript
import { ThemeToggle } from '@/components/theme/theme-toggle'

<ThemeToggle />
```

### Accessibility Components

#### KeyboardNavDetector

**Location**: `components/accessibility/keyboard-nav-detector.tsx`

**Purpose**: Detect keyboard navigation and apply appropriate focus styles

**Usage**:
```typescript
import { KeyboardNavDetector } from '@/components/accessibility/keyboard-nav-detector'

<KeyboardNavDetector />
```

#### SkipToMain

**Location**: `components/accessibility/skip-to-main.tsx`

**Purpose**: Skip navigation link for screen readers

**Usage**:
```typescript
import { SkipToMain } from '@/components/accessibility/skip-to-main'

<SkipToMain />
```

## Best Practices

### 1. Component Structure

Follow this structure for all components:

```typescript
// 1. Imports
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 2. Type definitions
interface ComponentProps {
  prop1: string
  prop2?: number
}

// 3. Component definition
export function Component({ prop1, prop2 }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Event handlers
  const handleClick = () => {
    // ...
  }

  // 6. Render
  return (
    <div className={cn("component-class")}>
      {/* JSX */}
    </div>
  )
}

// 7. Display name (for debugging)
Component.displayName = 'Component'
```

### 2. Props Interface

Always define TypeScript interfaces for props:

```typescript
// ✅ GOOD - Explicit types
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// ❌ BAD - Any type
function Button(props: any) { }
```

### 3. Component Composition

Favor composition over prop drilling:

```typescript
// ✅ GOOD - Composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ BAD - Prop drilling
<Card title="Title" content="Content" />
```

### 4. Accessibility

Always include accessibility features:

```typescript
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-pressed={isActive}
>
  <span aria-hidden="true">×</span>
</button>
```

### 5. Styling

Use `cn()` utility for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // Allow className override
)}>
```

### 6. Performance

Use React.memo for expensive components:

```typescript
import { memo } from 'react'

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>
})
```

### 7. Error Boundaries

Wrap error-prone components in error boundaries:

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary fallback={<ErrorMessage />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

## Component Storybook

### Setup Storybook (Recommended)

Storybook is recommended for component development and documentation.

**Installation**:
```bash
npx storybook@latest init
```

**Example Story**:
```typescript
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost', 'link']
    }
  }
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default'
  }
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive'
  }
}
```

### Component Development Workflow

1. **Create Component**: Build component in isolation
2. **Write Story**: Create Storybook story
3. **Document**: Add JSDoc comments and usage examples
4. **Test**: Write unit tests
5. **Integrate**: Use in application

## Testing Components

### Unit Tests

Use React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

### Accessibility Tests

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Contributing

When creating new components:

1. Follow the established structure
2. Add TypeScript types
3. Include accessibility features
4. Write unit tests
5. Create Storybook story
6. Document usage
7. Follow naming conventions

## Related Documentation

- [API Documentation](../api/README.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Accessibility Guidelines](../ACCESSIBILITY.md)
- [Testing Guide](../TESTING.md)
