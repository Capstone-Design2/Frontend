const ALLOWED_TYPES = ['SMA', 'EMA', 'RSI', 'MACD', 'BBANDS', 'ATR', 'STOCH']
const ALLOWED_OPS = ['is_above', 'is_below', 'crosses_above', 'crosses_below']

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
    if (!ALLOWED_TYPES.includes(ind.type)) return false
    if (typeof ind.params !== 'object' || ind.params == null) return false
  }

  // conditions helper
  const checkGroup = (g: any): boolean => {
    if (!g || typeof g !== 'object') return false
    const key = g.all ? 'all' : g.any ? 'any' : null
    if (!key) return false
    const arr = g[key]
    if (!Array.isArray(arr) || arr.length === 0) return false
    for (const c of arr) {
      if (!c) return false
      if (typeof c.indicator1 !== 'string' || !c.indicator1.trim()) return false
      if (!ALLOWED_OPS.includes(c.operator)) return false
      if (typeof c.indicator2 !== 'string' || !c.indicator2.trim()) return false
    }
    return true
  }

  if (!checkGroup(s.buy_conditions)) return false
  if (!checkGroup(s.sell_conditions)) return false

  return true
}
