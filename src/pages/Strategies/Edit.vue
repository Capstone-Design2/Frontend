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
    <h1 class="mb-4 text-xl font-semibold">Edit Strategy</h1>
    <RuleBuilder v-if="model" :model-value="model" @save="onSave" />
    <div v-else class="card p-6 text-center text-slate-400">Loading strategy data...</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import type { Strategy } from '@/types/Strategy'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const strategyStore = useStrategyStore()

// Create a ref for the model to avoid directly mutating the store's state via RuleBuilder
const model = ref<Strategy | null>(null)

// Fetch strategies if not already in the store
onMounted(async () => {
  if (strategyStore.strategies.length === 0) {
    await strategyStore.fetchStrategies()
  }
  // Find the specific strategy and clone it for local editing
  const strategyToEdit = strategyStore.strategies.find((s) => s.strategy_id == props.id)
  if (strategyToEdit) {
    model.value = JSON.parse(JSON.stringify(strategyToEdit)) // Deep copy
  }
})

async function onSave(payload: any) {
  if (!model.value?.strategy_id) return
  await strategyStore.update(model.value.strategy_id, payload)
  router.push({ name: 'strategies' })
}
</script>