# API Documentation

This document provides comprehensive documentation for all API utilities and services used in the Astraa application.

## Table of Contents

- [Overview](#overview)
- [External APIs](#external-apis)
- [API Utilities](#api-utilities)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

Astraa integrates with several external APIs to provide real-time data for tools like currency converters and crypto price tracking. All API calls should be made through the centralized utilities in `lib/api.ts`.

## External APIs

### CoinGecko API

**Purpose**: Fetch cryptocurrency prices and market data

**Base URL**: `https://api.coingecko.com/api/v3`

**Authentication**: API Key (should be in environment variables)

**Rate Limits**:
- Free tier: 10-50 calls/minute
- Demo API key: Limited rate

**Documentation**: [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)

### Exchange Rate API

**Purpose**: Fetch fiat currency exchange rates

**Base URL**: `https://api.exchangerate-api.com/v4`

**Authentication**: None (v4 endpoint)

**Rate Limits**:
- Free tier: 1,500 requests/month

**Documentation**: [Exchange Rate API Docs](https://www.exchangerate-api.com/docs)

## API Utilities

### `getCryptoPrice(cryptoId: string, currency: string): Promise<number>`

Fetches the current price of a cryptocurrency in a specified currency.

**Parameters**:
- `cryptoId` (string): The CoinGecko ID of the cryptocurrency (e.g., "bitcoin", "ethereum")
- `currency` (string): The target currency code (e.g., "usd", "eur", "gbp")

**Returns**: `Promise<number>` - The current price

**Example**:
```typescript
import { getCryptoPrice } from '@/lib/api'

const price = await getCryptoPrice('bitcoin', 'usd')
console.log(`Bitcoin price: $${price}`)
```

**Error Handling**:
Currently throws on error. See [Issue #17](https://github.com/puri-adityakumar/astraa/issues/17) for planned improvements.

**Common CoinGecko IDs**:
- Bitcoin: `bitcoin`
- Ethereum: `ethereum`
- Cardano: `cardano`
- Solana: `solana`
- Dogecoin: `dogecoin`

For a complete list, see `lib/crypto-data.ts`.

### `getExchangeRate(from: string, to: string): Promise<number>`

Fetches the exchange rate between two fiat currencies.

**Parameters**:
- `from` (string): Source currency code (e.g., "USD", "EUR")
- `to` (string): Target currency code (e.g., "GBP", "JPY")

**Returns**: `Promise<number>` - The exchange rate

**Example**:
```typescript
import { getExchangeRate } from '@/lib/api'

const rate = await getExchangeRate('USD', 'EUR')
console.log(`1 USD = ${rate} EUR`)

// Convert amount
const amountInUSD = 100
const amountInEUR = amountInUSD * rate
console.log(`$${amountInUSD} = €${amountInEUR}`)
```

**Supported Currencies**:
See `lib/currency-data.ts` for the full list of supported currencies.

## Error Handling

### Current Implementation

⚠️ **Warning**: The current API utilities lack comprehensive error handling. This is a known issue tracked in [Issue #17](https://github.com/puri-adityakumar/astraa/issues/17).

**Current behavior**:
- Network errors: Unhandled promise rejection
- HTTP errors: May throw or return undefined
- Invalid responses: May cause runtime errors

### Recommended Usage Pattern

Until error handling is improved, wrap API calls in try-catch blocks:

```typescript
async function fetchPrice() {
  try {
    const price = await getCryptoPrice('bitcoin', 'usd')
    return price
  } catch (error) {
    console.error('Failed to fetch price:', error)
    return null // or default value
  }
}
```

### Planned Improvements

See [Issue #17](https://github.com/puri-adityakumar/astraa/issues/17) for planned error handling improvements:
- Timeout handling
- Retry logic
- Response validation
- Proper error types
- Graceful degradation

## Best Practices

### 1. Environment Variables

**Never hardcode API keys**. Always use environment variables:

```typescript
// ❌ BAD - Hardcoded API key
const API_KEY = "CG-xxx"

// ✅ GOOD - Environment variable
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY
```

See [Issue #14](https://github.com/puri-adityakumar/astraa/issues/14) for security details.

### 2. Caching

To reduce API calls and improve performance, implement caching:

```typescript
const cache = new Map<string, { value: number; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

async function getCachedPrice(cryptoId: string, currency: string) {
  const key = `${cryptoId}-${currency}`
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value
  }

  const price = await getCryptoPrice(cryptoId, currency)
  cache.set(key, { value: price, timestamp: Date.now() })

  return price
}
```

### 3. Rate Limiting

Implement client-side rate limiting to stay within API limits:

```typescript
import { throttle } from '@/lib/utils'

// Allow only 1 call per second
const throttledGetPrice = throttle(getCryptoPrice, 1000)
```

### 4. Loading States

Always show loading states in UI components:

```typescript
function CryptoPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCryptoPrice('bitcoin', 'usd')
      .then(setPrice)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!price) return <div>No data</div>

  return <div>${price}</div>
}
```

### 5. Input Validation

Validate inputs before making API calls:

```typescript
import { z } from 'zod'

const CryptoIdSchema = z.string().min(1).max(50)
const CurrencySchema = z.string().length(3)

async function getSafePrice(cryptoId: string, currency: string) {
  // Validate inputs
  const validCryptoId = CryptoIdSchema.parse(cryptoId)
  const validCurrency = CurrencySchema.parse(currency)

  return getCryptoPrice(validCryptoId, validCurrency)
}
```

See [Issue #18](https://github.com/puri-adityakumar/astraa/issues/18) for validation improvements.

## Testing

### Unit Tests

Example unit test for API functions:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getCryptoPrice } from '@/lib/api'

describe('getCryptoPrice', () => {
  it('fetches bitcoin price in USD', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bitcoin: { usd: 50000 } })
    })

    const price = await getCryptoPrice('bitcoin', 'usd')
    expect(price).toBe(50000)
  })
})
```

### Integration Tests

Test API integration with real endpoints (use sparingly to avoid rate limits):

```typescript
describe('API Integration', () => {
  it('fetches real data from CoinGecko', async () => {
    const price = await getCryptoPrice('bitcoin', 'usd')
    expect(typeof price).toBe('number')
    expect(price).toBeGreaterThan(0)
  }, 10000) // 10s timeout for real API calls
})
```

## API Response Examples

### CoinGecko Price Response

```json
{
  "bitcoin": {
    "usd": 43250.50,
    "eur": 39800.25,
    "gbp": 34150.75
  }
}
```

### Exchange Rate Response

```json
{
  "base": "USD",
  "date": "2024-01-15",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 148.50,
    "AUD": 1.52
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: `CORS error when fetching from API`
- **Solution**: API calls should be made from server-side or through Next.js API routes

**Issue**: `Rate limit exceeded`
- **Solution**: Implement caching and throttling

**Issue**: `Invalid API key`
- **Solution**: Check environment variables are properly set

**Issue**: `Undefined response data`
- **Solution**: Add proper error handling and response validation

## Future Improvements

Planned improvements tracked in GitHub issues:

- [ ] [#17](https://github.com/puri-adityakumar/astraa/issues/17) - Comprehensive error handling
- [ ] [#14](https://github.com/puri-adityakumar/astraa/issues/14) - Move API keys to environment variables
- [ ] [#18](https://github.com/puri-adityakumar/astraa/issues/18) - Add input validation
- [ ] Response caching layer
- [ ] Request queuing for rate limit management
- [ ] Fallback to alternative APIs
- [ ] Real-time WebSocket connections for live data
- [ ] API usage analytics and monitoring

## Contributing

When adding new API integrations:

1. Add API utilities to `lib/api.ts`
2. Document the API in this file
3. Add TypeScript types for responses
4. Implement error handling
5. Add unit tests
6. Update this documentation

## Related Documentation

- [Security Guidelines](../SECURITY.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Testing Strategy](../TESTING.md)
