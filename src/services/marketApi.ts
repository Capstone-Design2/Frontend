// src/services/marketApi.ts
import http from '@/services/http'

type TVHistoryOk = {
  s: 'ok'
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}
type TVHistoryNoData = { s: 'no_data'; nextTime?: number }
type TVHistory = TVHistoryOk | TVHistoryNoData

export interface OHLCVPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 심볼 유효성: EXCHANGE:CODE 또는 CODE.SUFFIX 또는 영문/숫자(직접코드)만 허용
function isProbablyCanonicalSymbol(sym: string): boolean {
  // 한글/공백 등 사람이 읽는 이름은 바로 차단
  if (/[^A-Za-z0-9:.\-]/.test(sym)) return false
  // 최소한 숫자/영문은 포함되어야 함
  return /[A-Za-z0-9]/.test(sym)
}

export async function getServerTime(): Promise<number> {
  const res = await http.get<number>('/tradingview/time')
  return res.data
}

export async function getDailySeries(symbol: string, limit = 180): Promise<OHLCVPoint[]> {
  // 1) 심볼 가드: 이름(예: '삼성전자')이 들어오면 즉시 실패
  if (!isProbablyCanonicalSymbol(symbol)) {
    // 여길 탄다면 상위에서 selectedSymbol 세팅/주입이 잘못된 것
    throw new Error(
      `getDailySeries(): invalid symbol '${symbol}'. Must be canonical like 'KRX:005930' or '005930.KS'.`,
    )
  }

  const now = await getServerTime()
  const daysBuffer = 20
  const from = now - (limit + daysBuffer) * 86_400
  const to = now

  // 2) 반드시 URLSearchParams로 인코딩 (콜론/닷 안전)
  const qs = new URLSearchParams({
    symbol, // 원본문자열 (예: KRX:005930)
    resolution: 'D',
    from: String(from),
    to: String(to),
    adjusted: 'false',
  })

  // 디버그: 네트워크 패널에서 실제 요청 확인용 (개발 중에만)
  // console.debug('[GET] /tradingview/history?', qs.toString())

  const url = `/tradingview/history?${qs.toString()}`
  const res = await http.get<TVHistory>(url)

  const data = res.data
  if (data.s !== 'ok') return []

  const n = Math.min(
    data.t.length,
    data.o.length,
    data.h.length,
    data.l.length,
    data.c.length,
    data.v.length,
  )
  const start = Math.max(0, n - limit)

  const out: OHLCVPoint[] = []
  for (let i = start; i < n; i++) {
    out.push({
      time: data.t[i],
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    })
  }
  return out
}
