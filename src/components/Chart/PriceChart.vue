<template>
  <div ref="container" class="h-full w-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import {
  createChart,
  type IChartApi,
  type CandlestickData,
  type HistogramData,
  type ISeriesApi,
} from 'lightweight-charts'

interface ChartData extends CandlestickData {
  volume?: number
  value?: number // For histogram series
}

const emit = defineEmits<{
  (e: 'load-older', oldestTime: number): void
}>()

const props = defineProps<{
  data: ChartData[]
  timeframe: '1min' | '5min' | '15min' | '60min' | '1day'
}>()

const container = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null

let initialViewportApplied = false
let lastTf: typeof props.timeframe | null = null

// 타임프레임별 “처음에 보여줄 바 개수”
function barsToShow(tf: typeof props.timeframe): number {
  switch (tf) {
    case '1min':
      return 400 // 약 하루치
    case '5min':
      return 300
    case '15min':
      return 250
    case '60min':
      return 220
    case '1day':
      return 180 // 최근 6개월 정도
  }
}

function applyInitialViewport() {
  if (!chart) return
  const len = props.data.length
  if (len === 0) return

  const n = barsToShow(props.timeframe)
  const to = len - 1
  const from = Math.max(0, to - n)

  chart.timeScale().setVisibleLogicalRange({ from, to })
  initialViewportApplied = true
  lastTf = props.timeframe
}

onMounted(() => {
  if (!container.value) return
  chart = createChart(container.value, {
    layout: { background: { color: 'transparent' }, textColor: '#cbd5e1' },
    grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
    rightPriceScale: { borderVisible: false },
    timeScale: getTimeScaleOptions(props.timeframe),
    watermark: { visible: false },
  })

  candleSeries = chart.addCandlestickSeries()
  volumeSeries = chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  })
  chart.priceScale('').applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 },
  })

  updateChartData(props.data)

  const ro = new ResizeObserver(() =>
    chart?.applyOptions({
      width: container.value!.clientWidth,
      height: container.value!.clientHeight,
    }),
  )
  ro.observe(container.value)

  let lastEmitTs = 0
  chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
    if (!range) return
    const now = Date.now()
    if (now - lastEmitTs < 300) return // 300ms throttle
    const firstVisible = Number(range.from)
    const earliestLoaded = Number(props.data[0]?.time)
    if (!earliestLoaded || Number.isNaN(firstVisible)) return

    if (firstVisible < earliestLoaded + 60 * 60) {
      lastEmitTs = now
      emit('load-older', earliestLoaded)
    }
  })
})

watch(
  () => props.timeframe,
  async (newTimeframe) => {
    chart?.timeScale().applyOptions(getTimeScaleOptions(newTimeframe))

    initialViewportApplied = false
    await nextTick()
    applyInitialViewport()
  },
)

onBeforeUnmount(() => {
  chart?.remove()
  chart = null
  candleSeries = null
  volumeSeries = null
})

watch(
  () => props.data,
  (d) => updateChartData(d),
)

function updateChartData(data: ChartData[]) {
  if (!candleSeries || !volumeSeries) return

  const candleData: CandlestickData[] = data.map((d) => ({
    time: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }))

  const volumeData: HistogramData[] = data.map((d) => ({
    time: d.time,
    value: d.volume || 0,
    color: d.close >= d.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
  }))

  candleSeries.setData(candleData)
  volumeSeries.setData(volumeData)

  if (!initialViewportApplied || lastTf !== props.timeframe) {
    nextTick(() => applyInitialViewport())
  }
}

function getTimeScaleOptions(timeframe: typeof props.timeframe) {
  return {
    borderVisible: false,
    timeVisible: timeframe !== '1day',
  }
}

defineExpose({
  update(point: ChartData) {
    if (!candleSeries || !volumeSeries) return
    candleSeries.update(point)
    volumeSeries.update({
      time: point.time,
      value: point.volume || 0,
      color: point.close >= point.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    })

    chart?.timeScale().scrollToRealTime()
  },
})
</script>
