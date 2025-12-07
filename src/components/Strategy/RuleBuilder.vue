<template>
  <form @submit.prevent="onSave" aria-label="Strategy Builder" class="space-y-6">
    <!-- 기본 정보 -->
    <section class="card p-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="name" class="label">Name</label>
          <input id="name" v-model="form.name" class="input" required aria-required="true" />
          <p v-if="errors['name']" class="mt-1 text-xs text-danger">
            {{ errors['name'] }}
          </p>
        </div>
        <div>
          <label for="desc" class="label">Description</label>
          <input id="desc" v-model="form.description" class="input" />
        </div>
      </div>
    </section>

    <!-- Indicators -->
    <section class="card p-4">
      <h3 class="font-medium">Indicators</h3>
      <p class="mb-3 text-sm text-slate-400">
        Select a single indicator to include in the strategy.
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <!-- SMA -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="smaEnabled" /> SMA
          </label>
          <div v-if="smaEnabled" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label">SMA Period</label>
            <input type="number" class="input" v-model.number="smaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.sma']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.sma'] }}
          </p>
        </div>

        <!-- EMA -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="emaEnabled" /> EMA
          </label>
          <div v-if="emaEnabled" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label">EMA Period</label>
            <input type="number" class="input" v-model.number="emaPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.ema']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.ema'] }}
          </p>
        </div>

        <!-- RSI -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="rsiEnabled" /> RSI
          </label>
          <div v-if="rsiEnabled" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label">RSI</label>
            <input type="number" class="input" v-model.number="rsiPeriod" min="2" />
          </div>
          <p v-if="errors['indicators.rsi']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.rsi'] }}
          </p>
        </div>

        <!-- MACD -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="macdEnabled" /> MACD
          </label>
          <div v-if="macdEnabled" class="mt-2 grid grid-cols-6 items-center gap-2">
            <label class="label col-span-2">Fast</label>
            <input type="number" class="input col-span-4" v-model.number="macdFast" />

            <label class="label col-span-2">Slow</label>
            <input type="number" class="input col-span-4" v-model.number="macdSlow" />

            <label class="label col-span-2">Signal</label>
            <input type="number" class="input col-span-4" v-model.number="macdSignal" />
          </div>
          <p v-if="errors['indicators.macd']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.macd'] }}
          </p>
        </div>

        <!-- BBands -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="bbandsEnabled" /> Bollinger Bands
          </label>
          <div v-if="bbandsEnabled" class="mt-2 grid grid-cols-2 gap-2">
            <label class="label">Period</label>
            <input type="number" class="input" v-model.number="bbandsPeriod" />

            <label class="label">Deviation</label>
            <input type="number" class="input" step="0.1" v-model.number="bbandsDev" />
          </div>
          <p v-if="errors['indicators.bbands']" class="mt-1 text-xs text-danger">
            {{ errors['indicators.bbands'] }}
          </p>
        </div>
      </div>
    </section>

    <!-- Recommended Strategies -->
    <section v-if="filteredStrategies.length > 0" class="card p-4">
      <h3 class="mb-3 font-medium">Recommended Strategies</h3>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="mb-2 text-sm text-slate-300">Buy Conditions</p>
          <label class="flex gap-2"
            ><input type="checkbox" v-model="buy.smaCross" /> SMA crosses above price</label
          >
          <label class="flex gap-2"
            ><input type="checkbox" v-model="buy.rsiOversold" /> RSI below 30</label
          >
          <label class="flex gap-2"
            ><input type="checkbox" v-model="buy.macdBull" /> MACD bullish crossover</label
          >
        </div>

        <div>
          <p class="mb-2 text-sm text-slate-300">Sell Conditions</p>
          <label class="flex gap-2"
            ><input type="checkbox" v-model="sell.smaCross" /> SMA crosses below price</label
          >
          <label class="flex gap-2"
            ><input type="checkbox" v-model="sell.rsiOverbought" /> RSI above 70</label
          >
          <label class="flex gap-2"
            ><input type="checkbox" v-model="sell.macdBear" /> MACD bearish crossover</label
          >
        </div>
      </div>

      <!-- stopLoss / takeProfit / positionSizing -->
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label class="label">Stop-loss %</label>
          <input type="number" class="input" v-model.number="form.rules.stopLoss" />
        </div>

        <div>
          <label class="label">Take-profit %</label>
          <input type="number" class="input" v-model.number="form.rules.takeProfit" />
        </div>

        <div>
          <label class="label">Position sizing</label>
          <div class="flex gap-2">
            <select class="input" v-model="form.positionSizing.mode">
              <option value="fixed">Fixed</option>
              <option value="percent">% Equity</option>
            </select>
            <input type="number" class="input" v-model.number="form.positionSizing.value" />
          </div>
        </div>
      </div>
    </section>

    <!-- 버튼 -->
    <section class="flex items-center justify-between">
      <div class="flex gap-2"></div>
      <button type="submit" class="btn-primary" :disabled="!isValid">Save Strategy</button>
    </section>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import { strategySchema, STRATEGY_SCHEMA_VERSION, type StrategyInput } from '@/utils/validation'

