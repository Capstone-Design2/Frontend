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
  position_sizing: { mode: 'fixed' | 'percent'; value: number }
}

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
