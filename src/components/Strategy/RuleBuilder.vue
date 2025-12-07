<template>
  <form @submit.prevent="onSave" class="space-y-10 max-w-5xl mx-auto">
    <!-- 헤더 / 요약 -->
    <section class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-100">Strategy Builder</h1>
        <p class="text-sm text-slate-400">
          인디케이터를 추가하고, 조건을 조합해 나만의 자동매매 전략을 정의하세요.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="btn-outline text-xs"
          @click="showJsonPreview = !showJsonPreview"
        >
          {{ showJsonPreview ? 'Hide' : 'Show' }} JSON Preview
        </button>
        <button type="submit" class="btn-primary" :disabled="!isValid">Save Strategy</button>
      </div>
    </section>

    <!-- SECTION: 기본 정보 + Trade Settings -->
    <section class="card p-6 space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="i-ph-strategy-duotone text-xl"></span>
          <h2 class="text-lg font-semibold">Strategy Info</h2>
        </div>
        <span
          class="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
        >
          주문 비율
          <input
            type="number"
            class="w-16 rounded bg-slate-900 px-2 py-1 text-right text-xs outline-none"
            min="1"
            max="100"
            v-model.number="strategy.trade_settings.order_amount_percent"
          />
          %
        </span>
      </div>

      <div class="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div>
          <label class="label">Strategy Name</label>
          <input
            v-model="strategy.strategy_name"
            class="input"
            placeholder="예: SMA 골든크로스 전략"
            required
          />
        </div>
        <div>
          <label class="label">Description</label>
          <input
            v-model="description"
            class="input"
            placeholder="전략에 대한 간단한 설명을 적어주세요."
          />
        </div>
      </div>
    </section>

    <!-- SECTION: Indicators -->
    <section class="card p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="i-ph-chart-line-duotone text-xl"></span>
          <h2 class="text-lg font-semibold">Indicators</h2>
        </div>
        <div class="flex flex-wrap gap-2 text-xs text-slate-400">
          <span class="rounded-full bg-slate-800 px-2 py-1"
            >PRICE (close/open/high/low/volume)는 조건에서 직접 사용</span
          >
        </div>
      </div>

      <!-- 인디케이터 카드들 -->
      <div v-if="strategy.indicators.length" class="space-y-3">
        <div
          v-for="(ind, idx) in strategy.indicators"
          :key="idx"
          class="relative overflow-hidden rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-lg"
        >
          <!-- 왼쪽 컬러 바 -->
          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 to-sky-400"
          ></div>

          <div class="flex items-center justify-between gap-2 pl-3">
            <div class="flex items-center gap-2">
              <span
                class="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] uppercase text-slate-300"
              >
                #{{ idx + 1 }}
              </span>
              <span class="text-sm font-medium text-slate-100">
                {{ ind.name || 'Unnamed indicator' }}
              </span>
            </div>

            <button
              type="button"
              class="text-xs text-slate-400 transition hover:text-danger"
              @click="removeIndicator(idx)"
            >
              Remove
            </button>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-[1.1fr,1.4fr,1.5fr] pl-3">
            <!-- Type -->
            <div class="space-y-1">
              <label class="label text-xs">Type</label>
              <select v-model="ind.type" class="input" @change="onChangeIndicatorType(ind)">
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
                <option value="RSI">RSI</option>
                <option value="MACD">MACD</option>
                <option value="BBANDS">BBANDS</option>
                <option value="ATR">ATR</option>
                <option value="STOCH">STOCH</option>
              </select>
            </div>

            <!-- Alias -->
            <div class="space-y-1">
              <label class="label text-xs">Name</label>
              <input class="input" v-model="ind.name" :placeholder="suggestAliasPlaceholder(ind)" />
              <p class="mt-1 text-xs text-slate-500"></p>
            </div>

            <!-- Params  -->
            <div class="space-y-1">
              <label class="label text-xs">Params</label>

              <!-- length 기반 -->
              <div v-if="['SMA', 'EMA', 'RSI', 'ATR'].includes(ind.type)" class="flex gap-2">
                <div class="flex-1">
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>length</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.length" />
                </div>
              </div>

              <!-- MACD -->
              <div v-else-if="ind.type === 'MACD'" class="grid grid-cols-3 gap-2">
                <div>
                  <div class="flex items-center justify-center text-[11px] text-slate-400">
                    <span>fast</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.fast" />
                </div>
                <div>
                  <div class="flex items-center justify-center text-[11px] text-slate-400">
                    <span>slow</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.slow" />
                </div>
                <div>
                  <div class="flex items-center justify-center text-[11px] text-slate-400">
                    <span>signal</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.signal" />
                </div>
              </div>

              <!-- BBANDS -->
              <div v-else-if="ind.type === 'BBANDS'" class="grid grid-cols-2 gap-2">
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>length</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.length" />
                </div>
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>std</span>
                  </div>
                  <input type="number" step="0.1" class="input" v-model.number="ind.params.std" />
                </div>
              </div>

              <!-- STOCH -->
              <div v-else-if="ind.type === 'STOCH'" class="grid grid-cols-3 gap-2">
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>k</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.k" />
                </div>
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>d</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.d" />
                </div>
                <div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>smooth_k</span>
                  </div>
                  <input type="number" min="1" class="input" v-model.number="ind.params.smooth_k" />
                </div>
              </div>

              <!-- Fallback -->
              <div v-else class="text-xs text-slate-500">
                이 지표에 대한 파라미터 UI는 정의되지 않았습니다.JSON에서 직접 수정할 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
      <p
        v-else
        class="rounded-lg border border-dashed border-slate-700/70 bg-slate-900 px-4 py-3 text-sm text-slate-400"
      >
        아직 추가된 인디케이터가 없습니다. 아래 버튼으로 전략에 사용할 지표를 추가하세요.
      </p>

      <!-- Add buttons -->
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-outline" @click="addIndicator()">+ Indicator</button>
        <button type="button" class="btn-outline text-xs" @click="addPresetIndicator('SMA')">
          + SMA(20)
        </button>
        <button type="button" class="btn-outline text-xs" @click="addPresetIndicator('RSI')">
          + RSI(14)
        </button>
        <button type="button" class="btn-outline text-xs" @click="addPresetIndicator('MACD')">
          + MACD(12,26,9)
        </button>
      </div>
    </section>

    <!-- SECTION: Buy Conditions -->
    <section class="card p-6 space-y-6">
      <ConditionGroup
        title="Buy Conditions"
        v-model="strategy.buy_conditions"
        :indicatorOptions="indicatorOptions"
        :indicators="strategy.indicators"
      />
    </section>

    <!-- SECTION: Sell Conditions -->
    <section class="card p-6 space-y-6">
      <ConditionGroup
        title="Sell Conditions"
        v-model="strategy.sell_conditions"
        :indicatorOptions="indicatorOptions"
        :indicators="strategy.indicators"
      />
    </section>

    <!-- JSON PREVIEW -->
    <section v-if="showJsonPreview" class="card p-4">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-slate-200">Strategy JSON Preview</h3>
        <span class="text-[11px] text-slate-500">
          백테스트 API의 <code>strategy_definition</code> 그대로 출력
        </span>
      </div>
      <pre class="max-h-80 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-200"
        >{{ prettyJson }}
      </pre>
    </section>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import ConditionGroup from './ConditionGroup.vue'