const emit = defineEmits<{ (e: 'save', value: StrategyInput): void }>()

const props = defineProps<{
  modelValue?: StrategyInput | null
  presets: Partial<StrategyInput>[]
}>()

/* ------------------ form (camelCase) ------------------ */
const form = reactive<StrategyInput>({
  schemaVersion: STRATEGY_SCHEMA_VERSION,
  name: '',
  description: '',
  indicators: {},
  rules: { buy: [], sell: [], stopLoss: 0, takeProfit: 0 },
  positionSizing: { mode: 'fixed', value: 0 },
  ...(props.modelValue || {}),
})

/* ------------------ indicator helpers ------------------ */
type IndicatorType = 'sma' | 'ema' | 'rsi' | 'macd' | 'bbands'

function defaultIndicator(t: IndicatorType) {
  return (
    {
      sma: { enabled: true, period: 20 },
      ema: { enabled: true, period: 20 },
      rsi: { enabled: true, period: 14 },
      macd: { enabled: true, fast: 12, slow: 26, signal: 9 },
      bbands: { enabled: true, period: 20, dev: 2 },
    }[t] || { enabled: true }
  )
}

function setSingleIndicator(t: IndicatorType | null) {
  if (!t) {
    form.indicators = {}
    return
  }
  form.indicators = { [t]: defaultIndicator(t) } as any
}

/* ------------------ indicator toggles ------------------ */
const smaEnabled = computed({
  get: () => !!form.indicators.sma,
  set: (v) => (v ? setSingleIndicator('sma') : setSingleIndicator(null)),
})
const emaEnabled = computed({
  get: () => !!form.indicators.ema,
  set: (v) => (v ? setSingleIndicator('ema') : setSingleIndicator(null)),
})
const rsiEnabled = computed({
  get: () => !!form.indicators.rsi,
  set: (v) => (v ? setSingleIndicator('rsi') : setSingleIndicator(null)),
})
const macdEnabled = computed({
  get: () => !!form.indicators.macd,
  set: (v) => (v ? setSingleIndicator('macd') : setSingleIndicator(null)),
})
const bbandsEnabled = computed({
  get: () => !!form.indicators.bbands,
  set: (v) => (v ? setSingleIndicator('bbands') : setSingleIndicator(null)),
})

/* ------------------ indicator params ------------------ */
const smaPeriod = computed({
  get: () => form.indicators.sma?.period ?? 20,
  set: (v) => {
    if (!form.indicators.sma) setSingleIndicator('sma')
    form.indicators.sma!.period = v
  },
})
const emaPeriod = computed({
  get: () => form.indicators.ema?.period ?? 20,
  set: (v) => {
    if (!form.indicators.ema) setSingleIndicator('ema')
    form.indicators.ema!.period = v
  },
})
const rsiPeriod = computed({
  get: () => form.indicators.rsi?.period ?? 14,
  set: (v) => {
    if (!form.indicators.rsi) setSingleIndicator('rsi')
    form.indicators.rsi!.period = v
  },
})
const macdFast = computed({
  get: () => form.indicators.macd?.fast ?? 12,
  set: (v) => {
    if (!form.indicators.macd) setSingleIndicator('macd')
    form.indicators.macd!.fast = v
  },
})
const macdSlow = computed({
  get: () => form.indicators.macd?.slow ?? 26,
  set: (v) => {
    if (!form.indicators.macd) setSingleIndicator('macd')
    form.indicators.macd!.slow = v
  },
})
const macdSignal = computed({
  get: () => form.indicators.macd?.signal ?? 9,
  set: (v) => {
    if (!form.indicators.macd) setSingleIndicator('macd')
    form.indicators.macd!.signal = v
  },
})
const bbandsPeriod = computed({
  get: () => form.indicators.bbands?.period ?? 20,
  set: (v) => {
    if (!form.indicators.bbands) setSingleIndicator('bbands')
    form.indicators.bbands!.period = v
  },
})
const bbandsDev = computed({
  get: () => form.indicators.bbands?.dev ?? 2,
  set: (v) => {
    if (!form.indicators.bbands) setSingleIndicator('bbands')
    form.indicators.bbands!.dev = v
  },
})

