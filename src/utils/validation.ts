import { z } from 'zod'

export const userSchema = z.object({ id: z.string(), email: z.string().email(), username: z.string() })

export const STRATEGY_SCHEMA_VERSION = 1 as const

const indicatorToggle = z.object({ enabled: z.boolean() })

export const strategySchema = z.object({
  schemaVersion: z.literal(STRATEGY_SCHEMA_VERSION),
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  indicators: z.object({
    sma: indicatorToggle.extend({ period: z.number().min(2).max(400) }).optional(),
    ema: indicatorToggle.extend({ period: z.number().min(2).max(400) }).optional(),
    rsi: indicatorToggle.extend({ period: z.number().min(2).max(400) }).optional(),
    macd: indicatorToggle.extend({ fast: z.number().min(1), slow: z.number().min(2), signal: z.number().min(1) }).optional(),
    bbands: indicatorToggle.extend({ period: z.number().min(2), dev: z.number().min(0.1) }).optional(),
  }),
  rules: z.object({
    buy: z.array(z.string()).default([]),
    sell: z.array(z.string()).default([]),
    stopLoss: z.number().min(0).optional(),
    takeProfit: z.number().min(0).optional(),
  }),
  positionSizing: z.object({ mode: z.enum(['fixed','percent']), value: z.number().min(0) }),
})

export type StrategyInput = z.infer<typeof strategySchema>

export function migrateStrategy(input: any): StrategyInput {
  const withVersion = { schemaVersion: STRATEGY_SCHEMA_VERSION, rules: { buy: [], sell: [] }, positionSizing: { mode: 'fixed', value: 0 }, indicators: {}, ...input }
  return strategySchema.parse(withVersion)
}
