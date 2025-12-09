import { defineStore } from 'pinia'
import type {
  BacktestResult,
  BacktestRunRequest,
  BacktestJob,
  BacktestRun,
} from '@/types/Backtest'
import {
  runBacktest as runBacktestApi,
  getBacktestResultByJobId,
  getBacktestResults,
  getBacktestJobs,
} from '@/services/backtestApi'
import { getDailySeries } from '@/services/marketApi'

// 레거시 지원용
const KEY = 'backtest.runs.v2'
const VERSION = 2

type PersistShape = {
  version: number
  runs: any[]
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
    // 새로운 백테스팅 시스템
    results: [] as BacktestResult[],
    jobs: [] as BacktestJob[],
    currentResult: null as BacktestResult | null,
    isLoading: false,
    error: null as string | null,

    // 레거시 (하위 호환성 유지)
    runs: [] as any[],
  }),

  getters: {
    completedJobs: (state) => state.jobs.filter((job) => job.status === 'COMPLETED'),
    runningJobs: (state) => state.jobs.filter((job) => job.status === 'RUNNING'),
    failedJobs: (state) => state.jobs.filter((job) => job.status === 'FAILED'),
  },

  actions: {
    // ===== 새로운 백테스팅 시스템 =====

    /**
     * 백테스팅을 실행합니다 (백엔드 API 호출)
     */
    async executeBacktest(request: BacktestRunRequest): Promise<BacktestResult> {
      this.isLoading = true
      this.error = null
      try {
        const result = await runBacktestApi(request)
        this.currentResult = result
        await this.fetchResults()
        return result
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Backtest execution failed'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Job ID로 백테스팅 결과를 조회합니다
     */
    async fetchResultByJobId(jobId: number): Promise<BacktestResult> {
      this.isLoading = true
      this.error = null
      try {
        const result = await getBacktestResultByJobId(jobId)
        this.currentResult = result
        return result
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch result'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 사용자의 백테스팅 결과 목록을 조회합니다
     */
    async fetchResults(limit: number = 20, offset: number = 0): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.results = await getBacktestResults(limit, offset)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch results'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 사용자의 백테스트 Job 목록을 조회합니다
     */
    async fetchJobs(status?: string, limit: number = 20, offset: number = 0): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.jobs = await getBacktestJobs(status, limit, offset)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch jobs'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 현재 결과를 초기화합니다
     */
    clearCurrentResult() {
      this.currentResult = null
      this.error = null
    },

    // ===== 레거시 지원 (단순 Buy & Hold) =====

    restore() {
      const raw = localStorage.getItem(KEY)
      if (!raw) return
      try {
        const parsed: unknown = JSON.parse(raw)
        if (isPersistShape(parsed) && parsed.version === VERSION) {
          this.runs = parsed.runs
        } else {
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

    async runBacktest(params: BacktestRun) {
      const series = await getDailySeries(params.symbol, 500)
      if (series.length < 2) throw new Error('Not enough data')

      const times = series.map((p) => p.time)
      const prices = series.map((p) => p.close)

      const startPrice = prices[0]
      const endPrice = prices[prices.length - 1]
      const totalReturn = (endPrice - startPrice) / startPrice

      const seconds = times[times.length - 1] - times[0]
      const years = Math.max(seconds / (365 * 24 * 3600), 1 / 365)
      const cagr = Math.pow(1 + totalReturn, 1 / years) - 1

      const dailyRets: number[] = []
      for (let i = 1; i < prices.length; i++) {
        const r = (prices[i] - prices[i - 1]) / prices[i - 1]
        dailyRets.push(r)
      }
      const avg = mean(dailyRets)
      const sd = stdev(dailyRets)
      const sharpe = sd > 0 ? (avg / sd) * Math.sqrt(252) : 0

      const mdd = calcMdd(prices)
      const equityCurve = series.map((p) => ({ time: p.time, value: p.close }))

      const result: any = {
        id: crypto.randomUUID(),
        params,
        kpis: { totalReturn, cagr, sharpe, mdd },
        equityCurve,
        trades: [],
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
