# Component Documentation

This directory contains documentation for React components used in Astraa.

## Component Structure

Components are organized following atomic design principles:

```
components/
├── ui/                    # Atoms - Basic UI elements
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── calculator/            # Molecules - Calculator components
│   ├── calculator-display.tsx
│   └── calculator-button.tsx
├── currency/              # Molecules - Currency converter
│   ├── currency-select.tsx
│   └── crypto-converter.tsx
├── hash/                  # Molecules - Hash tool components
├── image/                 # Molecules - Image manipulation
└── ...                    # Other feature-specific components
```

## Component Categories

### UI Components (Atoms)

Basic, reusable UI elements built on shadcn/ui (Radix UI primitives):

- **Button** - Interactive buttons with variants
- **Input** - Text input fields
- **Card** - Container component
- **Dialog** - Modal dialogs
- **Select** - Dropdown selects
- **Tooltip** - Contextual tooltips
- And many more...

[View UI Components Documentation](./ui-components.md)

### Feature Components (Molecules)

Feature-specific components that combine UI atoms:

#### Calculator Components
- `CalculatorDisplay` - Display area for calculations
- `CalculatorButton` - Calculator button with special handling

#### Currency Components
- `CurrencySelect` - Currency selection dropdown
- `CryptoSelect` - Cryptocurrency selection
- `CryptoConverter` - Crypto conversion tool
- `FiatConverter` - Fiat currency conversion

#### Hash Components
- `HashInput` - Input for hash generation
- `HashOutput` - Display hash results
- `HashSelector` - Algorithm selection

#### Image Components
- `ImagePreview` - Image preview area
- `ImageResizer` - Image resizing controls
- `CropOverlay` - Crop tool overlay
- `FormatSelector` - Image format selection

[View Feature Components Documentation](./feature-components.md)

### Utility Components

General-purpose components:

- `BackButton` - Navigation back button
- `Logo` - Application logo
- `ThemeToggle` - Dark/light mode toggle
- `ThemeProvider` - Theme context provider

## Component Guidelines

### Component Structure

```typescript
// components/example-component.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ExampleComponentProps {
  /**
   * The title to display
   */
  title: string
  /**
   * Optional description
   */
  description?: string
  /**
   * Click handler
   */
  onClick?: () => void
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Child elements
   */
  children?: React.ReactNode
}

/**
 * ExampleComponent displays a title and description
 *
 * @example
 * ```tsx
 * <ExampleComponent
 *   title="Hello"
 *   description="World"
 *   onClick={() => console.log('clicked')}
 * />
 * ```
 */
export function ExampleComponent({
  title,
  description,
  onClick,
  className,
  children
}: ExampleComponentProps) {
  return (
    <div className={cn('base-styles', className)} onClick={onClick}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}

ExampleComponent.displayName = 'ExampleComponent'
```

### Best Practices

#### 1. TypeScript Props

Always define prop interfaces:

```typescript
interface ComponentProps {
  required: string
  optional?: number
  callback?: (value: string) => void
}
```

#### 2. Documentation

Document components with JSDoc:

```typescript
/**
 * Brief description of the component
 *
 * @param props - Component props
 * @returns React component
 *
 * @example
 * ```tsx
 * <Component prop="value" />
 * ```
 */
```

#### 3. Prop Naming

- Boolean props: Use `is`, `has`, `can`, or `should` prefix
  - `isLoading`, `hasError`, `canEdit`, `shouldAutoFocus`
- Event handlers: Use `on` prefix
  - `onClick`, `onChange`, `onSubmit`
- Render props: Use `render` prefix
  - `renderHeader`, `renderFooter`

#### 4. Default Props

Use default parameters:

```typescript
function Component({
  size = 'medium',
  variant = 'primary'
}: ComponentProps) {
  // ...
}
```

#### 5. Component Composition

Favor composition over props:

```typescript
// Good
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Avoid
<Card
  title="Title"
  content="Content"
  hasHeader={true}
/>
```

#### 6. Styling

Use Tailwind CSS with `cn` utility:

```typescript
import { cn } from '@/lib/utils'

function Component({ className }: { className?: string }) {
  return (
    <div className={cn(
      'base-class',
      'conditional-class',
      className
    )}>
      {/* ... */}
    </div>
  )
}
```

#### 7. Performance

Optimize with React best practices:

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// Memoize components
const MemoizedComponent = React.memo(Component)
```

#### 8. Error Boundaries

Wrap components with error boundaries for error handling:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

#### 9. Accessibility

Follow accessibility best practices:

```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  role="button"
  tabIndex={0}
>
  <X className="h-4 w-4" />
</button>
```

#### 10. Testing

Write tests for components:

```typescript
import { render, screen } from '@testing-library/react'
import { Component } from './component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Component Patterns

### Controlled Components

```typescript
function ControlledInput() {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

### Uncontrolled Components

```typescript
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log(inputRef.current?.value)
  }

  return <input ref={inputRef} />
}
```

### Compound Components

```typescript
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('tab1')

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>
}

export function TabsTrigger({ value, children }: {
  value: string
  children: React.ReactNode
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  return (
    <button
      role="tab"
      aria-selected={context.activeTab === value}
      onClick={() => context.setActiveTab(value)}
    >
      {children}
    </button>
  )
}
```

### Render Props

```typescript
interface DataProviderProps<T> {
  data: T[]
  children: (data: T[]) => React.ReactNode
}

function DataProvider<T>({ data, children }: DataProviderProps<T>) {
  return <>{children(data)}</>
}

// Usage
<DataProvider data={items}>
  {(items) => (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  )}
</DataProvider>
```

### Higher-Order Components (HOC)

```typescript
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent({
    isLoading,
    ...props
  }: P & { isLoading: boolean }) {
    if (isLoading) return <Spinner />
    return <Component {...(props as P)} />
  }
}

// Usage
const ComponentWithLoading = withLoading(MyComponent)
```

## Custom Hooks

Document custom hooks:

```typescript
/**
 * Custom hook for managing local storage state
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Implementation
}
```

## Component Documentation Template

```markdown
# ComponentName

Brief description of what the component does.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `required` | `string` | - | Required prop description |
| `optional` | `number` | `0` | Optional prop description |

## Examples

### Basic Usage

\`\`\`tsx
<ComponentName required="value" />
\`\`\`

### Advanced Usage

\`\`\`tsx
<ComponentName
  required="value"
  optional={42}
  onEvent={() => console.log('event')}
/>
\`\`\`

## Accessibility

- ARIA labels included
- Keyboard navigation supported
- Screen reader compatible

## Related Components

- [OtherComponent](./other-component.md)
- [RelatedComponent](./related-component.md)
```

## Storybook Setup (Future)

To add Storybook for component documentation:

```bash
npx storybook@latest init
```

Create stories:

```typescript
// component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Component } from './component'

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Component>

export const Default: Story = {
  args: {
    title: 'Default Title',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'With Description',
    description: 'This is a description',
  },
}
```

## Contributing

When adding new components:

1. Follow the component structure guidelines
2. Add TypeScript prop types
3. Include JSDoc documentation
4. Add usage examples
5. Ensure accessibility
6. Write tests
7. Update this documentation

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