import { validateStrategy } from '../../utils/strategyValidator'

type IndicatorType = string

type Indicator = {
  name: string
  type: IndicatorType
  params: Record<string, any>
}

type Operator =
  | 'is_above'
  | 'is_below'
  | 'is_above_or_equal'
  | 'is_below_or_equal'
  | 'equals'
  | 'not_equals'
  | 'crosses_above'
  | 'crosses_below'
  | 'between'
  | 'outside'
  | 'percent_change_above'
  | 'percent_change_below'
  | 'consecutive_above'
  | 'consecutive_below'

type Condition = {
  indicator1: string
  operator: Operator
  indicator2: string
  indicator3?: string
  lookback_period?: number
  // UI용 내부 필드
  _num?: string
  _num3?: string
  _initialized?: boolean
  // MACD 서브 선택
  indicator1_macd_part?: '' | 'hist' | 'signal'
  indicator2_macd_part?: '' | 'hist' | 'signal'
  indicator3_macd_part?: '' | 'hist' | 'signal'
  // BBANDS 서브 선택
  indicator1_bb_part?: '' | 'lower' | 'upper'
  indicator2_bb_part?: '' | 'lower' | 'upper'
  indicator3_bb_part?: '' | 'lower' | 'upper'
  // STOCH 서브 선택
  indicator1_stoch_part?: '' | 'k' | 'd'
  indicator2_stoch_part?: '' | 'k' | 'd'
  indicator3_stoch_part?: '' | 'k' | 'd'
}

