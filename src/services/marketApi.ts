import http from '@/services/http'

type TVHistoryOk = {
  s: 'ok'
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
  nextTime?: number
}
type TVHistoryNoData = { s: 'no_data'; nextTime?: number }
type TVHistory = TVHistoryOk | TVHistoryNoData

export interface OHLCVPoint {
  time: number // seconds (UTC)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 종목코드 유효성 검사
function isProbablyCanonicalSymbol(sym: string): boolean {
  if (/[^A-Za-z0-9:.\-]/.test(sym)) return false
  return /[A-Za-z0-9]/.test(sym)
}

export async function getServerTime(): Promise<number> {
  const res = await http.get<number>('/tradingview/time')
  return res.data
}

export async function getSeriesPaged(
  symbol: string,
  {
    resolution = 'D',
    limit = 300,
    pageSize = 500,
    adjusted = false,
    signal,
  }: {
    resolution?: string
    limit?: number
    pageSize?: number
    adjusted?: boolean
    signal?: AbortSignal
  } = {},
): Promise<OHLCVPoint[]> {
  if (!isProbablyCanonicalSymbol(symbol)) {
    throw new Error(`잘못된 종목코드 : '${symbol}'. 한국거래소 표준 코드인지 확인 필요.`)
  }

  const now = await getServerTime()

  // 서버는 from/to(초 단위)를 받고, nextTime으로 이어붙일 수 있음
  // 처음 한 번은 충분히 넉넉한 과거부터 시작(버퍼일 + 페이지네이션으로 보강)
  const daysBuffer = 120
  const from = now - (limit + daysBuffer) * 86_400
  let to = now

  // 페이지네이션 루프
  const rows: OHLCVPoint[] = []
  let cursor: number | undefined = undefined
  let safety = 0

  while (rows.length < limit && safety < 20) {
    safety++

    const params: Record<string, string> = {
      symbol,
      resolution,
      from: String(from),
      to: String(to),
      adjusted: String(adjusted),
      page_size: String(pageSize),
    }

    if (cursor !== undefined) {
      params.cursor_ts = String(cursor)
    }

    const qs = new URLSearchParams(params)
    console.debug('Fetching:', `/tradingview/history?${qs.toString()}`)

    const url = `/tradingview/history?${qs.toString()}`
    const res = await http.get<TVHistory>(url, { signal })
    const data = res.data

    // 데이터 없음: nextTime이 있으면 그 지점으로 범위 당겨서 재시도
    if (data.s === 'no_data') {
      if (typeof data.nextTime === 'number') {
        // 다음 페이지 기준을 서버가 제시
        cursor = data.nextTime
        continue
      }
      break
    }

    // 정상 데이터 적재
    const n = Math.min(
      data.t.length,
      data.o.length,
      data.h.length,
      data.l.length,
      data.c.length,
      data.v.length,
    )

    for (let i = 0; i < n; i++) {
      // 필터링/중복방지용: 기존에 같은 t가 있다면 스킵(서버가 중복 줄 수도 있으니)
      const t = data.t[i]
      if (rows.length && rows[rows.length - 1].time === t) continue

      rows.push({
        time: t,
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      })
    }

    // 다음 페이지로 넘어갈지 결정
    if (typeof data.nextTime === 'number') {
      // 보통 TradingView UDF의 nextTime은 "다음 요청의 to 또는 커서"로 쓰입니다.
      // 백엔드가 next_time을 내려주므로 커서/시간 둘 다 동일 값으로 이동
      cursor = data.nextTime
      to = data.nextTime
    } else {
      // 더 이상 이어붙일 것이 없으면 종료
      break
    }
  }

  // 정렬(혹시 뒤섞여 올 수 있으니 안전하게) + 중복 제거
  rows.sort((a, b) => a.time - b.time)
  const dedup: OHLCVPoint[] = []
  for (const r of rows) {
    if (!dedup.length || dedup[dedup.length - 1].time !== r.time) dedup.push(r)
  }

  // 요청한 limit만큼만 반환(뒤에서부터)
  const start = Math.max(0, dedup.length - limit)
  return dedup.slice(start)
}

/**
 * 기존 API와 최대한 호환되는 Daily 전용 래퍼
 * - 내부적으로 페이지네이션을 사용하도록 교체
 */
export async function getDailySeries(symbol: string, limit = 30): Promise<OHLCVPoint[]> {
  return getSeriesPaged(symbol, { resolution: 'D', limit })
}

export async function getSeriesBackward(
  symbol: string,
  {
    resolution = 'D',
    pageSize = 500,
    adjusted = false,
    signal,
    maxPages = 50,
  }: {
    resolution?: string
    pageSize?: number
    adjusted?: boolean
    signal?: AbortSignal
    maxPages?: number
  } = {},
): Promise<OHLCVPoint[]> {
  const now = await getServerTime()
  let to = now
  const rows: OHLCVPoint[] = []
  let safety = 0

  const secPerBar = 24 * 60 * 60

  while (safety < maxPages) {
    safety++

    const from = to - pageSize * secPerBar
    const qs = new URLSearchParams({
      symbol,
      resolution,
      from: String(from),
      to: String(to),
      adjusted: String(adjusted),
      page_size: String(pageSize),
    })

    const { data } = await http.get<TVHistory>(`/tradingview/history?${qs.toString()}`, { signal })

    if (data.s === 'no_data') break

    const n = Math.min(
      data.t.length,
      data.o.length,
      data.h.length,
      data.l.length,
      data.c.length,
      data.v.length,
    )
    for (let i = 0; i < n; i++) {
      rows.push({
        time: data.t[i],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      })
    }

    if (typeof data.nextTime === 'number' && data.nextTime < to) {
      to = data.nextTime
    } else {
      break
    }
  }

  rows.sort((a, b) => a.time - b.time)
  const out: OHLCVPoint[] = []
  for (const r of rows) if (!out.length || out[out.length - 1].time !== r.time) out.push(r)
  return out
}
