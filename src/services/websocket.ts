/**
 * WebSocket Service
 * 실시간 시세 데이터 WebSocket 연결 관리
 */

export interface PriceEvent {
  type: 'price'
  ticker_code: string
  stck_prpr: string          // 현재가
  prdy_vrss: string          // 전일대비
  prdy_vrss_sign: string     // 전일대비 부호
  prdy_ctrt: string          // 전일대비율
  acml_vol: string           // 누적거래량
  stck_oprc: string          // 시가
  stck_hgpr: string          // 고가
  stck_lwpr: string          // 저가
  cntg_vol: string           // 체결거래량
  timestamp: string
}

export type PriceCallback = (event: PriceEvent) => void

class WebSocketService {
  private sockets: Map<string, WebSocket> = new Map()
  private callbacks: Map<string, Set<PriceCallback>> = new Map()
  private reconnectTimers: Map<string, number> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  /**
   * 특정 종목 WebSocket 연결
   */
  private connectTicker(tickerCode: string): void {
    if (this.sockets.has(tickerCode)) {
      return
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const wsUrl = apiUrl.replace(/^http/, 'ws')
    const url = `${wsUrl}/ws/market/${tickerCode}`

    console.log(`[WebSocket] Connecting to ${url}`)

    const socket = new WebSocket(url)

    socket.onopen = () => {
      console.log(`[WebSocket] Connected to ${tickerCode}`)
      this.reconnectAttempts.set(tickerCode, 0)
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'price') {
          const callbacks = this.callbacks.get(tickerCode)
          if (callbacks) {
            callbacks.forEach(cb => cb(message as PriceEvent))
          }
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error)
      }
    }

    socket.onerror = (error) => {
      console.error(`[WebSocket] Error on ${tickerCode}:`, error)
    }

    socket.onclose = () => {
      console.log(`[WebSocket] Disconnected from ${tickerCode}`)
      this.sockets.delete(tickerCode)

      // 자동 재연결
      const attempts = this.reconnectAttempts.get(tickerCode) || 0
      if (attempts < this.maxReconnectAttempts && this.callbacks.has(tickerCode)) {
        this.reconnectAttempts.set(tickerCode, attempts + 1)
        const timer = window.setTimeout(() => {
          console.log(`[WebSocket] Reconnecting to ${tickerCode} (attempt ${attempts + 1})`)
          this.connectTicker(tickerCode)
        }, this.reconnectDelay)
        this.reconnectTimers.set(tickerCode, timer)
      }
    }

    this.sockets.set(tickerCode, socket)
  }

  /**
   * 특정 종목 구독
   */
  subscribe(tickerCode: string, callback: PriceCallback): void {
    // 콜백 등록
    if (!this.callbacks.has(tickerCode)) {
      this.callbacks.set(tickerCode, new Set())
    }
    this.callbacks.get(tickerCode)?.add(callback)

    // WebSocket 연결
    this.connectTicker(tickerCode)

    console.log(`[WebSocket] Subscribed to ${tickerCode}`)
  }

  /**
   * 특정 종목 구독 해제
   */
  unsubscribe(tickerCode: string, callback?: PriceCallback): void {
    if (callback) {
      // 특정 콜백만 제거
      this.callbacks.get(tickerCode)?.delete(callback)
    } else {
      // 모든 콜백 제거
      this.callbacks.delete(tickerCode)
    }

    // 콜백이 더 이상 없으면 WebSocket 닫기
    if (!this.callbacks.has(tickerCode) || this.callbacks.get(tickerCode)?.size === 0) {
      const socket = this.sockets.get(tickerCode)
      if (socket) {
        socket.close()
        this.sockets.delete(tickerCode)
      }

      // 재연결 타이머 정리
      const timer = this.reconnectTimers.get(tickerCode)
      if (timer) {
        clearTimeout(timer)
        this.reconnectTimers.delete(tickerCode)
      }

      this.reconnectAttempts.delete(tickerCode)
      console.log(`[WebSocket] Unsubscribed from ${tickerCode}`)
    }
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    // 하나라도 연결되어 있으면 true
    for (const socket of this.sockets.values()) {
      if (socket.readyState === WebSocket.OPEN) {
        return true
      }
    }
    return false
  }

  /**
   * 연결 종료
   */
  disconnect(): void {
    this.sockets.forEach((socket) => socket.close())
    this.sockets.clear()
    this.callbacks.clear()
    this.reconnectTimers.forEach((timer) => clearTimeout(timer))
    this.reconnectTimers.clear()
    this.reconnectAttempts.clear()
    console.log('[WebSocket] Disconnected all connections')
  }
}

// 싱글톤 인스턴스
let instance: WebSocketService | null = null

export function getWebSocketService(): WebSocketService {
  if (!instance) {
    instance = new WebSocketService()
  }
  return instance
}

export default WebSocketService
