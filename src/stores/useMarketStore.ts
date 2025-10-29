import { defineStore } from 'pinia'
import { MINI_TICKERS } from '@/config'
import { getDailySeries, type SeriesPoint } from '@/services/marketApi'

interface MiniTickerData {
  key: string
  series: { time: number; value: number }[]
  note?: string
}

type MiniItem =
  | Readonly<{ type: 'note'; key: string; note: string; symbol?: string }>
  | Readonly<{ type: 'fx' | 'equity'; key: string; symbol: string }>

function normalizeSymbol(sym: string): string {
  // FX가 "USD/KRW" 형태로 들어오면 "USDKRW"로 변환 (백엔드 심볼 규칙에 맞춰 조절)
  return sym.includes('/') ? sym.replace('/', '') : sym
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    symbol: '005930' as string,
    livePrice: null as number | null,
    miniTickers: [] as MiniTickerData[],
  }),
  actions: {
    async loadMiniTickers() {
      const items: MiniTickerData[] = []
      const list: ReadonlyArray<MiniItem> = MINI_TICKERS

      for (const t of list) {
        try {
          if (t.type === 'note') {
            items.push({ key: t.key, series: [], note: t.note })
            continue
          }

          const symbol = normalizeSymbol(t.symbol)
          const series: SeriesPoint[] = await getDailySeries(symbol, 120)

          items.push({
            key: t.key,
            series: series.map((p) => ({ time: p.time, value: p.close })),
          })
        } catch {
          items.push({ key: t.key, series: [], note: 'Data unavailable' })
        }
      }

      this.miniTickers = items
    },

    setSymbol(newSymbol: string) {
      if (this.symbol !== newSymbol) this.symbol = newSymbol
    },
  },
})