type ConditionGroupValue = { all: Condition[]; any?: never } | { any: Condition[]; all?: never }

type StrategyDefinition = {
  strategy_name: string
  indicators: Indicator[]
  buy_conditions: ConditionGroupValue
  sell_conditions: ConditionGroupValue
  trade_settings: { order_amount_percent: number }
}

const strategy = reactive<StrategyDefinition>({
  strategy_name: '',
  indicators: [],
  buy_conditions: { all: [] },
  sell_conditions: { all: [] },
  trade_settings: { order_amount_percent: 100 },
})

const description = ref('')
const showJsonPreview = ref(false)

function defaultParamsByType(type: IndicatorType): Record<string, any> {
  switch (type) {
    case 'SMA':
    case 'EMA':
    case 'RSI':
      return { length: 14 }
    case 'ATR':
      return { length: 14 }
    case 'MACD':
      return { fast: 12, slow: 26, signal: 9 }
    case 'BBANDS':
      return { length: 20, std: 2 }
    case 'STOCH':
      return { k: 14, d: 3, smooth_k: 3 }
    default:
      return {}
  }
}

function addIndicator(type: IndicatorType = 'SMA') {
  strategy.indicators.push({
    name: '',
    type,
    params: defaultParamsByType(type),
  })
}

function addPresetIndicator(type: IndicatorType) {
  addIndicator(type)
  const idx = strategy.indicators.length - 1
  const ind = strategy.indicators[idx]
  if (type === 'SMA') ind.name = 'sma20'
  else if (type === 'RSI') ind.name = 'rsi14'
  else if (type === 'MACD') ind.name = 'macd'
}

function removeIndicator(idx: number) {
  strategy.indicators.splice(idx, 1)
}

function onChangeIndicatorType(ind: Indicator) {
  ind.params = defaultParamsByType(ind.type)
  if (!ind.name) {
    ind.name = suggestAliasPlaceholder(ind)
  }
}

function suggestAliasPlaceholder(ind: Indicator): string {
  switch (ind.type) {
    case 'SMA':
      return 'sma20'
    case 'EMA':
      return 'ema20'
    case 'RSI':
      return 'rsi14'
    case 'ATR':
      return 'atr14'
    case 'MACD':
      return 'macd'
    case 'BBANDS':
      return 'bb'
    case 'STOCH':
      return 'stoch'
    default:
      return 'indicator_alias'
  }
}

const indicatorOptions = computed(() => strategy.indicators.map((i) => i.name).filter((n) => !!n))
const isValid = computed(() => validateStrategy(strategy))

const BUILT_IN_SERIES = ['price', 'close', 'open', 'high', 'low', 'volume'] as const

function resolveIndicatorField(
  raw: string,
  part: '' | 'hist' | 'signal' | 'lower' | 'upper' | 'k' | 'd' | undefined,
): string {
  // 숫자면 그대로
  if (!isNaN(Number(raw))) return raw

  // price → close
  if (raw === 'price') return 'close'
  if (BUILT_IN_SERIES.includes(raw as any)) return raw

  const root = raw.split('.')[0]
  const ind = strategy.indicators.find((i) => i.name === root)
  if (!ind) return raw

  const type = ind.type.toUpperCase()

  // ----------------------------------
  // MACD
  // ----------------------------------
  if (type === 'MACD') {
    const p = ind.params
    const suf = `${p.fast}_${p.slow}_${p.signal}`

    if (!part || part === '') return `${root}.MACD_${suf}`
    if (part === 'hist') return `${root}.MACDh_${suf}`
    if (part === 'signal') return `${root}.MACDs_${suf}`
  }

  // ----------------------------------
  // BBANDS
  // ----------------------------------
  if (type === 'BBANDS') {
    const p = ind.params
    const suf = `${p.length}_${p.std}`

    if (!part || part === '') return `${root}.BBM_${suf}` // Middle band
    if (part === 'lower') return `${root}.BBL_${suf}` // Lower band
    if (part === 'upper') return `${root}.BBU_${suf}` // Upper band
  }

  // ----------------------------------
  // STOCH
  // ----------------------------------
  if (type === 'STOCH') {
    const p = ind.params
    const suf = `${p.k}_${p.d}_${p.smooth_k}`

    if (!part || part === '') return `${root}.STOCHk_${suf}`
    if (part === 'k') return `${root}.STOCHk_${suf}`
    if (part === 'd') return `${root}.STOCHd_${suf}`
  }

  return raw
}

