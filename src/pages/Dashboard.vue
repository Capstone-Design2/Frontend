<template>
  <div class="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pt-6 lg:grid-cols-12">
    <section class="lg:col-span-9">
      <div class="card relative overflow-hidden p-4">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold">
              {{ market.symbol }}
              <span class="ml-2 text-sm text-slate-400">{{ priceLabel }}</span>
            </h1>
            <p class="text-sm text-slate-400">
              Realtime feed via mocked WebSocket, fallback to Alpha Vantage polling
            </p>
          </div>
          <ChartToolbar v-model="timeframe" v-model:toolValue="tool" @clear="onClear" />
        </div>
        <div class="relative h-[420px]">
          <!-- 데이터가 로드된 후에만 차트를 렌더링합니다. -->
          <template v-if="candles.length > 0">
            <PriceChart ref="priceChart" :data="candles" :timeframe="timeframe" />
            <OverlayCanvas v-if="tool !== 'none'" :tool="tool as any" />
          </template>
          <!-- 데이터 로딩 중 메시지를 표시합니다. -->
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
            Some indices like KOSPI/KOSDAQ/DXY are not directly supported by Alpha Vantage.
          </p>
        </div>
      </div>
    </aside>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import PriceChart from '@/components/Chart/PriceChart.vue'
import OverlayCanvas from '@/components/Chart/OverlayCanvas.vue'
import ChartToolbar from '@/components/Chart/ChartToolbar.vue'
import MiniTicker from '@/components/Sidebar/MiniTicker.vue'
import { useMarketStore } from '@/stores/useMarketStore'
import { getDaily, getIntraday } from '@/services/alphaVantage'

const market = useMarketStore()
const timeframe = ref<'1min' | '5min' | '15min' | '60min' | '1day'>('1day')
const tool = ref<'none' | 'trendline' | 'hline' | 'fib'>('none')

const priceChart = ref<InstanceType<typeof PriceChart> | null>(null)
const candles = ref<any[]>([])
const priceLabel = computed(() => (market.livePrice ? `$${market.livePrice.toFixed(2)}` : ''))

async function load(newSymbol: string, newTimeframe: '1min' | '5min' | '15min' | '60min' | '1day') {
  try {
    market.livePrice = null // 이전 실시간 가격 정보를 초기화합니다.
    candles.value = [] // Clear previous data
    const data =
      newTimeframe === '1day'
        ? await getDaily(newSymbol, 'TIME_SERIES_DAILY')
        : await getIntraday(newSymbol, newTimeframe)

    candles.value = data.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }))

    // API로 불러온 데이터의 마지막 종가를 실시간 가격으로 설정합니다.
    if (candles.value.length > 0) {
      market.livePrice = candles.value[candles.value.length - 1].close
    }
    // market.subscribe(newSymbol) // 모의 소켓 구독 로직을 비활성화합니다.
  } catch (error) {
    console.error(`Failed to load data for symbol ${newSymbol}:`, error)
    // You can add a user-facing error message here, e.g., using a toast notification.
  }
}

function onClear() {
  window.dispatchEvent(new CustomEvent('overlay:close'))
}

function reload() {
  market.loadMiniTickers()
}

watch(timeframe, (newTimeframe) => {
  load(market.symbol, newTimeframe)
})

watch(
  () => market.symbol,
  (newSymbol) => {
    load(newSymbol, timeframe.value)
  },
)

onMounted(async () => {
  await load(market.symbol, timeframe.value)
  market.loadMiniTickers()
})
</script>
