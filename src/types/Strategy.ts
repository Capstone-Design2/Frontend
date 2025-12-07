export interface Strategy {
  strategy_id?: number
  user_id?: number
  strategy_name: string
  description?: string | null
  rules: StrategyRules
}

export interface StrategyRules {
  strategy_name: string
  indicators: Indicator[]
  buy_conditions: ConditionGroupValue
  sell_conditions: ConditionGroupValue
  trade_settings: {
    order_amount_percent: number
  }
}

export type IndicatorType = string

export interface Indicator {
  name: string
  type: IndicatorType
  params: Record<string, any>
}

export type Operator =
  | 'is_above'
  | 'is_below'
  | 'is_above_or_equal'
  | 'is_below_or_equal'
  | 'equals'
  | 'not_equals'
  | 'crosses_above'
  | 'crosses_below'
  | 'between'
  | 'outside'
  | 'percent_change_above'
  | 'percent_change_below'
  | 'consecutive_above'
  | 'consecutive_below'

export interface Condition {
  indicator1: string
  operator: Operator
  indicator2: string
  indicator3?: string
  lookback_period?: number
}

export type ConditionGroupValue =
  | { all: Condition[]; any?: never }
  | { any: Condition[]; all?: never }

export interface StrategyChatRequest {
  content: string
}

export interface ConditionDetail {
  filled: boolean
  description: string | null
}

export interface ConditionsState {
  indicators: ConditionDetail
  buy_conditions: ConditionDetail
  sell_conditions: ConditionDetail
  trade_settings: ConditionDetail
}

export interface StrategyChatResponse {
  session_id: string
  status: 'chat' | 'in_progress' | 'complete'
  reply: string
  conditions: ConditionsState
  strategy: any | null
}

// 채팅 메시지 형태 정의
export interface StrategyChatMessage {
  type: 'user' | 'bot' | 'strategy'
  text?: string
  typing?: boolean
  // LLM status
  status?: 'chat' | 'in_progress' | 'complete'
  // 최종 전략(json)
  strategy?: any
  // 조건 상태
  conditions?: ConditionsState
}
