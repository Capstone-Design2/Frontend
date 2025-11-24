<template>
  <form @submit.prevent="onSave" aria-label="Strategy Builder" class="space-y-6">
    <!-- 기존 전략 생성 UI -->
    <section class="card p-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="name" class="label">Name</label>
          <input
            id="name"
            v-model="form.strategy_name"
            class="input"
            required
            aria-required="true"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-danger">{{ errors.name }}</p>
        </div>
        <div>
          <label for="desc" class="label">Description</label>
          <input id="desc" v-model="form.description" class="input" />
        </div>
      </div>
    </section>

    <section class="card p-4">
      <h3 class="font-medium">Indicators</h3>
      <p class="mb-3 text-sm text-slate-400">
        Select a single indicator to include in the strategy.
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="flex items-center gap-2"
            ><input type="checkbox" v-model="smaToggle" aria-controls="sma-fields" /> SMA</label
          >
          <div v-if="smaToggle" id="sma-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="sma-period">SMA Period</label>
            <input id="sma-period" type="number" class="input" v-model.number="smaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.sma']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.sma'] }}
          </p>
        </div>
        <div>
          <label class="flex items-center gap-2"
            ><input type="checkbox" v-model="emaToggle" aria-controls="ema-fields" /> EMA</label
          >
          <div v-if="emaToggle" id="ema-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="ema-period">EMA Period</label>
            <input id="ema-period" type="number" class="input" v-model.number="emaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.ema']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.ema'] }}
          </p>
        </div>
        <div>
          <label class="flex items-center gap-2"
            ><input type="checkbox" v-model="rsiToggle" aria-controls="rsi-fields" /> RSI</label
          >
          <div v-if="rsiToggle" id="rsi-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="rsi-period">RSI Length</label>
            <input id="rsi-period" type="number" class="input" v-model.number="rsiPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.rsi']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.rsi'] }}
          </p>
        </div>
        <div>
          <label class="flex items-center gap-2"
            ><input type="checkbox" v-model="macdToggle" aria-controls="macd-fields" /> MACD</label
          >
          <div v-if="macdToggle" id="macd-fields" class="mt-2 grid grid-cols-6 items-center gap-2">
            <label class="label col-span-2" for="macd-fast">Fast</label>
            <input
              id="macd-fast"
              type="number"
              class="input col-span-4"
              v-model.number="macdFast"
              min="1"
            />
            <label class="label col-span-2" for="macd-slow">Slow</label>
            <input
              id="macd-slow"
              type="number"
              class="input col-span-4"
              v-model.number="macdSlow"
              min="2"
            />
            <label class="label col-span-2" for="macd-signal">Signal</label>
            <input
              id="macd-signal"
              type="number"
              class="input col-span-4"
              v-model.number="macdSignal"
              min="1"
            />
          </div>
          <p v-if="errors['indicators.macd']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.macd'] }}
          </p>
        </div>
        <div>
          <label class="flex items-center gap-2"
            ><input type="checkbox" v-model="bbandsToggle" aria-controls="bbands-fields" />
            Bollinger Bands</label
          >
          <div v-if="bbandsToggle" id="bbands-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="bbands-period">Period</label>
            <input
              id="bbands-period"
              type="number"
              class="input"
              v-model.number="bbandsPeriod"
              min="2"
            />
            <label class="label" for="bbands-dev">Deviation</label>
            <input
              id="bbands-dev"
              type="number"
              class="input"
              v-model.number="bbandsDev"
              step="0.1"
              min="0.1"
            />
          </div>
          <p v-if="errors['indicators.bbands']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.bbands'] }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="filteredStrategies.length > 0" class="card p-4">
      <h3 class="mb-3 font-medium">Recommended Strategies</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="mb-2 text-sm text-slate-300">Buy Conditions</p>
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="buy.smaCross" /> SMA crosses above price</label
          >
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="buy.rsiOversold" /> RSI below 30</label
          >
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="buy.macdBull" /> MACD bullish crossover</label
          >
        </div>
        <div>
          <p class="mb-2 text-sm text-slate-300">Sell Conditions</p>
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="sell.smaCross" /> SMA crosses below price</label
          >
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="sell.rsiOverbought" /> RSI above 70</label
          >
          <label class="mb-1 flex items-center gap-2"
            ><input type="checkbox" v-model="sell.macdBear" /> MACD bearish crossover</label
          >
        </div>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label for="sl" class="label">Stop-loss %</label>
          <input
            id="sl"
            type="number"
            class="input"
            v-model.number="form.rules.stopLoss"
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label for="tp" class="label">Take-profit %</label>
          <input
            id="tp"
            type="number"
            class="input"
            v-model.number="form.rules.takeProfit"
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label class="label" for="ps-mode">Position sizing</label>
          <div class="flex gap-2">
            <select
              id="ps-mode"
              class="input"
              v-model="form.positionSizing.mode"
              aria-label="Position sizing mode"
            >
              <option value="fixed">Fixed amount</option>
              <option value="percent">% Equity</option>
            </select>
            <input
              type="number"
              class="input"
              v-model.number="form.positionSizing.value"
              min="0"
              step="0.1"
              aria-label="Position sizing value"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="flex items-center justify-between">
      <div class="flex gap-2">
        <button type="button" class="btn-outline" @click="applyPreset('conservative')">
          Conservative
        </button>
        <button type="button" class="btn-outline" @click="applyPreset('neutral')">Neutral</button>
        <button type="button" class="btn-outline" @click="applyPreset('aggressive')">
          Aggressive
        </button>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="btn-primary" :disabled="!isValid">Save Strategy</button>
      </div>
    </section>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import type { Strategy } from '@/types/Strategy'
