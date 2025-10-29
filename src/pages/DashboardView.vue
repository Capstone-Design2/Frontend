<template>
  <div class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 lg:grid-cols-12">
    <section class="lg:col-span-9">
      <div class="card relative overflow-hidden p-4">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold">
              {{ displayName }} <span class="ml-2 text-slate-400 text-sm">{{ market.symbol }}</span>
              <span class="ml-2 text-sm text-slate-400">{{ priceLabel }}</span>
            </h1>
            <p class="text-sm text-slate-400">
              Historical via /tradingview/history · live via WS (coming soon)
            </p>
          </div>
          <ChartToolbar v-model="timeframe" v-model:toolValue="tool" @clear="onClear" />
        </div>

        <div class="relative h-[420px]">
          <template v-if="candles.length > 0">
            <PriceChart ref="priceChart" :data="candles" :timeframe="timeframe" />
            <OverlayCanvas v-if="tool !== 'none'" :tool="tool" />
          </template>
          <div v-else class="flex h-full items-center justify-center text-slate-400">
            Loading chart data...
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
import { getServerTime, getDailySeries } from '@/services/marketApi'
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

const priceLabel = computed(() =>
  market.livePrice != null ? `$${market.livePrice.toFixed(2)}` : '',
)

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

// 필요 분량(캔들 개수) 추정
function defaultLimit(tf: Timeframe): number {
  switch (tf) {
    case '1min':
      return 600 // 약 하루
    case '5min':
      return 500
    case '15min':
      return 400
    case '60min':
      return 500
    case '1day':
      return 180 // 약 6개월
  }
}

// 공통 history loader (UDF)
async function load(symbol: string, tf: Timeframe) {
  try {
    market.livePrice = null
    candles.value = []

    const meta = await getSymbolMeta(symbol)
    displayName.value = meta?.name ?? symbol

    const res = tfToResolution(tf)
    const now = await getServerTime()

    // 일봉은 /tradingview/history D 사용 (간단: getDailySeries 재사용)
    if (res === 'D') {
      const dailies = await getDailySeries(symbol, defaultLimit('1day'))
      candles.value = dailies.map((d) => ({
        time: d.time as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
      }))
    } else {
      // 분봉: 직접 UDF 호출 함수가 있다면 그걸 사용하도록 권장
      // 간단 구현: from/to 계산 후 /tradingview/history 호출 전용 유틸을 만든 경우를 가정
      // 여기서는 services에 getSeries(symbol, res, limit) 같은 헬퍼가 있다고 가정해도 됨.
      const { getSeries } = await import('@/services/marketIntraday.ts') // <— 분봉용 유틸(간단 헬퍼)로 분리 권장
      const points = await getSeries(symbol, res, defaultLimit(tf), now)
      candles.value = points.map((p) => ({
        time: p.time as UTCTimestamp,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume ?? 0,
      }))
    }

    if (candles.value.length > 0) {
      market.livePrice = candles.value[candles.value.length - 1].close
    }
  } catch (error) {
    console.error(`Failed to load data for symbol ${symbol}:`, error)
    ui.pushToast?.({
      type: 'error',
      message: `Unknown/unsupported symbol: ${symbol}. Fallback to 005930.`,
    })
    if (symbol !== '005930') {
      // 폴백: 삼성전자
      market.setSymbol('005930')
      // 재시도
      try {
        await load('005930', tf)
      } catch {}
    }
  }
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
