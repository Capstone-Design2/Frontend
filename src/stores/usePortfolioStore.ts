import { defineStore } from 'pinia'

export interface Position {
  symbol: string
  quantity: number
  averagePrice: number
}

export interface Trade {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number
  timestamp: number
  realizedPnl?: number
}

interface PortfolioState {
  version: number
  cash: number
  positions: Position[]
  tradeHistory: Trade[]
  // 실시간/최근가
  markPrices: Record<string, number>
}

const KEY = 'portfolio.v2'
const VERSION = 2

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

function isFiniteNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x)
}

function isFinitePositive(n: unknown) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0
}

function isPosition(x: unknown): x is Position {
  if (!isNonNullObject(x)) return false
  return (
    typeof x.symbol === 'string' && isFiniteNumber(x.quantity) && isFiniteNumber(x.averagePrice)
  )
}

function isTrade(x: unknown): x is Trade {
  if (!isNonNullObject(x)) return false
  return (
    typeof x.id === 'string' &&
    (x.type === 'buy' || x.type === 'sell') &&
    typeof x.symbol === 'string' &&
    isFiniteNumber(x.quantity) &&
    isFiniteNumber(x.price) &&
    isFiniteNumber(x.timestamp) &&
    (x.realizedPnl === undefined || isFiniteNumber(x.realizedPnl))
  )
}

function isNonNullObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isMarkPrices(x: unknown): x is Record<string, number> {
  if (!isNonNullObject(x)) return false
  // 키: string, 값: finite number
  return Object.values(x).every((v) => isFiniteNumber(v))
}

function typeGuardRestore(x: unknown): x is PortfolioState {
  if (!isNonNullObject(x)) return false

  const version = x.version
  const cash = x.cash
  const positions = x.positions
  const tradeHistory = x.tradeHistory
  const markPrices = x.markPrices

  return (
    isFiniteNumber(version) &&
    isFiniteNumber(cash) &&
    Array.isArray(positions) &&
    positions.every(isPosition) &&
    Array.isArray(tradeHistory) &&
    tradeHistory.every(isTrade) &&
    isMarkPrices(markPrices)
  )
}

export const usePortfolioStore = defineStore('portfolio', {
  state: (): PortfolioState => ({
    version: VERSION,
    cash: 100_000, // 초기 자본금
    positions: [],
    tradeHistory: [],
    markPrices: {},
  }),

  getters: {
    // 현재가(markPrices) 기반 평가금액 (없으면 평균단가로 대체)
    portfolioValue(state): number {
      return round2(
        state.positions.reduce((sum, p) => {
          const mp = state.markPrices[p.symbol]
          const price = typeof mp === 'number' && Number.isFinite(mp) ? mp : p.averagePrice
          return sum + p.quantity * price
        }, 0),
      )
    },

    // 총자산 = 현금 + 보유자산 평가금액
    totalValue(): number {
      return round2(this.cash + this.portfolioValue)
    },

    // 평가손익(미실현) = Σ qty * (markPrice - avgPrice)
    unrealizedPnl(state): number {
      return round2(
        state.positions.reduce((sum, p) => {
          const mp = state.markPrices[p.symbol]
          if (typeof mp !== 'number' || !Number.isFinite(mp)) return sum
          return sum + p.quantity * (mp - p.averagePrice)
        }, 0),
      )
    },

    // 실현손익 누적 (tradeHistory에서 sell만 합산)
    realizedPnl(state): number {
      return round2(
        state.tradeHistory.reduce((sum, t) => {
          if (t.type === 'sell' && typeof t.realizedPnl === 'number') return sum + t.realizedPnl
          return sum
        }, 0),
      )
    },
  },

  actions: {
    restore() {
      try {
        const raw = localStorage.getItem(KEY)
        if (!raw) return
        const parsed: unknown = JSON.parse(raw)
        if (!typeGuardRestore(parsed) || parsed.version !== VERSION) {
          this.reset()
          return
        }
        this.$state = parsed
      } catch {
        this.reset()
      }
    },

    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.$state))
    },

    reset() {
      this.$patch({
        version: VERSION,
        cash: 100_000,
        positions: [],
        tradeHistory: [],
        markPrices: {},
      })
      this.persist()
    },

    // 외부(시세/차트 스토어)에서 마크프라이스 반영
    updateMarkPrice(symbol: string, price: number) {
      if (!Number.isFinite(price)) return
      this.markPrices[symbol] = price
    },
    bulkUpdateMarkPrices(map: Record<string, number>) {
      for (const [sym, px] of Object.entries(map)) {
        if (Number.isFinite(px)) this.markPrices[sym] = px
      }
    },

    executeBuy(symbol: string, quantity: number, price: number) {
      if (!isFinitePositive(quantity) || !isFinitePositive(price)) {
        throw new Error('Quantity and price must be positive numbers.')
      }
      const cost = round2(quantity * price)
      if (this.cash < cost) {
        throw new Error('Not enough cash to execute buy order.')
      }

      this.cash = round2(this.cash - cost)

      const pos = this.positions.find((p) => p.symbol === symbol)
      if (pos) {
        const totalCost = round2(pos.averagePrice * pos.quantity + cost)
        const totalQty = pos.quantity + quantity
        pos.quantity = totalQty
        pos.averagePrice = round2(totalCost / totalQty)
      } else {
        this.positions.push({ symbol, quantity, averagePrice: round2(price) })
      }

      this.addTradeHistory('buy', symbol, quantity, price, /*realized*/ 0)
      this.persist()
    },

    executeSell(symbol: string, quantity: number, price: number) {
      if (!isFinitePositive(quantity) || !isFinitePositive(price)) {
        throw new Error('Quantity and price must be positive numbers.')
      }
      const pos = this.positions.find((p) => p.symbol === symbol)
      if (!pos || pos.quantity < quantity) {
        throw new Error('Not enough shares to execute sell order.')
      }

      // 실현손익 계산 (평단 기준)
      const realized = round2(quantity * (price - pos.averagePrice))

      const proceeds = round2(quantity * price)
      this.cash = round2(this.cash + proceeds)

      pos.quantity -= quantity
      if (pos.quantity === 0) {
        this.positions = this.positions.filter((p) => p.symbol !== symbol)
      }

      this.addTradeHistory('sell', symbol, quantity, price, realized)
      this.persist()
    },

    addTradeHistory(
      type: 'buy' | 'sell',
      symbol: string,
      quantity: number,
      price: number,
      realizedPnl = 0,
    ) {
      const trade: Trade = {
        id: crypto.randomUUID(),
        type,
        symbol,
        quantity,
        price: round2(price),
        timestamp: Date.now(),
        ...(type === 'sell' ? { realizedPnl: round2(realizedPnl) } : {}),
      }
      this.tradeHistory.unshift(trade)
    },
  },
})
