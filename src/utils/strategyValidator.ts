const ALLOWED_OPS = [
  'is_above',
  'is_below',
  'is_above_or_equal',
  'is_below_or_equal',
  'equals',
  'not_equals',
  'crosses_above',
  'crosses_below',
  'between',
  'outside',
  'percent_change_above',
  'percent_change_below',
  'consecutive_above',
  'consecutive_below',
]

const NEEDS_INDICATOR3 = ['between', 'outside']
const NEEDS_LOOKBACK = [
  'percent_change_above',
  'percent_change_below',
  'consecutive_above',
  'consecutive_below',
]

export function validateStrategy(s: any): boolean {
  if (!s) return false

  // strategy_name
  if (typeof s.strategy_name !== 'string' || !s.strategy_name.trim()) return false

  // trade_settings
  const p = s.trade_settings?.order_amount_percent
  if (typeof p !== 'number' || p <= 0 || p > 100) return false

  // indicators
  if (!Array.isArray(s.indicators) || s.indicators.length === 0) return false
  for (const ind of s.indicators) {
    if (typeof ind.name !== 'string' || !ind.name.trim()) return false

    if (typeof ind.type !== 'string' || !ind.type.trim()) return false

    if (typeof ind.params !== 'object' || ind.params == null) return false
  }

  const checkGroup = (g: any): boolean => {
    if (!g || typeof g !== 'object') return false
    const key = g.all ? 'all' : g.any ? 'any' : null
    if (!key) return false
    const arr = g[key]
    if (!Array.isArray(arr) || arr.length === 0) return false

    for (const c of arr) {
      if (!c) return false

      // indicator1
      if (typeof c.indicator1 !== 'string' || !c.indicator1.trim()) return false

      // operator
      if (!ALLOWED_OPS.includes(c.operator)) return false

      // indicator2
      if (typeof c.indicator2 !== 'string' || !c.indicator2.trim()) return false

      // indicator3
      if (NEEDS_INDICATOR3.includes(c.operator)) {
        if (typeof c.indicator3 !== 'string' || !c.indicator3.trim()) return false
      }

      // lookback_period
      if (NEEDS_LOOKBACK.includes(c.operator)) {
        if (
          typeof c.lookback_period !== 'number' ||
          !Number.isFinite(c.lookback_period) ||
          c.lookback_period <= 0
        ) {
          return false
        }
      }
    }
    return true
  }

  if (!checkGroup(s.buy_conditions)) return false
  if (!checkGroup(s.sell_conditions)) return false

  return true
}
