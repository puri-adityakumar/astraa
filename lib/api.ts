const COINGECKO_API_KEY = "CG-nrVyRWCGSZozXJpLvsBAmQo5"
const COINGECKO_API = "https://api.coingecko.com/api/v3"

export async function getCryptoPrice(cryptoId: string, currency: string) {
  const response = await fetch(
    `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=${currency.toLowerCase()}&x_cg_demo_api_key=${COINGECKO_API_KEY}`
  )
  const data = await response.json()
  return data[cryptoId][currency.toLowerCase()]
}

export async function getExchangeRate(from: string, to: string) {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
  const data = await response.json()
  return data.rates[to]
}