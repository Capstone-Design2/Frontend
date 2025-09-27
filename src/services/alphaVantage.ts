import { ALPHA_VANTAGE_BASE } from '@/config'

const TTL = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  INTRADAY: 60 * 60 * 1000, // 1 hour
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memCache = new Map<string, CacheEntry<any>>()

function cacheGet<T>(key: string): T | null {
  const memEntry = memCache.get(key)
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.data
  }

  const raw = localStorage.getItem(`av:${key}`)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (parsed.expiresAt > Date.now()) {
      memCache.set(key, parsed) // Re-populate in-memory cache
      return parsed.data
    } else {
      // Expired, remove from storage
      localStorage.removeItem(`av:${key}`)
      memCache.delete(key)
    }
  } catch {
    localStorage.removeItem(`av:${key}`) // Corrupted data
  }
  return null
}

function cacheSet<T>(key: string, data: T, ttl: number = TTL.DEFAULT) {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttl }
  memCache.set(key, entry)
  localStorage.setItem(`av:${key}`, JSON.stringify(entry))
}

const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY

async function call(params: Record<string, string>, ttl?: number) {
  const fn = params.function
  const key = buildKey(fn, params)
  const cached = cacheGet<any>(key)
  if (cached) return cached

  if (!apiKey) {
    const errorMsg = 'Alpha Vantage API key is missing. Please check your .env file.'
    console.error(`[API Error] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  const usp = new URLSearchParams({ ...params, apikey: String(apiKey || '') })
  const res = await fetch(`${ALPHA_VANTAGE_BASE}?${usp.toString()}`)
  if (!res.ok) throw new Error(`Alpha Vantage error ${res.status}`)
  const data = await res.json()

  // Alpha Vantage returns a "Note" on rate limits with a 200 OK status.
  // We should not cache this response.
  if (data.Note) {
    throw new Error(`Alpha Vantage API limit reached or note: ${data.Note}`)
  }
  return data
}

export interface OHLC {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export async function getDaily(
  symbol: string,
  fn: 'TIME_SERIES_DAILY' | 'FX_DAILY' = 'TIME_SERIES_DAILY',
): Promise<OHLC[]> {
  const params =
    fn === 'FX_DAILY'
      ? { function: 'FX_DAILY', from_symbol: symbol.slice(0, 3), to_symbol: symbol.slice(3) }
      : { function: 'TIME_SERIES_DAILY', symbol }
  const key = buildKey(params.function, params)
  const data = cacheGet(key) ?? (await call(params).then((d) => (cacheSet(key, d), d)))
  const seriesKey = Object.keys(data).find((k) => k.includes('Time Series'))
  const series = data[seriesKey] || {}
  const rows: OHLC[] = Object.entries<any>(series).map(([date, v]) => ({
    time: new Date(date).getTime() / 1000,
    open: parseFloat(v['1. open'] || v['1. Open'] || '0'),
    high: parseFloat(v['2. high'] || v['2. High'] || '0'),
    low: parseFloat(v['3. low'] || v['3. Low'] || '0'),
    close: parseFloat(v['4. close'] || v['4. Close'] || '0'),
    volume: parseFloat(v['5. volume'] || v['5. Volume']),
  }))
  return rows.reverse()
}

export async function getIntraday(
  symbol: string,
  interval: '1min' | '5min' | '15min' | '60min' = '1min',
): Promise<OHLC[]> {
  const params = { function: 'TIME_SERIES_INTRADAY', symbol, interval }
  const key = buildKey(params.function, params)
  const data =
    cacheGet(key) ??
    (await call(params, TTL.INTRADAY).then((d) => (cacheSet(key, d, TTL.INTRADAY), d)))
  const seriesKey = Object.keys(data).find((k) => k.includes('Time Series'))
  const series = data[seriesKey] || {}
  const rows: OHLC[] = Object.entries<any>(series).map(([date, v]) => ({
    time: Math.floor(new Date(date).getTime() / 1000),
    open: parseFloat(v['1. open'] || '0'),
    high: parseFloat(v['2. high'] || '0'),
    low: parseFloat(v['3. low'] || '0'),
    close: parseFloat(v['4. close'] || '0'),
    volume: parseFloat(v['5. volume'] || '0'),
  }))
  return rows.reverse()
}

function buildKey(fn: string, parts: Record<string, string | number | undefined>) {
  const ordered = Object.entries(parts)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
  const tail = ordered.map(([k, v]) => `${k}=${v}`).join('&')
  return `${fn}:${tail}`
}

export interface SymbolSearchResult {
  symbol: string
  name: string
}

function mapSymbol(match: any): SymbolSearchResult {
  return {
    symbol: match['1. symbol'],
    name: match['2. name'],
  }
}

export async function searchSymbols(keywords: string): Promise<SymbolSearchResult[]> {
  if (!keywords || keywords.length < 2) {
    return []
  }

  const params = { function: 'SYMBOL_SEARCH', keywords }
  // 검색 결과는 자주 바뀔 수 있으므로 짧은 TTL로 캐시합니다.
  const key = buildKey(params.function, params)
  const cached = cacheGet<any>(key)
  if (cached) return cached.bestMatches.map(mapSymbol)

  const data = await call(params, TTL.INTRADAY)

  // API가 유효한 결과를 반환하지 않은 경우, 캐시하지 않고 빈 배열을 반환합니다.
  if (!data.bestMatches || data.bestMatches.length === 0) {
    return []
  }

  cacheSet(key, data, TTL.INTRADAY)
  return data.bestMatches.map(mapSymbol)
}

export async function getSMA(symbol: string, period: number) {
  const data = await call({
    function: 'SMA',
    symbol,
    interval: 'daily',
    time_period: String(period),
    series_type: 'close',
  })
  return data
}
export async function getRSI(symbol: string, period: number) {
  const data = await call({
    function: 'RSI',
    symbol,
    interval: 'daily',
    time_period: String(period),
    series_type: 'close',
  })
  return data
}
export async function getMACD(symbol: string, fast: number, slow: number, signal: number) {
  const data = await call({
    function: 'MACD',
    symbol,
    interval: 'daily',
    fastperiod: String(fast),
    slowperiod: String(slow),
    signalperiod: String(signal),
    series_type: 'close',
  })
  return data
}
export async function getBBANDS(symbol: string, period: number, dev: number) {
  const data = await call({
    function: 'BBANDS',
    symbol,
    interval: 'daily',
    time_period: String(period),
    nbdevup: String(dev),
    nbdevdn: String(dev),
    series_type: 'close',
  })
  return data
}
