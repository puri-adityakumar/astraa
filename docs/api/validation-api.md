# Validation API

The Validation API provides comprehensive input validation and sanitization using Zod schemas.

## Schemas

### User Preferences Schema

```typescript
import { userPreferencesSchema } from '@/lib/core/validation'

const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  accessibility: accessibilitySettingsSchema,
  privacy: privacySettingsSchema,
  shortcuts: z.record(z.string()).default({}),
  toolDefaults: z.record(z.any()).default({})
})
```

### Accessibility Settings Schema

```typescript
const accessibilitySettingsSchema = z.object({
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  screenReader: z.boolean().default(false)
})
```

### Privacy Settings Schema

```typescript
const privacySettingsSchema = z.object({
  analytics: z.boolean().default(false),
  errorReporting: z.boolean().default(true),
  cloudSync: z.boolean().default(false),
  dataRetention: z.number().min(1).max(365).default(30)
})
```

### Tool Settings Schema

```typescript
const toolSettingsSchema = z.object({
  id: z.string(),
  preferences: z.record(z.any()).default({}),
  shortcuts: z.record(z.string()).default({}),
  lastUsed: z.date().default(() => new Date()),
  usageCount: z.number().min(0).default(0)
})
```

### File Validation Schemas

```typescript
const fileValidationSchema = z.object({
  name: z.string().min(1),
  size: z.number().min(0).max(10 * 1024 * 1024), // 10MB max
  type: z.string().min(1)
})

const imageFileSchema = fileValidationSchema.extend({
  type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/)
})

const textFileSchema = fileValidationSchema.extend({
  type: z.string().regex(/^text\/|application\/(json|xml)$/)
})
```

### Storage Options Schema

```typescript
const storageOptionsSchema = z.object({
  encrypt: z.boolean().optional(),
  compress: z.boolean().optional(),
  ttl: z.number().positive().optional()
})
```

## Validation Functions

### validateData

Validates data against a Zod schema and throws `ValidationError` on failure.

```typescript
function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fieldName?: string
): T
```

**Example:**

```typescript
import { validateData, userPreferencesSchema } from '@/lib/core/validation'

try {
  const validPreferences = validateData(
    userPreferencesSchema,
    userInput,
    'preferences'
  )
  console.log('Valid preferences:', validPreferences)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`)
  }
}
```

### safeValidateData

Safely validates data and returns result with success flag instead of throwing.

```typescript
function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError }
```

**Example:**

```typescript
import { safeValidateData, userPreferencesSchema } from '@/lib/core/validation'

const result = safeValidateData(userPreferencesSchema, userInput)

if (result.success) {
  console.log('Valid data:', result.data)
} else {
  console.error('Validation error:', result.error.message)
}
```

## Sanitization Functions

### sanitizeString

Sanitizes string input to prevent XSS attacks.

```typescript
function sanitizeString(input: string): string
```

**Removes:**
- Angle brackets (`<>`)
- `javascript:` protocol
- Event handlers (`onclick=`, etc.)
- Trims whitespace

**Example:**

```typescript
import { sanitizeString } from '@/lib/core/validation'

const userInput = '<script>alert("XSS")</script>Hello'
const safe = sanitizeString(userInput)
// Result: 'scriptalert("XSS")/scriptHello'
```

**Note**: This is basic sanitization. For HTML content, use a proper sanitization library like DOMPurify.

### sanitizeUserInput

Validates and sanitizes user input with length limits.

```typescript
function sanitizeUserInput(input: unknown): string
```

**Features:**
- Ensures input is a string
- Maximum length: 10,000 characters
- Applies XSS sanitization
- Throws `ValidationError` on invalid input

**Example:**

```typescript
import { sanitizeUserInput } from '@/lib/core/validation'

try {
  const safeInput = sanitizeUserInput(userInput)
  // Use safeInput safely
} catch (error) {
  console.error('Invalid input:', error.message)
}
```

### validateFileUpload

Validates file uploads with type and size restrictions.

```typescript
function validateFileUpload(
  file: File,
  allowedTypes?: string[],
  maxSize?: number
): void
```

**Parameters:**
- `file`: File object to validate
- `allowedTypes`: Array of allowed MIME types (optional)
- `maxSize`: Maximum file size in bytes (default: 10MB)

**Example:**

```typescript
import { validateFileUpload } from '@/lib/core/validation'

