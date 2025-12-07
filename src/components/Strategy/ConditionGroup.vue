<template>
  <div class="space-y-4">
    <!-- Group Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex h-6 items-center rounded-full bg-slate-900 px-3 text-xs font-medium text-slate-300"
        >
          {{ title }}
        </span>
        <span class="text-[11px] text-slate-500">
          {{ mode === 'all' ? '모든 조건 충족 시' : '하나라도 충족 시' }} 트리거
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-400">Logic</span>
        <select
          v-model="mode"
          class="input w-32 bg-slate-900 border-slate-700 text-xs text-slate-200"
        >
          <option value="all">ALL (AND)</option>
          <option value="any">ANY (OR)</option>
        </select>
      </div>
    </div>

    <!-- Condition Blocks -->
    <div class="space-y-3">
      <div
        v-for="(c, idx) in list"
        :key="idx"
        class="relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow"
      >
        <!-- top label -->
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
              IF
            </span>
            <span class="text-slate-500">#{{ idx + 1 }}</span>
          </div>

          <button
            type="button"
            @click="remove(idx)"
            class="text-xs text-slate-400 transition hover:text-danger"
          >
            ✕ Remove
          </button>
        </div>

        <!-- 1차 조건 라인 -->
        <div class="grid gap-3 md:grid-cols-[1.4fr,1.2fr,1.4fr,1fr]">
          <!-- Indicator 1 -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Indicator 1</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.indicator1">
              <option value="price">price (기본: close)</option>
              <option value="close">close</option>
              <option value="open">open</option>
              <option value="high">high</option>
              <option value="low">low</option>
              <option value="volume">volume</option>
              <option v-for="i in indicatorOptions" :key="`ind1-${i}`" :value="i">
                {{ i }}
              </option>
            </select>

            <!-- MACD 서브 선택 -->
            <div v-if="isMacd(c.indicator1)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator1_macd_part"
              >
                <option value="">- (MACD)</option>
                <option value="hist">히스토그램</option>
                <option value="signal">시그널 선</option>
              </select>
            </div>

            <!-- BBANDS 서브 선택 -->
            <div v-if="isBb(c.indicator1)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator1_bb_part"
              >
                <option value="">- (Middle)</option>
                <option value="lower">Lower Band</option>
                <option value="upper">Upper Band</option>
              </select>
            </div>

            <!-- STOCH 서브 선택 -->
            <div v-if="isStoch(c.indicator1)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator1_stoch_part"
              >
                <option value="">- (%K 기본)</option>
                <option value="k">%K</option>
                <option value="d">%D</option>
              </select>
            </div>
          </div>

          <!-- Operator -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Operator</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.operator">
              <!-- 기본 비교 -->
              <option value="is_above">is above (&gt;)</option>
              <option value="is_below">is below (&lt;)</option>
              <option value="is_above_or_equal">is ≥ (above or equal)</option>
              <option value="is_below_or_equal">is ≤ (below or equal)</option>
              <option value="equals">equals (=)</option>
              <option value="not_equals">not equals (≠)</option>

              <!-- 크로스 -->
              <option value="crosses_above">crosses above</option>
              <option value="crosses_below">crosses below</option>

              <!-- 범위 -->
              <option value="between">between (range)</option>
              <option value="outside">outside (range)</option>

              <!-- 변화율 -->
              <option value="percent_change_above">percent change above</option>
              <option value="percent_change_below">percent change below</option>

              <!-- 연속 조건 -->
              <option value="consecutive_above">consecutive above</option>
              <option value="consecutive_below">consecutive below</option>
            </select>
          </div>

          <!-- Indicator 2 -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">indicator2</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.indicator2">
              <option value="price">price (기본: close)</option>
              <option value="close">close</option>
              <option value="open">open</option>
              <option value="high">high</option>
              <option value="low">low</option>
              <option value="volume">volume</option>
              <option v-for="i in indicatorOptions" :key="`ind2-${i}`" :value="i">
                {{ i }}
              </option>
              <option value="num">Number…</option>
            </select>

            <!-- MACD 서브 선택 -->
            <div v-if="c.indicator2 !== 'num' && isMacd(c.indicator2)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator2_macd_part"
              >
                <option value="">- (MACD)</option>
                <option value="hist">히스토그램</option>
                <option value="signal">시그널 선</option>
              </select>
            </div>

            <!-- BBANDS 서브 선택 -->
            <div v-if="c.indicator2 !== 'num' && isBb(c.indicator2)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator2_bb_part"
              >
                <option value="">- (Middle)</option>
                <option value="lower">Lower Band</option>
                <option value="upper">Upper Band</option>
              </select>
            </div>

            <!-- STOCH 서브 선택 -->
            <div v-if="c.indicator2 !== 'num' && isStoch(c.indicator2)" class="mt-1">
              <select
                class="input bg-slate-950 border-slate-700 text-xs"
                v-model="c.indicator2_stoch_part"
              >
                <option value="">- (%K 기본)</option>
                <option value="k">%K</option>
                <option value="d">%D</option>
              </select>
            </div>
          </div>

          <div class="space-y-1" v-if="c.indicator2 === 'num'">
            <label class="text-[11px] text-slate-400">
              Value
              <span v-if="isPercentChange(c.operator)" class="text-[10px] text-slate-500">
                (%)
              </span>
            </label>

            <input
              v-model="c._num"
              class="input bg-slate-950 border-slate-700"
              :placeholder="isPercentChange(c.operator) ? '5(5%)' : '30'"
            />
          </div>
        </div>

        <!-- 추가 설정: indicator3, lookback_period -->
        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <!-- indicator3 for between / outside -->
          <div v-if="c.operator === 'between' || c.operator === 'outside'" class="space-y-1">
            <label class="text-[11px] text-slate-400"> Second Boundary (indicator3) </label>
            <div class="grid grid-cols-[1.2fr,1fr] gap-2">
              <div class="space-y-1">
                <select class="input bg-slate-950 border-slate-700" v-model="c.indicator3">
                  <option value="">-- Select --</option>
                  <option value="price">price (기본: close)</option>
                  <option value="close">close</option>
                  <option value="open">open</option>
                  <option value="high">high</option>
                  <option value="low">low</option>
                  <option value="volume">volume</option>
                  <option v-for="i in indicatorOptions" :key="`ind3-${i}`" :value="i">
                    {{ i }}
                  </option>
                  <option value="num">Number…</option>
                </select>

                <!-- MACD 서브 선택 -->
                <div v-if="c.indicator3 !== 'num' && isMacd(c.indicator3)" class="mt-1">
                  <select
                    class="input bg-slate-950 border-slate-700 text-xs"
                    v-model="c.indicator3_macd_part"
                  >
                    <option value="">- (MACD)</option>
                    <option value="hist">히스토그램</option>
                    <option value="signal">시그널 선</option>
                  </select>
                </div>

                <!-- BBANDS 서브 선택 -->
                <div v-if="c.indicator3 !== 'num' && isBb(c.indicator3)" class="mt-1">
                  <select
                    class="input bg-slate-950 border-slate-700 text-xs"
                    v-model="c.indicator3_bb_part"
                  >
                    <option value="">- (Middle)</option>
                    <option value="lower">Lower Band</option>
                    <option value="upper">Upper Band</option>
                  </select>
                </div>

                <!-- STOCH 서브 선택 -->
                <div v-if="c.indicator2 !== 'num' && isStoch(c.indicator2)" class="mt-1">
                  <select
                    class="input bg-slate-950 border-slate-700 text-xs"
                    v-model="c.indicator2_stoch_part"
                  >
                    <option value="">- (%K 기본)</option>
                    <option value="k">%K</option>
                    <option value="d">%D</option>
                  </select>
                </div>
              </div>
              <div>
                <input
                  v-if="c.indicator3 === 'num'"
                  v-model="c._num3"
                  class="input bg-slate-950 border-slate-700"
                  placeholder="예: 70"
                />
                <div
                  v-else
                  class="flex h-10 items-center rounded border border-dashed border-slate-700/70 bg-slate-950 px-3 text-xs text-slate-500"
                >
                  인디케이터 / 가격 컬럼 사용
                </div>
              </div>
            </div>
          </div>

          <div v-if="isNeedLookback(c.operator)" class="space-y-1">
            <label class="text-[11px] text-slate-400"> Lookback Period (N) </label>
            <input
              type="number"
              min="1"
              class="input bg-slate-950 border-slate-700"
              v-model.number="c.lookback_period"
            />
            <p class="mt-1 text-[11px] text-slate-500">
              percent_change: N일 전과 비교, consecutive: N일 연속 조건
            </p>
          </div>
        </div>

        <div
          v-if="idx < list.length - 1"
          class="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500"
        >
          {{ mode === 'all' ? 'AND' : 'OR' }}
        </div>
      </div>
    </div>

    <!-- Add Button -->
    <button type="button" class="btn-outline text-sm" @click="add">+ Add Condition</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Indicator = {
  name: string
  type: string
  params: Record<string, any>
}