import { strategySchema, STRATEGY_SCHEMA_VERSION } from '@/utils/validation'

interface Emits {
  (e: 'save', value: Strategy): void
}
const emit = defineEmits<Emits>()

const props = defineProps<{ modelValue?: Strategy | null; presets: Partial<Strategy>[] }>()

const filteredStrategies = ref<Partial<Strategy>[]>([])
const selectedPreset = ref<Partial<Strategy> | null>(null)

type IndicatorKey = 'sma' | 'ema' | 'rsi' | 'macd' | 'bbands'
const indicatorOrder: IndicatorKey[] = ['sma', 'ema', 'rsi', 'macd', 'bbands']

function isIndicatorKey(value: string): value is IndicatorKey {
  return indicatorOrder.includes(value as IndicatorKey)
}

// simple reentrancy guard to avoid recursive reactive updates
let _updating = false
function withLock<T>(fn: () => T) {
  if (_updating) return undefined as unknown as T
  _updating = true
  try {
    return fn()
  } finally {
    _updating = false
  }
}

const defaults: Strategy = {
  schemaVersion: STRATEGY_SCHEMA_VERSION,
  strategy_name: '',
  description: '',
  indicators: {},
  rules: { buy: [], sell: [] },
  positionSizing: { mode: 'fixed', value: 0 },
}

const form = reactive<Strategy>({ ...defaults, ...(props.modelValue || {}) })

function removeIndicator(key: IndicatorKey) {
  if (key === 'sma') delete form.indicators.sma
  else if (key === 'ema') delete form.indicators.ema
  else if (key === 'rsi') delete form.indicators.rsi
  else if (key === 'macd') delete form.indicators.macd
  else if (key === 'bbands') delete form.indicators.bbands
}

function clearIndicators(except?: IndicatorKey) {
  indicatorOrder.forEach((key) => {
    if (key !== except) removeIndicator(key)
  })
}

function ensureSingleIndicator() {
  const active = indicatorOrder.filter((key) => form.indicators[key]?.enabled)
  if (active.length <= 1) return
  const [keep] = active
  withLock(() => clearIndicators(keep))
}

ensureSingleIndicator()

watch(
  form.indicators,
  (newIndicators) => {
    const activeIndicatorKeys = indicatorOrder.filter((key) => newIndicators[key]?.enabled)

    if (activeIndicatorKeys.length > 1) {
      const [keep] = activeIndicatorKeys
      withLock(() => clearIndicators(keep))
    }

    const currentActive = indicatorOrder.filter((key) => form.indicators[key]?.enabled)
    if (currentActive.length === 0) {
      filteredStrategies.value = []
      selectedPreset.value = null
      return
    }

    filteredStrategies.value = props.presets.filter((preset) => {
      if (!preset.indicators || !Array.isArray(preset.indicators)) return false
      const presetIndicatorTypes = preset.indicators
        .map((indicator) => (indicator.type === 'bollinger_bands' ? 'bbands' : indicator.type))
        .filter(isIndicatorKey)
      return presetIndicatorTypes.includes(currentActive[0])
    })
    selectedPreset.value = null
  },
  { deep: true },
)

function selectPreset(preset: Partial<Strategy>) {
  selectedPreset.value = preset
}

// toggles implemented as computed getters/setters to avoid separate reactive object and loops
const smaToggle = computed({
  get: () => !!form.indicators.sma,
  set: (v: boolean) => {
    if (v) form.indicators.sma = form.indicators.sma ?? { enabled: true, period: 20 }
    else delete form.indicators.sma
  },
})
const emaToggle = computed({
  get: () => !!form.indicators.ema,
  set: (v: boolean) => {
    if (v) form.indicators.ema = form.indicators.ema ?? { enabled: true, period: 20 }
    else delete form.indicators.ema
  },
})
const rsiToggle = computed({
  get: () => !!form.indicators.rsi,
  set: (v: boolean) => {
    if (v) form.indicators.rsi = form.indicators.rsi ?? { enabled: true, period: 14 }
    else delete form.indicators.rsi
  },
})
const macdToggle = computed({
  get: () => !!form.indicators.macd,
  set: (v: boolean) => {
    if (v)
      form.indicators.macd = form.indicators.macd ?? {
        enabled: true,
        fast: 12,
        slow: 26,
        signal: 9,
      }
    else delete form.indicators.macd
  },
})
const bbandsToggle = computed({
  get: () => !!form.indicators.bbands,
  set: (v: boolean) => {
    if (v) form.indicators.bbands = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
    else delete form.indicators.bbands
  },
})

