import { STRATEGY_SCHEMA_VERSION } from '@/utils/validation'
import type { Strategy, StrategyIndicators, StrategyPositionSizing, StrategyRules } from '@/types/Strategy'

export type StrategyFormModel = Strategy & {
  indicators: StrategyIndicators
  rules: StrategyRules
  positionSizing: StrategyPositionSizing
}

const DEFAULT_POSITION_SIZING: StrategyPositionSizing = { mode: 'fixed', value: 0 }

const clone = <T>(value: T): T => (value ? JSON.parse(JSON.stringify(value)) : value)

export function toStrategyFormModel(strategy?: Partial<Strategy> | null): StrategyFormModel {
  const indicators = (strategy?.indicators as StrategyIndicators | undefined) ?? {}
  const rules = (strategy?.rules as StrategyRules | undefined) ?? {}
  const rawPositionSizing =
    (strategy?.positionSizing as StrategyPositionSizing | undefined) ??
    (strategy?.position_sizing as StrategyPositionSizing | undefined) ??
    DEFAULT_POSITION_SIZING

  return {
    schemaVersion: strategy?.schemaVersion ?? STRATEGY_SCHEMA_VERSION,
    strategy_id: strategy?.strategy_id,
    strategy_name: strategy?.strategy_name ?? '',
    description: strategy?.description ?? '',
    indicators: clone(indicators) ?? {},
    rules: {
      buy: clone(rules.buy) ?? [],
      sell: clone(rules.sell) ?? [],
      stop_loss: rules.stop_loss,
      take_profit: rules.take_profit,
      buy_condition: clone(rules.buy_condition) ?? rules.buy_condition,
      sell_condition: clone(rules.sell_condition) ?? rules.sell_condition,
    },
    positionSizing: clone(rawPositionSizing) ?? { ...DEFAULT_POSITION_SIZING },
  }
}

export type StrategyUpdatePayload = Pick<Strategy, 'strategy_name' | 'description'>

export function toStrategyUpdatePayload(form: StrategyFormModel): StrategyUpdatePayload {
  return {
    strategy_name: form.strategy_name,
    description: form.description ?? '',
  }
}
