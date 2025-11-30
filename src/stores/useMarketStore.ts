import { defineStore } from 'pinia'
import { getWebSocketService, type PriceEvent } from '@/services/websocket'

interface MiniTickerData {
  key: string
  series: { time: number; value: number }[]
  note?: string
}

interface RealtimePrice {
  currentPrice: number
  change: number
  changeRate: number
  changeSign: string
  volume: number
  timestamp: string
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    symbol: '005930' as string,
    livePrice: null as number | null,
    miniTickers: [] as MiniTickerData[],
    realtimePrice: null as RealtimePrice | null,
    wsConnected: false,
  }),
  actions: {
    setSymbol(newSymbol: string) {
      if (this.symbol !== newSymbol) {
        // 기존 구독 해제
        if (this.symbol) {
          this.unsubscribeFromPrice()
        }

        this.symbol = newSymbol

        // 새 종목 구독
        this.subscribeToPrice(newSymbol)
      }
    },

    /**
     * 실시간 가격 구독
     */
    subscribeToPrice(tickerCode: string) {
      const ws = getWebSocketService()

      ws.subscribe(tickerCode, (event: PriceEvent) => {
        this.realtimePrice = {
          currentPrice: parseFloat(event.stck_prpr),
          change: parseFloat(event.prdy_vrss),
          changeRate: parseFloat(event.prdy_ctrt),
          changeSign: event.prdy_vrss_sign,
          volume: parseFloat(event.acml_vol),
          timestamp: event.timestamp,
        }

        // livePrice도 업데이트 (기존 코드와의 호환성)
        this.livePrice = parseFloat(event.stck_prpr)
      })

      this.wsConnected = ws.isConnected()
    },

    /**
     * 실시간 가격 구독 해제
     */
    unsubscribeFromPrice() {
      const ws = getWebSocketService()
      if (this.symbol) {
        ws.unsubscribe(this.symbol)
      }
      this.realtimePrice = null
      this.wsConnected = false
    },

    /**
     * WebSocket 연결 상태 업데이트
     */
    updateConnectionStatus() {
      const ws = getWebSocketService()
      this.wsConnected = ws.isConnected()
    },
  },
})
