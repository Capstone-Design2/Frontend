<template>
  <div class="mx-auto max-w-5xl px-4 py-10 space-y-10">
    <!-- Back -->
    <RouterLink
      :to="{ name: 'strategies' }"
      class="text-sm text-slate-400 hover:text-slate-200 hover:underline inline-flex items-center"
    >
      ← Back to Strategies
    </RouterLink>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 py-10">Loading strategy...</div>

    <!-- Not Found -->
    <div v-else-if="!strategy" class="text-center space-y-3 py-10">
      <h1 class="text-xl font-semibold">Strategy not found</h1>
      <RouterLink to="/strategies" class="text-blue-500 hover:underline">
        Go back to strategies
      </RouterLink>
    </div>

    <!-- Strategy -->
    <div v-else class="space-y-12">
      <!-- HEADER -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ strategy.strategy_name }}</h1>
          <p class="text-slate-400 mt-1">
            {{ strategy.description || 'No description provided.' }}
          </p>
        </div>

        <div class="flex gap-3">
          <RouterLink
            :to="{ name: 'strategies-edit', params: { id: strategy.strategy_id } }"
            class="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition text-sm"
          >
            Edit
          </RouterLink>

          <button
            @click="onDelete"
            class="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition text-sm text-white"
          >
            Delete
          </button>
        </div>
      </header>

      <!-- INDICATORS SECTION -->
      <section class="card p-6 space-y-4">
        <h2 class="text-lg font-semibold text-white">사용된 Indicators</h2>

        <div v-if="strategy.rules.indicators.length" class="flex flex-wrap gap-2 mt-2">
          <div
            v-for="ind in strategy.rules.indicators"
            :key="ind.name"
            class="px-3 py-1 bg-slate-800 rounded-lg text-sm flex items-center gap-2"
          >
            <span class="text-indigo-400 font-semibold">{{ ind.type }}</span>
          </div>
        </div>

        <p v-else class="text-slate-400 text-sm">No indicators defined.</p>
      </section>

      <!-- BUY & SELL CONDITIONS -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- BUY -->
        <div class="card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-green-300">Buy Conditions</h2>

          <ConditionList
            :group="strategy.rules.buy_conditions"
            :indicators="strategy.rules.indicators"
            type="buy"
          />
        </div>

        <!-- SELL -->
        <div class="card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-red-300">Sell Conditions</h2>

          <ConditionList
            :group="strategy.rules.sell_conditions"
            :indicators="strategy.rules.indicators"
            type="sell"
          />
        </div>
      </section>

      <!-- TRADE SETTINGS -->
      <section class="card p-6 space-y-3">
        <h2 class="text-lg font-semibold text-white">Trade Settings</h2>

        <div class="bg-slate-800 p-4 rounded-lg">
          <p class="text-slate-300 text-sm">
            <span class="font-semibold text-indigo-400">Order Amount:</span>
            이 전략은 매 거래 시
            <span class="text-white font-semibold">
              {{ strategy.rules.trade_settings.order_amount_percent }}%</span
            >
            의 자산을 사용하여 포지션을 잡습니다.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'
import type { Strategy } from '@/types/Strategy'
import ConditionList from '@/components/Strategy/ConditionList.vue'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const store = useStrategyStore()

const strategy = ref<Strategy | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  const data = await store.fetchStrategyById(props.id)
  strategy.value = data ?? null
  isLoading.value = false
})

async function onDelete() {
  if (confirm('Delete this strategy?') && strategy.value?.strategy_id) {
    await store.remove(strategy.value.strategy_id)
    router.push({ name: 'strategies' })
  }
}
</script>

<style scoped>
.card {
  @apply rounded-xl bg-slate-900/60 border border-slate-700/60 shadow-lg;
}
</style>
