export interface Strategy {
  schemaVersion: 1
  id?: string
  name: string
  description?: string
  indicators: {
    sma?: { enabled: boolean; period: number }
    ema?: { enabled: boolean; period: number }
    rsi?: { enabled: boolean; period: number }
    macd?: { enabled: boolean; fast: number; slow: number; signal: number }
    bbands?: { enabled: boolean; period: number; dev: number }
  }
  rules: { buy: string[]; sell: string[]; stopLoss?: number; takeProfit?: number }
  positionSizing: { mode: 'fixed'|'percent'; value: number }
}
