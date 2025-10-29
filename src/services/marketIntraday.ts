import http from '@/services/http'

/** TradingView UDF history 응답 타입 */
type TVHistoryOk = {
  s: 'ok'
  t: number[] // unix seconds (UTC)
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}
type TVHistoryNoData = { s: 'no_data'; nextTime?: number }
type TVHistory = TVHistoryOk | TVHistoryNoData

/** UDF 분봉 해상도 타입 */
export type TVResolution = '1' | '5' | '15' | '30' | '60'

export interface OHLCVPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * 분봉 시리즈 조회 (TradingView UDF /tradingview/history)
 * - symbol: 티커
 * - resolution: '1' | '5' | '15' | '30' | '60'
 * - limit: 가져올 캔들 개수(대략)
 * - now: 서버 기준 now(초). 없으면 서버에서 /tradingview/time 한 번 더 부르는 버전도 가능하지만,
 *        이미 호출한 값을 상위에서 주입하는 게 네트워크 절약.
 */
export async function getSeries(
  symbol: string,
  resolution: TVResolution,
  limit: number,
  now: number,
  adjusted = false,
): Promise<OHLCVPoint[]> {
  // 분 기준 초 환산
  const mins = Number(resolution) // '60' -> 60
  const secondsPerBar = mins * 60
  // 장휴일/비거래 시간 고려해 넉넉히 버퍼
  const barsBuffer = 100
  const totalSeconds = (limit + barsBuffer) * secondsPerBar
  const from = now - totalSeconds
  const to = now

  const res = await http.get<TVHistory>('/tradingview/history', {
    params: {
      symbol,
      resolution,
      from,
      to,
      adjusted,
    },
  })

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

  // 최신 기준 limit개만 반환
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
