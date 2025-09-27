import { defineStore } from 'pinia'
import { getDaily, getIntraday } from '@/services/alphaVantage'
import { MINI_TICKERS } from '@/config'

interface MiniTickerData {
  key: string
  series: { time: number; value: number }[]
  note?: string
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    symbol: 'GOOGL' as string,
    livePrice: null as number | null,
    miniTickers: [] as MiniTickerData[],
  }),
  actions: {
    async loadMiniTickers() {
      const items: MiniTickerData[] = []
      for (const t of MINI_TICKERS) {
        try {
          if (t.type === 'note') {
            items.push({ key: t.key, series: [], note: t.note })
            continue
          }
          if (t.type === 'fx') {
            const [base, quote] = t.symbol.split('/')
            const data = await getDaily(`${base}${quote}`, 'FX_DAILY')
            items.push({ key: t.key, series: data.map((d) => ({ time: d.time, value: d.close })) })
          } else {
            const data = await getDaily(t.symbol)
            items.push({ key: t.key, series: data.map((d) => ({ time: d.time, value: d.close })) })
          }
        } catch (e) {
          items.push({ key: t.key, series: [], note: 'Data unavailable' })
        }
      }
      this.miniTickers = items
    },
    setSymbol(newSymbol: string) {
      if (this.symbol !== newSymbol) {
        this.symbol = newSymbol
      }
    },
  },
})
