import { defineStore } from 'pinia'
import type { BacktestRun, BacktestResult } from '@/types/Backtest'
import { getDaily } from '@/services/alphaVantage'

const KEY = 'backtest.runs.v1'

export const useBacktestStore = defineStore('backtest', {
  state: () => ({ runs: [] as BacktestResult[] }),
  actions: {
    restore() { const raw = localStorage.getItem(KEY); if (raw) this.runs = JSON.parse(raw) },
    persist() { localStorage.setItem(KEY, JSON.stringify(this.runs)) },
    async runBacktest(params: BacktestRun) {
      const data = await getDaily(params.symbol)
      if (data.length < 2) throw new Error('Not enough data')
      const start = data[0].close
      const end = data[data.length-1].close
      const totalReturn = (end - start) / start
      const result: BacktestResult = {
        id: crypto.randomUUID(),
        params,
        kpis: { totalReturn, cagr: totalReturn, sharpe: 0.0, mdd: 0.0 },
        equityCurve: data.map((d, i) => ({ time: d.time, value: start * (1 + totalReturn * (i/(data.length-1))) })),
        trades: [],
      }
      this.runs.unshift(result); this.persist()
      return result.id
    },
    getResult(id: string) { return this.runs.find(r => r.id === id) }
  }
})