function normalizeConditions(group: ConditionGroupValue): ConditionGroupValue {
  const key = 'all' in group ? 'all' : 'any'
  const list = (group as any)[key] as Condition[]

  const normalized = list.map((c) => {
    // indicator2 문자열/숫자 정리
    let indicator2 = c.indicator2
    if (indicator2 === 'num' && c._num && c._num.trim() !== '') {
      indicator2 = String(c._num.trim())
    }

    // indicator3 문자열/숫자 정리
    let indicator3: string | undefined = c.indicator3
    if (c.operator === 'between' || c.operator === 'outside') {
      if (c.indicator3 === 'num' && c._num3 && c._num3.trim() !== '') {
        indicator3 = String(c._num3.trim())
      }
    } else {
      indicator3 = undefined
    }

    // indicator 타입 확인
    const ind1 = strategy.indicators.find((i) => i.name === c.indicator1)
    const ind2 = strategy.indicators.find((i) => i.name === indicator2)
    const ind3 = strategy.indicators.find((i) => i.name === indicator3)

    const part1 =
      ind1?.type === 'MACD'
        ? c.indicator1_macd_part
        : ind1?.type === 'BBANDS'
          ? c.indicator1_bb_part
          : ind1?.type === 'STOCH'
            ? c.indicator1_stoch_part
            : undefined

    const part2 =
      ind2?.type === 'MACD'
        ? c.indicator2_macd_part
        : ind2?.type === 'BBANDS'
          ? c.indicator2_bb_part
          : ind2?.type === 'STOCH'
            ? c.indicator2_stoch_part
            : undefined

    const part3 =
      ind3?.type === 'MACD'
        ? c.indicator3_macd_part
        : ind3?.type === 'BBANDS'
          ? c.indicator3_bb_part
          : ind3?.type === 'STOCH'
            ? c.indicator3_stoch_part
            : undefined

    const base: any = {
      indicator1: resolveIndicatorField(c.indicator1, part1),
      operator: c.operator,
      indicator2: resolveIndicatorField(indicator2, part2),
    }

    if (indicator3 !== undefined && indicator3 !== '') {
      base.indicator3 = resolveIndicatorField(indicator3, part3)
    }

    // lookback 처리
    if (
      (c.operator === 'percent_change_above' ||
        c.operator === 'percent_change_below' ||
        c.operator === 'consecutive_above' ||
        c.operator === 'consecutive_below') &&
      typeof c.lookback_period === 'number'
    ) {
      base.lookback_period = c.lookback_period
    }

    return base
  })

  return { [key]: normalized } as any
}

const prettyJson = computed(() => {
  const payload: StrategyDefinition = {
    strategy_name: strategy.strategy_name,
    indicators: strategy.indicators,
    buy_conditions: normalizeConditions(strategy.buy_conditions),
    sell_conditions: normalizeConditions(strategy.sell_conditions),
    trade_settings: strategy.trade_settings,
  }
  return JSON.stringify(payload, null, 2)
})

const emit = defineEmits<{
  (e: 'save', value: StrategyDefinition): void
}>()

function onSave() {
  if (!isValid.value) return

  const payload = JSON.parse(
    JSON.stringify({
      strategy_name: strategy.strategy_name,
      description: description.value,
      rules: {
        strategy_name: strategy.strategy_name,
        indicators: strategy.indicators,
        buy_conditions: normalizeConditions(strategy.buy_conditions),
        sell_conditions: normalizeConditions(strategy.sell_conditions),
        trade_settings: strategy.trade_settings,
      },
    }),
  )

  emit('save', payload)
}
</script>

<style>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
