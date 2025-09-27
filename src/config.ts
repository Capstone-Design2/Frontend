export const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query'

export const POLLING_DEFAULTS = {
  intervalMs: 15_000,
  backoffFactor: 2,
  maxIntervalMs: 120_000,
}

export const MINI_TICKERS = [
  { key: 'KOSPI', type: 'note', symbol: '^KS11', note: 'Not directly supported by Alpha Vantage' },
  { key: 'KOSDAQ', type: 'note', symbol: '^KQ11', note: 'Not directly supported by Alpha Vantage' },
  { key: 'Gold', type: 'equity', symbol: 'GLD' },
  { key: 'USD/KRW', type: 'fx', symbol: 'USD/KRW' },
  { key: 'DXY', type: 'note', symbol: 'DXY', note: 'Dollar Index not directly supported' },
] as const

export type MiniTickerKey = (typeof MINI_TICKERS)[number]['key']
