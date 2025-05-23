// Currency codes and names
export const currencies = [
  // Major currencies
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  
  // Asian currencies
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'THB', name: 'Thai Baht' },
  
  // European currencies
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Złoty' },
  { code: 'CZK', name: 'Czech Koruna' },
  
  // Other major currencies
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' }
] as const

export type CurrencyCode = typeof currencies[number]['code']