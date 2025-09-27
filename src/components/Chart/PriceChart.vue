<template>
  <div ref="container" class="h-full w-full"></div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
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

const props = defineProps<{
  data: ChartData[]
  timeframe: '1min' | '5min' | '15min' | '60min' | '1day'
}>()
const container = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null

onMounted(() => {
  if (!container.value) return
  chart = createChart(container.value, {
    layout: { background: { color: 'transparent' }, textColor: '#cbd5e1' },
    grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: getTimeScaleOptions(props.timeframe),
    watermark: {
      visible: false,
    },
  })

  candleSeries = chart.addCandlestickSeries()
  volumeSeries = chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '', // 볼륨 시리즈를 별도의 축에 표시
  })
  chart.priceScale('').applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 }, // 볼륨 차트의 높이 조절
  })

  updateChartData(props.data)

  const ro = new ResizeObserver(() =>
    chart?.applyOptions({
      width: container.value!.clientWidth,
      height: container.value!.clientHeight,
    }),
  )
  ro.observe(container.value)
  chart.timeScale().fitContent()
})

watch(
  () => props.timeframe,
  (newTimeframe) => chart?.timeScale().applyOptions(getTimeScaleOptions(newTimeframe)),
)

onBeforeUnmount(() => {
  chart?.remove()
  chart = null
  candleSeries = null
  volumeSeries = null
})

watch(() => props.data, updateChartData)

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
}

function getTimeScaleOptions(timeframe: typeof props.timeframe) {
  return {
    borderVisible: false,
    timeVisible: timeframe !== '1day', // '1day'가 아닐 때만 시간을 표시합니다.
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
  },
})
</script>
