/**
 * Browser-side data helpers. Provider credentials stay on the server: crypto
 * prices come from the same-origin /api/crypto-price route, which reads the
 * server-only CoinGecko key and answers only catalog pairs.
 */
export async function getCryptoPrice(cryptoId: string, currency: string): Promise<number | null> {
  try {
    const query = new URLSearchParams({ crypto: cryptoId, currency })
    const response = await fetch(`/api/crypto-price?${query.toString()}`)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = (await response.json()) as { price?: unknown }
    const price = data.price

    if (typeof price !== "number" || !Number.isFinite(price)) {
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