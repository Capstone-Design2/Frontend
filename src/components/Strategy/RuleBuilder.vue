<template>
  <form @submit.prevent="onSave" aria-label="Strategy Builder" class="space-y-6">
    <section class="card p-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="name" class="label">Name</label>
          <input id="name" v-model="form.strategy_name" class="input" required aria-required="true" />
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
      <p class="mb-3 text-sm text-slate-400">Select a single indicator to include in the strategy.</p>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="smaToggle" aria-controls="sma-fields"/> SMA</label>
          <div v-if="smaToggle" id="sma-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="sma-period">SMA Period</label>
            <input id="sma-period" type="number" class="input" v-model.number="smaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.sma']" class="mt-1 text-xs text-danger">{{ errors['indicators.sma'] }}</p>
        </div>
        <div>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="emaToggle" aria-controls="ema-fields"/> EMA</label>
          <div v-if="emaToggle" id="ema-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="ema-period">EMA Period</label>
            <input id="ema-period" type="number" class="input" v-model.number="emaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.ema']" class="mt-1 text-xs text-danger">{{ errors['indicators.ema'] }}</p>
        </div>
        <div>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="rsiToggle" aria-controls="rsi-fields"/> RSI</label>
          <div v-if="rsiToggle" id="rsi-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="rsi-period">RSI Length</label>
            <input id="rsi-period" type="number" class="input" v-model.number="rsiPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.rsi']" class="mt-1 text-xs text-danger">{{ errors['indicators.rsi'] }}</p>
        </div>
        <div>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="macdToggle" aria-controls="macd-fields"/> MACD</label>
          <div v-if="macdToggle" id="macd-fields" class="mt-2 grid grid-cols-6 items-center gap-2">
            <label class="label col-span-2" for="macd-fast">Fast</label>
            <input id="macd-fast" type="number" class="input col-span-4" v-model.number="macdFast" min="1" />
            <label class="label col-span-2" for="macd-slow">Slow</label>
            <input id="macd-slow" type="number" class="input col-span-4" v-model.number="macdSlow" min="2" />
            <label class="label col-span-2" for="macd-signal">Signal</label>
            <input id="macd-signal" type="number" class="input col-span-4" v-model.number="macdSignal" min="1" />
          </div>
          <p v-if="errors['indicators.macd']" class="mt-1 text-xs text-danger">{{ errors['indicators.macd'] }}</p>
        </div>
        <div>
          <label class="flex items-center gap-2"><input type="checkbox" v-model="bbandsToggle" aria-controls="bbands-fields"/> Bollinger Bands</label>
          <div v-if="bbandsToggle" id="bbands-fields" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label" for="bbands-period">Period</label>
            <input id="bbands-period" type="number" class="input" v-model.number="bbandsPeriod" min="2" />
            <label class="label" for="bbands-dev">Deviation</label>
            <input id="bbands-dev" type="number" class="input" v-model.number="bbandsDev" step="0.1" min="0.1" />
          </div>
          <p v-if="errors['indicators.bbands']" class="mt-1 text-xs text-danger">{{ errors['indicators.bbands'] }}</p>
        </div>
      </div>
    </section>

    <section v-if="filteredStrategies.length > 0" class="card p-4">
      <h3 class="mb-3 font-medium">Recommended Strategies</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="(preset, index) in filteredStrategies" :key="index" class="card p-4 cursor-pointer" @click="selectPreset(preset)">
          <h4 class="font-semibold">{{ preset.strategy_name }}</h4>
          <p class="text-sm text-slate-400">{{ preset.description }}</p>
        </div>
      </div>
    </section>

    <section v-if="selectedPreset" class="card p-4">
      <h3 class="mb-3 font-medium">{{ selectedPreset.strategy_name }} Rules</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <h4 class="font-semibold">Buy Condition</h4>
          <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(selectedPreset.rules?.buy_condition, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold">Sell Condition</h4>
          <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(selectedPreset.rules?.sell_condition, null, 2) }}</pre>
        </div>
      </div>
    </section>

    <section class="flex items-center justify-between">
      <div class="flex gap-2">
        <button type="button" class="btn-outline" @click="applyPreset('conservative')">Conservative</button>
        <button type="button" class="btn-outline" @click="applyPreset('neutral')">Neutral</button>
        <button type="button" class="btn-outline" @click="applyPreset('aggressive')">Aggressive</button>
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

interface Emits { (e:'save', value: Strategy): void }
const emit = defineEmits<Emits>()

const props = defineProps<{ modelValue?: Strategy | null, presets: Partial<Strategy>[] }>()

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
  positionSizing: { mode: 'fixed', value: 0 }
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
  indicatorOrder.forEach(key => {
    if (key !== except) removeIndicator(key)
  })
}

function ensureSingleIndicator() {
  const active = indicatorOrder.filter(key => form.indicators[key]?.enabled)
  if (active.length <= 1) return
  const [keep] = active
  withLock(() => clearIndicators(keep))
}

ensureSingleIndicator()

