// Popular cryptocurrencies
export const cryptocurrencies = [
  // Major cryptocurrencies
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },

  // DeFi tokens
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "aave", symbol: "AAVE", name: "Aave" },
  { id: "maker", symbol: "MKR", name: "Maker" },

  // Layer 2 and scaling solutions
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "optimism", symbol: "OP", name: "Optimism" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },

  // Stablecoins
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "dai", symbol: "DAI", name: "Dai" },

  // Other notable cryptocurrencies
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "monero", symbol: "XMR", name: "Monero" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos" },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol" },
  { id: "fantom", symbol: "FTM", name: "Fantom" },
] as const;

export type CryptoId = (typeof cryptocurrencies)[number]["id"];