const props = defineProps<{
  modelValue: Record<string, any>
  indicatorOptions: string[]
  indicators: Indicator[]
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const BUILT_IN_SERIES = ['price', 'close', 'open', 'high', 'low', 'volume'] as const

function isMacd(name?: string) {
  if (!name) return false
  const ind = props.indicators.find((i) => i.name === name)
  return !!ind && ind.type.toUpperCase() === 'MACD'
}

function isBb(name?: string) {
  if (!name) return false
  const ind = props.indicators.find((i) => i.name === name)
  return !!ind && ind.type.toUpperCase() === 'BBANDS'
}

function isStoch(name?: string) {
  if (!name) return false
  const ind = props.indicators.find((i) => i.name === name)
  return !!ind && ind.type.toUpperCase() === 'STOCH'
}

function initMacdFromColumn(
  c: any,
  field: 'indicator1' | 'indicator2' | 'indicator3',
  partField: 'indicator1_macd_part' | 'indicator2_macd_part' | 'indicator3_macd_part',
) {
  const val = c[field]
  if (typeof val !== 'string') return
  if (!val.includes('.')) return

  const [root, col] = val.split('.', 2)
  if (!root || !col) return

  const ind = props.indicators.find((i) => i.name === root && i.type.toUpperCase() === 'MACD')
  if (!ind) return

  if (col.startsWith('MACDh_')) {
    c[partField] = 'hist'
  } else if (col.startsWith('MACDs_')) {
    c[partField] = 'signal'
  } else if (col.startsWith('MACD_')) {
    c[partField] = ''
  } else {
    return
  }

  c[field] = root
}

function initBbFromColumn(
  c: any,
  field: 'indicator1' | 'indicator2' | 'indicator3',
  partField: 'indicator1_bb_part' | 'indicator2_bb_part' | 'indicator3_bb_part',
) {
  const val = c[field]
  if (typeof val !== 'string') return
  if (!val.includes('.')) return

  const [root, col] = val.split('.', 2)
  const ind = props.indicators.find((i) => i.name === root && i.type.toUpperCase() === 'BBANDS')
  if (!ind) return

  if (col.startsWith('BBL_')) c[partField] = 'lower'
  else if (col.startsWith('BBU_')) c[partField] = 'upper'
  else if (col.startsWith('BBM_')) c[partField] = ''
  else return

  c[field] = root
}

function initStochFromColumn(
  c: any,
  field: 'indicator1' | 'indicator2' | 'indicator3',
  partField: 'indicator1_stoch_part' | 'indicator2_stoch_part' | 'indicator3_stoch_part',
) {
  const val = c[field]
  if (typeof val !== 'string') return
  if (!val.includes('.')) return

  const [root, col] = val.split('.', 2)
  const ind = props.indicators.find((i) => i.name === root && i.type.toUpperCase() === 'STOCH')
  if (!ind) return

  if (col.startsWith('STOCHk_')) c[partField] = 'k'
  else if (col.startsWith('STOCHd_')) c[partField] = 'd'
  else return

  c[field] = root
}

// mode (all/any)
const mode = computed({
  get: () => {
    const keys = Object.keys(props.modelValue || {})
    return (keys[0] as 'all' | 'any') || 'all'
  },
  set: (v: 'all' | 'any') => {
    emit('update:modelValue', { [v]: list.value })
  },
})

// 조건 리스트
const list = computed({
  get: () => {
    const current = (props.modelValue as any)[mode.value] || []
    for (const c of current) {
      if (!c._initialized) {
        initMacdFromColumn(c, 'indicator1', 'indicator1_macd_part')
        initMacdFromColumn(c, 'indicator2', 'indicator2_macd_part')
        initMacdFromColumn(c, 'indicator3', 'indicator3_macd_part')
        initBbFromColumn(c, 'indicator1', 'indicator1_bb_part')
        initBbFromColumn(c, 'indicator2', 'indicator2_bb_part')
        initBbFromColumn(c, 'indicator3', 'indicator3_bb_part')
        initStochFromColumn(c, 'indicator1', 'indicator1_stoch_part')
        initStochFromColumn(c, 'indicator2', 'indicator2_stoch_part')
        initStochFromColumn(c, 'indicator3', 'indicator3_stoch_part')

        if (c.indicator1_macd_part === undefined) c.indicator1_macd_part = ''
        if (c.indicator2_macd_part === undefined) c.indicator2_macd_part = ''
        if (c.indicator3_macd_part === undefined) c.indicator3_macd_part = ''

        // indicator2 숫자 처리
        if (typeof c.indicator2 === 'string') {
          const str = c.indicator2
          if (!BUILT_IN_SERIES.includes(str as any) && !props.indicatorOptions.includes(str)) {
            const maybeNum = Number(str)
            if (!isNaN(maybeNum)) {
              c._num = str
              c.indicator2 = 'num'
            }
          }
        }

        // indicator3 숫자 처리
        if (typeof c.indicator3 === 'string') {
          const str3 = c.indicator3
          if (
            str3 &&
            !BUILT_IN_SERIES.includes(str3 as any) &&
            !props.indicatorOptions.includes(str3)
          ) {
            const maybeNum3 = Number(str3)
            if (!isNaN(maybeNum3)) {
              c._num3 = str3
              c.indicator3 = 'num'
            }
          }
        }

        // lookback_period 기본값
        if (typeof c.lookback_period !== 'number' || c.lookback_period <= 0) {
          c.lookback_period = 1
        }

        c._initialized = true
      }
    }
    return current
  },
  set: (v) => {
    emit('update:modelValue', { [mode.value]: v })
  },
})

function add() {
  list.value.push({
    indicator1: 'price',
    operator: 'is_above',
    indicator2: 'price',
    indicator3: '',
    indicator1_macd_part: '',
    indicator2_macd_part: '',
    indicator3_macd_part: '',
    indicator1_bb_part: '',
    indicator2_bb_part: '',
    indicator3_bb_part: '',
    lookback_period: 1,
    _num: '',
    _num3: '',
    _initialized: true,
  })
}

function remove(idx: number) {
  list.value.splice(idx, 1)
}

function isPercentChange(op: string) {
  return op === 'percent_change_above' || op === 'percent_change_below'
}

function isNeedLookback(op: string) {
  return (
    op === 'percent_change_above' ||
    op === 'percent_change_below' ||
    op === 'consecutive_above' ||
    op === 'consecutive_below'
  )
}
</script>
