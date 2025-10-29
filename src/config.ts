// ─────────────────────────────────────────────────────────────
// 폴링 기본값 (임시 준실시간 업데이트용)
// ─────────────────────────────────────────────────────────────
export const POLLING_DEFAULTS = {
  intervalMs: 1_500, // 기본 1.5s (필요시 3s/5s 등으로 조정)
  backoffFactor: 2, // 오류 시 2배로 증분
  maxIntervalMs: 120_000, // 최대 120s
} as const

// ─────────────────────────────────────────────────────────────
// 미니 티커 항목 타입: note / fx / equity
//  - note: 안내 메시지용 (symbol은 옵션)
//  - fx / equity: 실제 심볼 필요
// ─────────────────────────────────────────────────────────────
export type MiniItem =
  | { readonly key: string; readonly type: 'note'; readonly note: string; readonly symbol?: string }
  | { readonly key: string; readonly type: 'fx' | 'equity'; readonly symbol: string }

// ─────────────────────────────────────────────────────────────
// 미니 티커 목록 (읽기 전용)
//  - 서버는 /tradingview/history 로부터 데이터를 제공
//  - FX 심볼은 "USD/KRW" 형태를 스토어에서 "USDKRW"로 정규화해 사용
// ─────────────────────────────────────────────────────────────
export const MINI_TICKERS = [
  { key: 'KOSPI', type: 'note', symbol: '^KS11', note: 'Displayed as note only.' },
  { key: 'KOSDAQ', type: 'note', symbol: '^KQ11', note: 'Displayed as note only.' },
] as const satisfies ReadonlyArray<MiniItem>

// 키 타입 (예: 'KOSPI' | 'KOSDAQ' | 'Gold' | 'USD/KRW' | 'DXY')
export type MiniTickerKey = (typeof MINI_TICKERS)[number]['key']
