import http from '@/services/http'

/** 백엔드 SearchItemOut에 맞춘 원시 타입 (유연 매핑) */
interface RawSearchItem {
  symbol?: string
  full_name?: string
  description?: string
  exchange?: string
  ticker?: string
  type?: string
}

/** 네비에서 사용할 간단 타입 */
export interface SymbolSearchItem {
  symbol: string
  name: string
  exchange?: string
  rawSymbol?: string
}

export interface SymbolMeta {
  symbol: string
  name: string
  exchange?: string
}

interface RawSymbolMeta {
  name?: string
  description?: string
  ticker?: string
  exchange?: string
}

export async function getSymbolMeta(symbol: string): Promise<SymbolMeta | null> {
  try {
    const res = await http.get<RawSymbolMeta>('/tradingview/symbols', { params: { symbol } })
    const r = res.data
    const name = r.description || r.name || r.ticker || symbol
    return { symbol, name, exchange: r.exchange }
  } catch {
    return null
  }
}

function normalizeSymbol(sym?: string): string {
  if (!sym) return ''
  // "KOSPI:005930.KS" 같은 경우도 대비
  const s = sym.includes(':') ? sym.split(':')[1] : sym
  return s.split('.')[0] // "005930.KS" → "005930"
}

export async function searchSymbolsUdf(query: string, limit = 20): Promise<SymbolSearchItem[]> {
  const res = await http.get<RawSearchItem[]>('/tradingview/search', {
    params: { query, limit },
  })

  return res.data
    .map((r) => {
      const rawSym = r.symbol ?? r.ticker ?? r.full_name ?? ''
      const symbol = normalizeSymbol(rawSym)
      const name = r.description ?? r.full_name ?? symbol
      return { symbol, name, exchange: r.exchange, rawSymbol: rawSym }
    })
    .filter((x) => x.symbol.length > 0)
}
