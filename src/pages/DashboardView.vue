<template>
  <div class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 lg:grid-cols-12">
    <section class="lg:col-span-9">
      <div class="card relative overflow-hidden p-4">
        <div class="mb-3 flex items-center justify-between">
          <!-- 헤더: 좌측 정보 -->
          <div class="space-y-1.5">
            <!-- 1) 이름 + 코드 -->
            <div class="flex items-baseline gap-2">
              <h1 class="text-xl font-semibold leading-none">{{ displayName }}</h1>
              <span class="text-sm text-slate-400">{{ symbolCode }}</span>
            </div>

            <!-- 2) 가격 + 등락/등락률 -->
            <div class="flex items-center gap-3">
              <span class="text-2xl font-semibold tabular-nums" :class="priceColorClass">
                {{ priceLabel }}
              </span>

              <span
                v-if="hasChange"
                class="rounded-md px-2 py-0.5 text-xs font-medium tabular-nums"
                :class="chipColorClass"
              >
                {{ changePrefix }}{{ changeAbsLabel }} ({{ changePctLabel }})
              </span>
            </div>

            <!-- 3) 소스 -->
            <p class="text-sm text-slate-400">데이터: 한국투자증권 · WebSocket: 준비 중</p>
          </div>

          <!-- 헤더: 우측 툴바 -->
          <ChartToolbar v-model="timeframe" v-model:toolValue="tool" @clear="onClear" />
        </div>

        <div class="relative h-[420px]">
          <template v-if="candles.length > 0">
            <PriceChart
              ref="priceChart"
              :data="candles"
              :timeframe="timeframe"
              @load-older="onLoadOlder"
            />
            <OverlayCanvas v-if="tool !== 'none'" :tool="tool" />
          </template>
          <div v-else class="flex h-full items-center justify-center text-slate-400">
            Loading chart data...
          </div>
          <div
            class="pointer-events-none absolute top-[-27px] right-3 text-xs text-slate-400/70"
            v-if="candles.length > 0"
          >
            업데이트 · {{ updatedAtLabel }}
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="card p-4">
          <h3 class="mb-2 font-medium">Strategy Quickstart</h3>
          <p class="mb-3 text-sm text-slate-400">
            Create rule-based strategies with SMA, EMA, RSI, MACD and more. Persisted locally.
          </p>
          <RouterLink class="btn-primary" to="/strategies/create">New Strategy</RouterLink>
        </div>
        <div class="card p-4">
          <h3 class="mb-2 font-medium">Backtesting</h3>
          <p class="mb-3 text-sm text-slate-400">
            Run single-symbol backtests and review KPIs and trade logs.
          </p>
          <RouterLink class="btn-primary" to="/backtest/run">Run Backtest</RouterLink>
        </div>
        <div class="card p-4">
          <h3 class="mb-2 font-medium">Paper Portfolio</h3>
          <p class="mb-3 text-sm text-slate-400">
            Monitor simulated equity and positions; controlled by Kill Switch.
          </p>
          <RouterLink class="btn-primary" to="/mypage">Open My Page</RouterLink>
        </div>
      </div>
    </section>

    <aside class="lg:col-span-3">
      <div class="space-y-6">
        <TradeWidget />
        <div class="card p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-medium">Market Overview</h3>
            <button class="text-xs text-slate-400 hover:text-slate-200" @click="reload">
              Reload
            </button>
          </div>
          <div class="space-y-2">
            <MiniTicker
              v-for="t in market.miniTickers"
              :key="t.key"
              :title="t.key"
              :data="t.series"
            />
            <p class="text-xs text-slate-500">
              Some indices may be displayed as notes if not supported by the data source.
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { UTCTimestamp } from 'lightweight-charts'
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import PriceChart from '@/components/Chart/PriceChart.vue'
import OverlayCanvas from '@/components/Chart/OverlayCanvas.vue'
import ChartToolbar from '@/components/Chart/ChartToolbar.vue'
import MiniTicker from '@/components/Sidebar/MiniTicker.vue'
import TradeWidget from '@/components/Sidebar/TradeWidget.vue'
import { useMarketStore } from '@/stores/useMarketStore'
import { getSeriesBackward } from '@/services/marketApi'
import { useUiStore } from '@/stores/useUiStore'
import { getSymbolMeta } from '@/services/tvSymbolApi'

// ---- 타입
type Timeframe = '1min' | '5min' | '15min' | '60min' | '1day'
type Tool = 'none' | 'trendline' | 'hline' | 'fib'