/* ------------------ buy/sell rules ------------------ */
const buy = reactive({ smaCross: false, rsiOversold: false, macdBull: false })
const sell = reactive({ smaCross: false, rsiOverbought: false, macdBear: false })

watch(
  () => ({ ...buy, ...sell }),
  () => {
    form.rules.buy = []
    if (buy.smaCross) form.rules.buy.push('smaCrossPriceUp')
    if (buy.rsiOversold) form.rules.buy.push('rsi<30')
    if (buy.macdBull) form.rules.buy.push('macdBull')

    form.rules.sell = []
    if (sell.smaCross) form.rules.sell.push('smaCrossPriceDown')
    if (sell.rsiOverbought) form.rules.sell.push('rsi>70')
    if (sell.macdBear) form.rules.sell.push('macdBear')
  },
)

/* ------------------ validation ------------------ */
const errors = reactive<Record<string, string>>({})
const isValid = ref(false)

watch(
  () => form,
  (value) => {
    try {
      strategySchema.parse(value)
      Object.keys(errors).forEach((k) => delete errors[k])
      isValid.value = true
    } catch (err: any) {
      Object.keys(errors).forEach((k) => delete errors[k])
      for (const issue of err.issues || []) {
        const key = issue.path.join('.')
        errors[key] = issue.message
      }
      isValid.value = false
    }
  },
  { deep: true, immediate: true },
)

/* ------------------ presets ------------------ */
const filteredStrategies = ref<Partial<StrategyInput>[]>([])

watch(
  () => (Object.entries(form.indicators)[0]?.[0] as IndicatorType | undefined) ?? null,
  (active) => {
    if (!active) {
      filteredStrategies.value = []
      return
    }
    filteredStrategies.value = props.presets.filter((preset) => {
      const arr = (preset as any).indicators
      if (!Array.isArray(arr)) return false
      const mapped = arr.map((i: any) => (i.type === 'bollinger_bands' ? 'bbands' : i.type))
      return mapped.includes(active)
    })
  },
  { immediate: true },
)

/* ------------------ presets 버튼 ------------------ */
function applyPreset(kind: 'conservative' | 'neutral' | 'aggressive') {
  if (kind === 'conservative') {
    setSingleIndicator('sma')
    smaPeriod.value = 50
    buy.smaCross = true
    sell.smaCross = true
    form.positionSizing = { mode: 'percent', value: 5 }
    form.rules.stopLoss = 5
    form.rules.takeProfit = 10
  } else if (kind === 'neutral') {
    setSingleIndicator('ema')
    emaPeriod.value = 21
    macdEnabled.value = true
    buy.macdBull = true
    sell.macdBear = true
    form.positionSizing = { mode: 'percent', value: 10 }
    form.rules.stopLoss = 7
    form.rules.takeProfit = 14
  } else {
    setSingleIndicator('bbands')
    bbandsPeriod.value = 20
    bbandsDev.value = 2
    rsiEnabled.value = true
    rsiPeriod.value = 7
    buy.rsiOversold = true
    sell.rsiOverbought = true
    form.positionSizing = { mode: 'percent', value: 20 }
    form.rules.stopLoss = 8
    form.rules.takeProfit = 12
  }
}

function onSave() {
  if (!isValid.value) return
  const parsed = strategySchema.parse(form)
  emit('save', parsed)
}
</script>
