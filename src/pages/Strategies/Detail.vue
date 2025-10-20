<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <div class="mb-4">
      <RouterLink
        :to="{ name: 'strategies' }"
        class="inline-flex items-center text-sm text-slate-400 hover:underline"
      >
        &larr; Back to Strategies
      </RouterLink>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center text-slate-400">Loading strategy...</div>

    <!-- Strategy Details -->
    <div v-else-if="strategy" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{{ strategy.strategy_name }}</h1>
          <p class="text-slate-400">{{ strategy.description }}</p>
        </div>
        <div class="flex items-center space-x-2">
                    <RouterLink
            :to="{ name: 'strategies-edit', params: { id: strategy.strategy_id } }"
            class="btn-secondary"
            >Edit</RouterLink>
          <button @click="onDelete" class="btn-danger">Delete</button>
        </div>
      </div>

      <!-- Indicators -->
      <div class="card">
        <div class="p-4">
          <h3 class="font-semibold">Indicators Used</h3>
          <div v-if="usedIndicators.size > 0" class="mt-2 flex flex-wrap gap-2">
            <span v-for="indicator in usedIndicators" :key="indicator" class="rounded-full bg-slate-700 px-3 py-1 text-sm">
              {{ indicator }}
            </span>
          </div>
          <p v-else class="mt-2 text-sm text-slate-400">No indicators found in rules.</p>
        </div>
      </div>

      <!-- Buy & Sell Conditions -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="card">
          <div class="p-4">
            <h3 class="font-semibold">Buy Condition</h3>
            <div v-if="strategy.rules?.buy_condition" class="mt-2 space-y-4">
              <div>
                <h4 class="font-medium text-slate-300">진입 (Entry)</h4>
                <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(strategy.rules.buy_condition.entry, null, 2) }}</pre>
              </div>
              <div>
                <h4 class="font-medium text-slate-300">청산 (Exit)</h4>
                <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(strategy.rules.buy_condition.exit, null, 2) }}</pre>
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-slate-400">No buy condition data.</p>
          </div>
        </div>
        <div class="card">
          <div class="p-4">
            <h3 class="font-semibold">Sell Condition</h3>
            <div v-if="strategy.rules?.sell_condition" class="mt-2 space-y-4">
              <div>
                <h4 class="font-medium text-slate-300">진입 (Entry)</h4>
                <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(strategy.rules.sell_condition.entry, null, 2) }}</pre>
              </div>
              <div>
                <h4 class="font-medium text-slate-300">청산 (Exit)</h4>
                <pre class="mt-1 overflow-x-auto rounded bg-slate-800 p-3 text-xs">{{ JSON.stringify(strategy.rules.sell_condition.exit, null, 2) }}</pre>
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-slate-400">No sell condition data.</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Not Found Message -->
    <div v-else class="text-center">
      <h1 class="text-xl">Strategy not found.</h1>
      <RouterLink to="/strategies" class="text-blue-500 hover:underline"
        >Go back to strategies</RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'
import type { Strategy } from '@/types/Strategy'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const strategyStore = useStrategyStore()

const strategy = ref<Strategy | null>(null)
const isLoading = ref(true)

// Extracts indicator strings (like 'bb.20.middle') from the rules object
const usedIndicators = computed(() => {
  const indicators = new Set<string>()
  if (!strategy.value?.rules) return indicators

  function parseCondition(condition: any) {
    if (!condition) return
    if (Array.isArray(condition)) {
      condition.forEach(parseCondition)
    } else if (typeof condition === 'object') {
      if (condition.lhs && typeof condition.lhs === 'string' && condition.lhs.includes('.')) indicators.add(condition.lhs)
      if (condition.rhs && typeof condition.rhs === 'string' && condition.rhs.includes('.')) indicators.add(condition.rhs)
      // Recursively parse nested conditions
      if (condition.condition) parseCondition(condition.condition)
      if (condition.entry) parseCondition(condition.entry)
      if (condition.exit) parseCondition(condition.exit)
    }
  }

  parseCondition(strategy.value.rules.buy_condition)
  parseCondition(strategy.value.rules.sell_condition)

  return indicators
})

onMounted(async () => {
  isLoading.value = true
  const fetched = await strategyStore.fetchStrategyById(props.id)
  if (fetched) {
    strategy.value = fetched
  }
  isLoading.value = false
})

async function onDelete() {
  if (confirm('Are you sure you want to delete this strategy?') && strategy.value?.strategy_id) {
    await strategyStore.remove(strategy.value.strategy_id)
    router.push({ name: 'strategies' })
  }
}
</script>