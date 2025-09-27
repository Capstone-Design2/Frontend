export interface BacktestRun {
  id?: string
  strategyId?: string
  symbol: string
  from?: string
  to?: string
  fee?: number
  slippage?: number
}

export interface KPI { totalReturn: number; cagr: number; sharpe: number; mdd: number }

export interface Trade { date: number; side: 'buy'|'sell'; price: number; qty: number; pl?: number; reason?: string }

export interface BacktestResult {
  id: string
  params: BacktestRun
  kpis: KPI
  equityCurve: { time: number; value: number }[]
  trades: Trade[]
}
