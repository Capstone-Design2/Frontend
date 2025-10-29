export interface Strategy {
  schemaVersion?: 1
  strategy_id?: number | string
  strategy_name: string
  description?: string
  indicators: {
    sma?: { enabled: boolean; period: number }
    ema?: { enabled: boolean; period: number }
    rsi?: { enabled: boolean; period: number }
    macd?: { enabled: boolean; fast: number; slow: number; signal: number }
    bbands?: { enabled: boolean; period: number; dev: number }
  }
  rules: { buy: string[]; sell: string[]; stop_loss?: number; take_profit?: number }
  position_sizing: { mode: 'fixed'|'percent'; value: number }
}