// params proxies
const smaPeriod = computed({
  get: () => form.indicators.sma?.period ?? 20,
  set: (v: number) => {
    form.indicators.sma = form.indicators.sma ?? { enabled: true, period: v }
    form.indicators.sma.period = v
  },
})
const emaPeriod = computed({
  get: () => form.indicators.ema?.period ?? 20,
  set: (v: number) => {
    form.indicators.ema = form.indicators.ema ?? { enabled: true, period: v }
    form.indicators.ema.period = v
  },
})
const rsiPeriod = computed({
  get: () => form.indicators.rsi?.period ?? 14,
  set: (v: number) => {
    form.indicators.rsi = form.indicators.rsi ?? { enabled: true, period: v }
    form.indicators.rsi.period = v
  },
})
const macdFast = computed({
  get: () => form.indicators.macd?.fast ?? 12,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, fast: v }
  },
})
const macdSlow = computed({
  get: () => form.indicators.macd?.slow ?? 26,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, slow: v }
  },
})
const macdSignal = computed({
  get: () => form.indicators.macd?.signal ?? 9,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, signal: v }
  },
})
const bbandsPeriod = computed({
  get: () => form.indicators.bbands?.period ?? 20,
  set: (v: number) => {
    const cur = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
    form.indicators.bbands = { ...cur, enabled: true, period: v }
  },
})
const bbandsDev = computed({
  get: () => form.indicators.bbands?.dev ?? 2,
  set: (v: number) => {
    const cur = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
    form.indicators.bbands = { ...cur, enabled: true, dev: v }
  },
})

// rule toggles -> strings
const buy = reactive({ smaCross: false, rsiOversold: false, macdBull: false })
const sell = reactive({ smaCross: false, rsiOverbought: false, macdBear: false })

const errors = reactive<Record<string, string>>({})
const isValid = computed(() => {
  try {
    const parsed = strategySchema.parse(form)
    Object.keys(errors).forEach((k) => delete errors[k])
    return true
  } catch (e: any) {
    Object.keys(errors).forEach((k) => delete errors[k])
    for (const issue of e.issues || []) {
      const path = issue.path.join('.')
      errors[path || 'root'] = issue.message
    }
    return false
  }
})

// keep form.rules in sync with buy/sell toggles without mutating inside computed
watch(
  () => [
    buy.smaCross,
    buy.rsiOversold,
    buy.macdBull,
    sell.smaCross,
    sell.rsiOverbought,
    sell.macdBear,
  ],
  () => {
    if (_updating) return
    const buys: string[] = []
    if (buy.smaCross) buys.push('smaCrossPriceUp')
    if (buy.rsiOversold) buys.push('rsi<30')
    if (buy.macdBull) buys.push('macdBull')
    const sells: string[] = []
    if (sell.smaCross) sells.push('smaCrossPriceDown')
    if (sell.rsiOverbought) sells.push('rsi>70')
    if (sell.macdBear) sells.push('macdBear')
    // only update if changed to avoid triggering unnecessary reactive cycles
    const same = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v, i) => v === b[i])
    if (!same(form.rules.buy || [], buys)) withLock(() => (form.rules.buy = buys))
    if (!same(form.rules.sell || [], sells)) withLock(() => (form.rules.sell = sells))
  },
  { immediate: false },
)

function applyPreset(kind: 'conservative' | 'neutral' | 'aggressive') {
  return withLock(() => {
    if (kind === 'conservative') {
      smaToggle.value = true
      smaPeriod.value = 50
      rsiToggle.value = true
      rsiPeriod.value = 14
      buy.smaCross = true
      sell.smaCross = true
      form.positionSizing = { mode: 'percent', value: 5 }
      form.rules.stopLoss = 5
      form.rules.takeProfit = 10
    } else if (kind === 'neutral') {
      emaToggle.value = true
      emaPeriod.value = 21
      macdToggle.value = true
      macdFast.value = 12
      macdSlow.value = 26
      macdSignal.value = 9
      buy.macdBull = true
      sell.macdBear = true
      form.positionSizing = { mode: 'percent', value: 10 }
      form.rules.stopLoss = 7
      form.rules.takeProfit = 14
    } else {
      bbandsToggle.value = true
      bbandsPeriod.value = 20
      bbandsDev.value = 2
      rsiToggle.value = true
      rsiPeriod.value = 7
      buy.rsiOversold = true
      sell.rsiOverbought = true
      form.positionSizing = { mode: 'percent', value: 20 }
      form.rules.stopLoss = 8
      form.rules.takeProfit = 12
    }
  })
}

function onSave() {
  if (!isValid.value) return
  const parsed = strategySchema.parse(form)
  emit('save', parsed)
}
</script>
