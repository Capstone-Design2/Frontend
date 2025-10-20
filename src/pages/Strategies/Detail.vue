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
    <div v-if="strategy" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{{ strategy.strategy_name }}</h1>
          <p class="text-slate-400">{{ strategy.description }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <RouterLink
            :to="{ name: 'strategies-edit', params: { id: strategy.strategy_id } }"
            class="btn-secondary"
            >Edit</RouterLink
          >
          <button @click="deleteStrategy" class="btn-danger">Delete</button>
        </div>
      </div>

      <div class="card" v-if="strategy.positionSizing">
        <div class="p-4">
          <h3 class="font-semibold">Position Sizing</h3>
          <p>
            {{
              strategy.positionSizing.mode === 'percent'
                ? 'Percentage of portfolio'
                : 'Fixed amount'
            }}:
            <strong>{{ strategy.positionSizing.value }}%</strong>
          </p>
        </div>
      </div>

      <div class="card">
        <div class="p-4">
          <h3 class="font-semibold">Indicators</h3>
          <ul class="list-inside list-disc">
            <li v-for="(indicator, key) in strategy.indicators" :key="key">
              <span v-if="indicator.enabled">
                <strong>{{ key.toUpperCase() }}</strong
                >: {{ Object.values(indicator).slice(1).join(', ') }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="card">
          <div class="p-4">
            <h3 class="font-semibold">Buy Rules</h3>
            <ul class="list-inside list-disc">
              <li v-for="rule in strategy.rules.buy" :key="rule">{{ rule }}</li>
            </ul>
          </div>
        </div>
        <div class="card">
          <div class="p-4">
            <h3 class="font-semibold">Sell Rules</h3>
            <ul class="list-inside list-disc">
              <li v-for="rule in strategy.rules.sell" :key="rule">{{ rule }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center">
      <h1 class="text-xl">Strategy not found.</h1>
      <RouterLink to="/strategies" class="text-blue-500 hover:underline"
        >Go back to strategies</RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const strategyStore = useStrategyStore()

// The store might not have the data if the user directly navigates to this page.
// Fetch if the store is empty.
onMounted(() => {
  if (strategyStore.strategies.length === 0) {
    strategyStore.fetchStrategies()
  }
})

const strategy = computed(() =>
  strategyStore.strategies.find((s) => s.strategy_id == props.id),
)

async function deleteStrategy() {
  if (confirm('Are you sure you want to delete this strategy?') && strategy.value?.strategy_id) {
    await strategyStore.remove(strategy.value.strategy_id)
    router.push({ name: 'strategies' })
  }
}
</script>