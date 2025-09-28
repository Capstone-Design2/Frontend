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
}

interface PortfolioState {
  cash: number
  positions: Position[]
  tradeHistory: Trade[]
}

const KEY = 'portfolio.v1'

export const usePortfolioStore = defineStore('portfolio', {
  state: (): PortfolioState => ({
    cash: 100000, // 초기 자본금
    positions: [],
    tradeHistory: [],
  }),

  getters: {
    // 보유 주식의 총 가치 (현재가 기준, 여기서는 단순화를 위해 평균 매수 단가 사용)
    portfolioValue(state): number {
      return state.positions.reduce((total, pos) => total + pos.quantity * pos.averagePrice, 0)
    },
    // 총 자산 (현금 + 주식 가치)
    totalValue(): number {
      return this.cash + this.portfolioValue
    },
  },

  actions: {
    restore() {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const data = JSON.parse(raw)
        this.cash = data.cash
        this.positions = data.positions
        this.tradeHistory = data.tradeHistory
      }
    },

    persist() {
      localStorage.setItem(KEY, JSON.stringify(this.$state))
    },

    executeBuy(symbol: string, quantity: number, price: number) {
      const cost = quantity * price
      if (this.cash < cost) {
        throw new Error('Not enough cash to execute buy order.')
      }

      this.cash -= cost

      const existingPosition = this.positions.find((p) => p.symbol === symbol)
      if (existingPosition) {
        const totalCost = existingPosition.averagePrice * existingPosition.quantity + cost
        const totalQuantity = existingPosition.quantity + quantity
        existingPosition.quantity = totalQuantity
        existingPosition.averagePrice = totalCost / totalQuantity
      } else {
        this.positions.push({ symbol, quantity, averagePrice: price })
      }

      this.addTradeHistory('buy', symbol, quantity, price)
      this.persist()
    },

    executeSell(symbol: string, quantity: number, price: number) {
      const position = this.positions.find((p) => p.symbol === symbol)
      if (!position || position.quantity < quantity) {
        throw new Error('Not enough shares to execute sell order.')
      }

      const proceeds = quantity * price
      this.cash += proceeds

      position.quantity -= quantity
      if (position.quantity === 0) {
        this.positions = this.positions.filter((p) => p.symbol !== symbol)
      }

      this.addTradeHistory('sell', symbol, quantity, price)
      this.persist()
    },

    addTradeHistory(type: 'buy' | 'sell', symbol: string, quantity: number, price: number) {
      const trade: Trade = {
        id: crypto.randomUUID(),
        type,
        symbol,
        quantity,
        price,
        timestamp: Date.now(),
      }
      this.tradeHistory.unshift(trade)
      this.persist()
    },
  },
})
