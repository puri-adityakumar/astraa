const COINGECKO_API_KEY = "CG-nrVyRWCGSZozXJpLvsBAmQo5"
const COINGECKO_API = "https://api.coingecko.com/api/v3"

export async function getCryptoPrice(cryptoId: string, currency: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=${currency.toLowerCase()}`,
      {
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const price = data[cryptoId]?.[currency.toLowerCase()]

    if (price === undefined) {
      // It might not be an error if the coin just doesn't exist, but for our app it's a failure to get price
      console.warn(`Price not found for ${cryptoId} in ${currency}`)
      return null
    }

    return price
  } catch (error) {
    console.error(`Failed to fetch crypto price for ${cryptoId}:`, error)
    return null
  }
}

export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  try {
    // Using the newer FawazAhmed0 API which is more reliable and free
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from.toLowerCase()}.json`
    )

    if (!response.ok) {
        // Try fallback immediately if primary fails
        throw new Error('Primary API failed')
    }

    const data = await response.json()
    // The API structure is { date: "...", [from]: { [to]: rate, ... } }
    const rate = data[from.toLowerCase()]?.[to.toLowerCase()]
    
    if (rate === undefined) {
         throw new Error(`Rate not found for ${from} to ${to}`)
    }
    
    return rate

  } catch (error) {
    console.warn("Primary Currency API / Rate extraction failed, trying fallback:", error)
    
    // Fallback to the old API if the primary one fails
    try {
      const backupResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
      if (!backupResponse.ok) {
          throw new Error(`Backup API failed: ${backupResponse.status}`)
      }
      const backupData = await backupResponse.json()
      const backupRate = backupData.rates[to]
      
      if (backupRate === undefined) {
          return null
      }
      
      return backupRate
    } catch (backupError) {
      console.error("All Currency API attempts failed:", backupError)
      return null
    }
  }
}