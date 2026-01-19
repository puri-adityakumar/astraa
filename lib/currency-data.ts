// Currency codes and names
export const currencies = [
  // Major currencies
  { code: "USD", name: "US Dollar", countryCode: "us" },
  { code: "EUR", name: "Euro", countryCode: "eu" },
  { code: "GBP", name: "British Pound", countryCode: "gb" },
  { code: "JPY", name: "Japanese Yen", countryCode: "jp" },
  { code: "AUD", name: "Australian Dollar", countryCode: "au" },
  { code: "CAD", name: "Canadian Dollar", countryCode: "ca" },
  { code: "CHF", name: "Swiss Franc", countryCode: "ch" },
  { code: "CNY", name: "Chinese Yuan", countryCode: "cn" },
  { code: "INR", name: "Indian Rupee", countryCode: "in" },
  { code: "NZD", name: "New Zealand Dollar", countryCode: "nz" },

  // Asian currencies
  { code: "SGD", name: "Singapore Dollar", countryCode: "sg" },
  { code: "HKD", name: "Hong Kong Dollar", countryCode: "hk" },
  { code: "KRW", name: "South Korean Won", countryCode: "kr" },
  { code: "MYR", name: "Malaysian Ringgit", countryCode: "my" },
  { code: "THB", name: "Thai Baht", countryCode: "th" },

  // European currencies
  { code: "SEK", name: "Swedish Krona", countryCode: "se" },
  { code: "NOK", name: "Norwegian Krone", countryCode: "no" },
  { code: "DKK", name: "Danish Krone", countryCode: "dk" },
  { code: "PLN", name: "Polish Złoty", countryCode: "pl" },
  { code: "CZK", name: "Czech Koruna", countryCode: "cz" },

  // Other major currencies
  { code: "BRL", name: "Brazilian Real", countryCode: "br" },
  { code: "ZAR", name: "South African Rand", countryCode: "za" },
  { code: "MXN", name: "Mexican Peso", countryCode: "mx" },
  { code: "AED", name: "UAE Dirham", countryCode: "ae" },
  { code: "SAR", name: "Saudi Riyal", countryCode: "sa" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];