watch(form.indicators, (newIndicators) => {
  const activeIndicatorKeys = indicatorOrder.filter(key => newIndicators[key]?.enabled)

  if (activeIndicatorKeys.length > 1) {
    const [keep] = activeIndicatorKeys
    withLock(() => clearIndicators(keep))
  }

  const currentActive = indicatorOrder.filter(key => form.indicators[key]?.enabled)
  if (currentActive.length === 0) {
    filteredStrategies.value = []
    selectedPreset.value = null
    return
  }

  filteredStrategies.value = props.presets.filter(preset => {
    if (!preset.indicators || !Array.isArray(preset.indicators)) return false
    const presetIndicatorTypes = preset.indicators
      .map(indicator => (indicator.type === 'bollinger_bands' ? 'bbands' : indicator.type))
      .filter(isIndicatorKey)
    return presetIndicatorTypes.includes(currentActive[0])
  })
  selectedPreset.value = null
}, { deep: true })

function selectPreset(preset: Partial<Strategy>) {
  selectedPreset.value = preset
}

// toggles implemented as computed getters/setters to avoid separate reactive object and loops
const smaToggle = computed({
  get: () => !!form.indicators.sma,
  set: (v: boolean) => withLock(() => {
    if (v) {
      clearIndicators('sma')
      const existing = form.indicators.sma ?? { enabled: true, period: 20 }
      form.indicators.sma = { ...existing, enabled: true }
    } else {
      removeIndicator('sma')
    }
  })
})
const emaToggle = computed({
  get: () => !!form.indicators.ema,
  set: (v: boolean) => withLock(() => {
    if (v) {
      clearIndicators('ema')
      const existing = form.indicators.ema ?? { enabled: true, period: 20 }
      form.indicators.ema = { ...existing, enabled: true }
    } else {
      removeIndicator('ema')
    }
  })
})
const rsiToggle = computed({
  get: () => !!form.indicators.rsi,
  set: (v: boolean) => withLock(() => {
    if (v) {
      clearIndicators('rsi')
      const existing = form.indicators.rsi ?? { enabled: true, period: 14 }
      form.indicators.rsi = { ...existing, enabled: true }
    } else {
      removeIndicator('rsi')
    }
  })
})
const macdToggle = computed({
  get: () => !!form.indicators.macd,
  set: (v: boolean) => withLock(() => {
    if (v) {
      clearIndicators('macd')
      const existing = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
      form.indicators.macd = { ...existing, enabled: true }
    } else {
      removeIndicator('macd')
    }
  })
})
const bbandsToggle = computed({
  get: () => !!form.indicators.bbands,
  set: (v: boolean) => withLock(() => {
    if (v) {
      clearIndicators('bbands')
      const existing = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
      form.indicators.bbands = { ...existing, enabled: true }
    } else {
      removeIndicator('bbands')
    }
  })
})

// params proxies
const smaPeriod = computed({ get:()=> form.indicators.sma?.period ?? 20, set:(v:number)=> { form.indicators.sma = form.indicators.sma ?? { enabled:true, period: v }; form.indicators.sma.period = v } })
const emaPeriod = computed({ get:()=> form.indicators.ema?.period ?? 20, set:(v:number)=> { form.indicators.ema = form.indicators.ema ?? { enabled:true, period: v }; form.indicators.ema.period = v } })
const rsiPeriod = computed({ get:()=> form.indicators.rsi?.period ?? 14, set:(v:number)=> { form.indicators.rsi = form.indicators.rsi ?? { enabled:true, period: v }; form.indicators.rsi.period = v } })
const macdFast = computed({
  get: () => form.indicators.macd?.fast ?? 12,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, fast: v }
  }
})
const macdSlow = computed({
  get: () => form.indicators.macd?.slow ?? 26,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, slow: v }
  }
})
const macdSignal = computed({
  get: () => form.indicators.macd?.signal ?? 9,
  set: (v: number) => {
    const cur = form.indicators.macd ?? { enabled: true, fast: 12, slow: 26, signal: 9 }
    form.indicators.macd = { ...cur, enabled: true, signal: v }
  }
})
const bbandsPeriod = computed({
  get: () => form.indicators.bbands?.period ?? 20,
  set: (v: number) => {
    const cur = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
    form.indicators.bbands = { ...cur, enabled: true, period: v }
  }
})
const bbandsDev = computed({
  get: () => form.indicators.bbands?.dev ?? 2,
  set: (v: number) => {
    const cur = form.indicators.bbands ?? { enabled: true, period: 20, dev: 2 }
    form.indicators.bbands = { ...cur, enabled: true, dev: v }
  }
})

const errors = reactive<Record<string,string>>({})
const isValid = computed(() => {
  try {
    const parsed = strategySchema.parse(form)
    Object.keys(errors).forEach(k=> delete errors[k])
    return true
  } catch (e: any) {
    Object.keys(errors).forEach(k=> delete errors[k])
    for (const issue of e.issues || []) {
      const path = issue.path.join('.')
      errors[path || 'root'] = issue.message
    }
    return false
  }
})



function applyPreset(kind: 'conservative'|'neutral'|'aggressive') {
  return withLock(() => {
    if (kind==='conservative') {
      smaToggle.value = true
      smaPeriod.value = 50
    } else if (kind==='neutral') {
      emaToggle.value = true
      emaPeriod.value = 21
    } else {
      bbandsToggle.value = true
      bbandsPeriod.value = 20
      bbandsDev.value = 2
    }
  })
}

function onSave() {
  if (!isValid.value) return
  const parsed = strategySchema.parse(form)
  emit('save', parsed)
}
</script>
