<template>
  <div class="space-y-6">
    <div
      v-for="(c, idx) in items"
      :key="idx"
      class="relative p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
    >
      <p class="text-slate-200 text-sm leading-relaxed" v-html="formatCondition(c)"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Condition, Indicator } from '@/types/Strategy'

const props = defineProps<{
  items: Condition[]
  indicators: Indicator[]
}>()

function translateBaseValue(v: string): string {
  const map: Record<string, string> = {
    volume: '거래량',
    open: '시가',
    high: '고가',
    low: '저가',
    close: '종가',
  }
  return map[v] || v
}

function translateSpecialIndicator(v: string): string | null {
  // -------- MACD --------
  if (v.includes('MACD_')) return 'MACD 라인'
  if (v.includes('MACDs_')) return 'MACD 시그널선'
  if (v.includes('MACDh_')) return 'MACD 히스토그램'

  // -------- BBANDS --------
  if (v.includes('BBL_')) return '볼린저밴드 하단선'
  if (v.includes('BBM_')) return '볼린저밴드 중심선'
  if (v.includes('BBU_')) return '볼린저밴드 상단선'

  return null
}

function detectIndicatorObj(name: string): Indicator | null {
  if (props.indicators.some((i) => i.name === name))
    return props.indicators.find((i) => i.name === name) || null

  const root = name.split('.')[0]
  return props.indicators.find((i) => i.name === root) || null
}

function formatIndicator(name: string): string {
  // 숫자 그대로 반환
  if (!isNaN(Number(name))) {
    return `<span class="text-white font-semibold">${name}</span>`
  }

  // 가격 데이터
  const baseTranslated = translateBaseValue(name)
  if (baseTranslated !== name)
    return `<span class="text-white font-semibold">${baseTranslated}</span>`

  // MACD, BBANDS 세부 컬럼명 변환
  const special = translateSpecialIndicator(name)
  if (special) return `<span class="text-white font-semibold">${special}</span>`

  // Indicator 객체 매칭
  const indicator = detectIndicatorObj(name)
  if (!indicator) {
    return `<span class="text-white font-semibold">${name}</span>`
  }

  const type = indicator.type.toUpperCase()
  const p = indicator.params

  let koName = type
  let detail = ''

  switch (type) {
    case 'SMA':
      koName = '단순 이동평균'
      detail = `기간 ${p.length}`
      break

    case 'EMA':
      koName = '지수 이동평균'
      detail = `기간 ${p.length}`
      break

    case 'RSI':
      koName = 'RSI'
      detail = `기간 ${p.length}`
      break

    case 'MACD':
      koName = 'MACD'
      detail = `단기 ${p.fast} / 장기 ${p.slow} / 시그널 ${p.signal}`
      break

    case 'BBANDS':
      koName = '볼린저 밴드'
      detail = `기준선 ${p.length} / 표준편차 ${p.std}`
      break

    case 'ATR':
      koName = 'ATR'
      detail = `기간 ${p.length}`
      break

    case 'STOCH':
      koName = '스토캐스틱'
      detail = `K ${p.k} / D ${p.d} / 스무딩 ${p.smooth_k}`
      break
  }

  return `
    <span class="text-white font-semibold">(${koName}${detail})</span>
  `
}

const OP_MAP: Record<string, (c: Condition) => string> = {
  crosses_above: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}을(를)
    <span class="text-green-300 font-semibold">상향 돌파할 때</span>`,

  crosses_below: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}을(를)
    <span class="text-red-300 font-semibold">하향 돌파할 때</span>`,

  is_above: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}보다
    <span class="text-green-300 font-semibold">위에 있을 때</span>`,

  is_below: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}보다
    <span class="text-red-300 font-semibold">아래에 있을 때</span>`,

  is_above_or_equal: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)} 이상일 때`,

  is_below_or_equal: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)} 이하일 때`,

  equals: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}과(와)
    <span class="text-white font-semibold">동일할 때</span>`,

  not_equals: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}과(와)
    <span class="text-white font-semibold">다를 때</span>`,

  between: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}과
    ${formatIndicator(c.indicator3 ?? '')} 사이에 있을 때`,

  outside: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}과
    ${formatIndicator(c.indicator3 ?? '')} 범위 밖에 있을 때`,

  percent_change_above: (c) =>
    `${formatIndicator(c.indicator1)}의 변화율이 ${formatIndicator(c.indicator2)}보다 높을 때`,

  percent_change_below: (c) =>
    `${formatIndicator(c.indicator1)}의 변화율이 ${formatIndicator(c.indicator2)}보다 낮을 때`,

  consecutive_above: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}보다 위에서
    <span class="text-white font-semibold">${c.lookback_period}번 연속</span> 유지될 때`,

  consecutive_below: (c) =>
    `${formatIndicator(c.indicator1)}이(가) ${formatIndicator(c.indicator2)}보다 아래에서
    <span class="text-white font-semibold">${c.lookback_period}번 연속</span> 유지될 때`,
}

function formatCondition(c: Condition): string {
  const handler = OP_MAP[c.operator]
  if (!handler) return `<span class="text-red-400">지원되지 않는 조건</span>`

  let txt = handler(c)

  if (c.lookback_period && !txt.includes('연속')) {
    txt += ` <span class="text-slate-400">(최근 ${c.lookback_period}개 캔들 기준)</span>`
  }

  return txt
}
</script>
