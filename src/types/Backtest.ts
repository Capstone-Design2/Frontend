import type { StrategyRules } from './Strategy'

// ===== 백테스팅 실행 요청 =====
export interface BacktestRunRequest {
  ticker: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  strategy_definition: StrategyRules
}

// ===== 백테스팅 결과 =====
export interface BacktestResult {
  result_id: number
  job_id: number
  user_id: number
  max_drawdown: number | null
  cagr: number | null
  sharpe: number | null
  kpi: BacktestKPI
  equity_curve: EquityCurvePoint[]
  created_at: string
}

export interface BacktestKPI {
  strategy_name: string
  total_return: number
  win_rate: number
  profit_factor: number
  completed_trades: number
  buy_count: number
  sell_count: number
  total_actions: number
  final_portfolio_value: number
  initial_cash: number
  cagr: number
  sharpe_ratio: number
  sortino_ratio: number
  var_95: number
  cvar_95: number
  drawdown_series: DrawdownPoint[]
  position_history: PositionPoint[]
  trades: BacktestTrade[]
}

export interface EquityCurvePoint {
  timestamp: string
  value: number
}

export interface DrawdownPoint {
  timestamp: string
  drawdown: number
}

export interface PositionPoint {
  timestamp: string
  has_position: boolean
  quantity: number
  entry_price: number
}

export interface BacktestTrade {
  type: 'buy' | 'sell'
  date: string
  price: number
  quantity: number
  profit: number
}

// ===== 백테스트 Job =====
export interface BacktestJob {
  job_id: number
  user_id: number
  strategy_id: number
  ticker_id: number
  start_date: string
  end_date: string
  timeframe: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  completed_at: string | null
  created_at: string
}

// ===== 레거시 타입 (하위 호환성 유지) =====
export interface BacktestRun {
  id?: string
  strategyId?: string
  symbol: string
  from?: string
  to?: string
  fee?: number
  slippage?: number
}

export interface KPI {
  totalReturn: number
  cagr: number
  sharpe: number
  mdd: number
}

export interface Trade {
  date: number
  side: 'buy' | 'sell'
  price: number
  qty: number
  pl?: number
  reason?: string
}
