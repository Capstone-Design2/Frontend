import { defineStore } from 'pinia'
import type { BacktestRun, BacktestResult } from '@/types/Backtest'
import { getDailySeries } from '@/services/marketApi' // ← UDF 기반 일봉 시리즈 (time: unix, close)

const KEY = 'backtest.runs.v2'
const VERSION = 2

type PersistShape = {
  version: number
  runs: BacktestResult[]
}

function isPersistShape(x: unknown): x is PersistShape {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return typeof o.version === 'number' && Array.isArray(o.runs)
}

// 단순 통계 유틸
function mean(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}
function stdev(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  const v = mean(xs.map((x) => (x - m) ** 2))
  return Math.sqrt(v)
}
function calcMdd(series: number[]): number {
  // series: 누적 지수(혹은 가격). MDD는 양수 비율로 반환.
  let peak = series[0]
  let mdd = 0
  for (const v of series) {
    peak = Math.max(peak, v)
    const dd = peak > 0 ? (peak - v) / peak : 0
    if (dd > mdd) mdd = dd
  }
  return mdd
}

export const useBacktestStore = defineStore('backtest', {
  state: () => ({
    runs: [] as BacktestResult[],
  }),

  actions: {
    restore() {
      const raw = localStorage.getItem(KEY)
      if (!raw) return
      try {
        const parsed: unknown = JSON.parse(raw)
        if (isPersistShape(parsed) && parsed.version === VERSION) {
          this.runs = parsed.runs
        } else {
          // 버전 불일치 → 초기화
          this.runs = []
          this.persist()
        }
      } catch {
        this.runs = []
        this.persist()
      }
    },

    persist() {
      const payload: PersistShape = { version: VERSION, runs: this.runs }
      localStorage.setItem(KEY, JSON.stringify(payload))
    },

    /**
     * 단순 보유(Buy & Hold) 백테스트
     * - params.symbol만 사용 (기존 타입과 호환)
     * - 최근 500일 기준 (필요하면 getDailySeries의 limit 변경)
     */
    async runBacktest(params: BacktestRun) {
      const series = await getDailySeries(params.symbol, 500) // { time, close }[]
      if (series.length < 2) throw new Error('Not enough data')

      // 시간/가격 벡터
      const times = series.map((p) => p.time) // unix seconds
      const prices = series.map((p) => p.close)

      const startPrice = prices[0]
      const endPrice = prices[prices.length - 1]
      const totalReturn = (endPrice - startPrice) / startPrice

      // CAGR 계산 (연율): 년수 = (마지막-처음)초 / (365*24*3600)
      const seconds = times[times.length - 1] - times[0]
      const years = Math.max(seconds / (365 * 24 * 3600), 1 / 365) // 최소 하루 가정
      const cagr = Math.pow(1 + totalReturn, 1 / years) - 1

      // Sharpe (무위험 수익률 0 가정, 252 거래일)
      const dailyRets: number[] = []
      for (let i = 1; i < prices.length; i++) {
        const r = (prices[i] - prices[i - 1]) / prices[i - 1]
        dailyRets.push(r)
      }
      const avg = mean(dailyRets)
      const sd = stdev(dailyRets)
      const sharpe = sd > 0 ? (avg / sd) * Math.sqrt(252) : 0

      // MDD (가격 시퀀스 기준)
      const mdd = calcMdd(prices)

      // Equity curve: 가격 그대로 사용 (원하면 100 기준 정규화도 가능)
      const equityCurve = series.map((p) => ({ time: p.time, value: p.close }))

      const result: BacktestResult = {
        id: crypto.randomUUID(),
        params,
        kpis: {
          totalReturn,
          cagr,
          sharpe,
          mdd,
        },
        equityCurve,
        trades: [], // 단순 보유이므로 트레이드 없음
      }

      this.runs.unshift(result)
      this.persist()
      return result.id
    },

    getResult(id: string) {
      return this.runs.find((r) => r.id === id)
    },
  },
})