interface CandlePoint {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// ---- 상태
const ui = useUiStore()
const market = useMarketStore()
const timeframe = ref<Timeframe>('1day')
const tool = ref<Tool>('none')

const priceChart = ref<InstanceType<typeof PriceChart> | null>(null)
const candles = ref<CandlePoint[]>([])
const displayName = ref<string>('')

// ---- 포맷터
const fmtKRW = (n: number) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(n)

const priceLabel = computed(() => (market.livePrice != null ? fmtKRW(market.livePrice) : '—'))

// 코드/거래소 라벨
const symbolCode = computed(() => market.symbol ?? '')

// 업데이트 시각 (마지막 캔들)
const updatedAtLabel = computed(() => {
  const last = candles.value[candles.value.length - 1]
  if (!last) return '—'
  const dt = new Date(Number(last.time) * 1000)
  // YYYY-MM-DD HH:mm
  const yyyy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  const hh = String(dt.getUTCHours()).padStart(2, '0')
  const mi = String(dt.getUTCMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`
})

// 등락/등락률 계산
const lastCandle = computed(() => candles.value[candles.value.length - 1])
const prevCandle = computed(() => candles.value[candles.value.length - 2])

const change = computed(() => {
  if (!lastCandle.value || !prevCandle.value) return null
  return lastCandle.value.close - prevCandle.value.close
})
const changePct = computed(() => {
  if (!change.value || !prevCandle.value) return null
  if (prevCandle.value.close === 0) return null
  return (change.value / prevCandle.value.close) * 100
})

const hasChange = computed(() => change.value !== null && changePct.value !== null)
const changePrefix = computed(() => (change.value! >= 0 ? '+' : ''))
const changeAbsLabel = computed(() => (change.value == null ? '' : fmtKRW(Math.abs(change.value))))
const changePctLabel = computed(() =>
  changePct.value == null
    ? ''
    : `${change.value! >= 0 ? '▲' : '▼'}${Math.abs(changePct.value).toFixed(2)}%`,
)

const priceColorClass = computed(() => {
  if (change.value == null) return 'text-slate-200'
  return change.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
})
const chipColorClass = computed(() => {
  if (change.value == null) return 'bg-slate-700 text-slate-200'
  return change.value >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
})

// ---- UDF resolution 매핑
function tfToResolution(tf: Timeframe): '1' | '5' | '15' | '60' | 'D' {
  switch (tf) {
    case '1min':
      return '1'
    case '5min':
      return '5'
    case '15min':
      return '15'
    case '60min':
      return '60'
    case '1day':
      return 'D'
  }
}

// 공통 history loader (UDF)
let currentReq = 0 // 요청 토큰

async function load(symbol: string, tf: Timeframe) {
  const reqId = ++currentReq
  try {
    market.livePrice = null
    candles.value = []

    const meta = await getSymbolMeta(symbol)
    displayName.value = meta?.name ?? symbol

    const resolution = tfToResolution(tf)

    const points = await getSeriesBackward(symbol, {
      resolution,
      pageSize: 1000,
      adjusted: false,
      maxPages: 100, // 과거로 몇 번까지 요청할지 제한 (필요시 조정)
    })

    // 이전 요청이 뒤늦게 도착한 경우 무시
    if (reqId !== currentReq) return

    candles.value = points.map((p) => ({
      time: p.time as UTCTimestamp,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume ?? 0,
    }))

    if (candles.value.length > 0) {
      market.livePrice = candles.value[candles.value.length - 1].close
    }
  } catch (error) {
    console.error(`Failed to load data for symbol ${symbol}:`, error)
    ui.pushToast?.({
      type: 'error',
      message: `Unknown/unsupported symbol: ${symbol}. Fallback to KRX:005930.`,
    })
    if (symbol !== 'KRX:005930') {
      // 이중 호출 방지
      market.setSymbol('KRX:005930')
    }
  }
}

async function onLoadOlder(oldestTime: number) {
  console.debug('[Chart] Load older data before', oldestTime)

  const more = await getSeriesBackward(market.symbol, {
    resolution: tfToResolution(timeframe.value),
    pageSize: 1000,
    adjusted: false,
    maxPages: 3,
  })

  // 1) OHLCVPoint[] -> CandlePoint[]
  const moreCandles: CandlePoint[] = more.map((p) => ({
    time: p.time as UTCTimestamp,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close,
    volume: p.volume ?? 0,
  }))

  // 2) 병합 + 중복 제거 + 정렬
  const all: CandlePoint[] = [...moreCandles, ...candles.value]

  const seen = new Set<number>()
  const merged: CandlePoint[] = all
    .filter((c) => {
      const key = Number(c.time)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => Number(a.time) - Number(b.time))

  candles.value = merged
}

function onClear() {
  window.dispatchEvent(new CustomEvent('overlay:close'))
}

function reload() {
  market.loadMiniTickers()
}

// ---- watch
watch(timeframe, (tf) => {
  load(market.symbol, tf)
})
watch(
  () => market.symbol,
  (sym) => {
    load(sym, timeframe.value)
  },
)

// ---- mount
onMounted(async () => {
  await load(market.symbol, timeframe.value)
  market.loadMiniTickers()
})
</script>