const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

try {
  validateFileUpload(
    file,
    ['image/jpeg', 'image/png', 'image/gif'],
    5 * 1024 * 1024 // 5MB
  )
  // File is valid, proceed with upload
} catch (error) {
  console.error('File validation failed:', error.message)
}
```

## Custom Validation Error

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  )
}
```

**Properties:**
- `message`: Error description
- `field`: Field name that failed validation
- `code`: Zod error code
- `name`: Always "ValidationError"

**Example:**

```typescript
import { ValidationError } from '@/lib/core/validation'

function validateAge(age: number): void {
  if (age < 0 || age > 150) {
    throw new ValidationError(
      'Age must be between 0 and 150',
      'age',
      'invalid_range'
    )
  }
}

try {
  validateAge(-5)
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.field)    // 'age'
    console.log(error.code)     // 'invalid_range'
    console.log(error.message)  // 'Age must be between 0 and 150'
  }
}
```

## Usage Patterns

### Form Validation

```typescript
import { validateData, userPreferencesSchema } from '@/lib/core/validation'

function handleFormSubmit(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())

  try {
    const validData = validateData(userPreferencesSchema, rawData)
    // Submit valid data
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show error to user
      showError(error.field, error.message)
    }
  }
}
```

### API Input Validation

```typescript
import { validateData, safeValidateData } from '@/lib/core/validation'

export async function POST(request: Request) {
  const body = await request.json()

  const result = safeValidateData(requestSchema, body)

  if (!result.success) {
    return Response.json(
      { error: result.error.message },
      { status: 400 }
    )
  }

  // Process valid data
  return Response.json({ success: true })
}
```

### File Upload Validation

```typescript
import { validateFileUpload, imageFileSchema } from '@/lib/core/validation'

async function handleImageUpload(file: File) {
  try {
    // Validate file properties
    validateFileUpload(
      file,
      ['image/jpeg', 'image/png', 'image/webp'],
      5 * 1024 * 1024
    )

    // Additional schema validation
    validateData(imageFileSchema, {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // File is valid, process it
    const url = await uploadFile(file)
    return url
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`)
  }
}
```

## Creating Custom Schemas

```typescript
import { z } from 'zod'
import { validateData } from '@/lib/core/validation'

// Define custom schema
const calculatorSettingsSchema = z.object({
  precision: z.number().min(0).max(15).default(2),
  angleUnit: z.enum(['deg', 'rad']).default('deg'),
  notation: z.enum(['standard', 'scientific', 'engineering']).default('standard')
})

// Use in application
function updateCalculatorSettings(input: unknown) {
  const settings = validateData(calculatorSettingsSchema, input)
  // Apply settings
}
```

## Best Practices

1. **Always validate external input**: Never trust user input or API responses
2. **Use specific schemas**: Create dedicated schemas for each data type
3. **Provide helpful error messages**: Include field names and clear descriptions
4. **Sanitize before display**: Always sanitize user input before rendering
5. **Validate files thoroughly**: Check both metadata and content when possible
6. **Use safe validation for user-facing errors**: Use `safeValidateData` in UI code
7. **Log validation failures**: Track validation errors for debugging

## Security Considerations

1. **XSS Prevention**: Always sanitize user input before rendering
2. **File Upload Security**: Validate file types, sizes, and content
3. **Input Length Limits**: Prevent DoS attacks with size limits
4. **Schema Validation**: Use strict schemas to prevent injection attacks
5. **Error Messages**: Don't expose sensitive information in error messages

## Testing

```typescript
import { validateData, sanitizeString, ValidationError } from '@/lib/core/validation'

describe('Validation', () => {
  it('should validate correct data', () => {
    const data = { theme: 'dark', language: 'en' }
    expect(() => validateData(userPreferencesSchema, data)).not.toThrow()
  })

  it('should reject invalid data', () => {
    const data = { theme: 'invalid' }
    expect(() => validateData(userPreferencesSchema, data)).toThrow(ValidationError)
  })

  it('should sanitize XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>'
    const safe = sanitizeString(malicious)
    expect(safe).not.toContain('<script>')
  })
})
```

## See Also

- [Storage API](./storage-api.md)
- [Settings API](./settings-api.md)
- [Zod Documentation](https://zod.dev)
