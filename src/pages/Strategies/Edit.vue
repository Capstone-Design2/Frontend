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

    <form v-if="model" @submit.prevent="onSave" class="space-y-4">
      <div class="card p-4">
        <div>
          <label for="name" class="label">Strategy Name</label>
          <input id="name" v-model="model.strategy_name" class="input" required />
        </div>
        <div class="mt-4">
          <label for="desc" class="label">Description</label>
          <input id="desc" v-model="model.description" class="input" />
        </div>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Save Changes</button>
      </div>
    </form>
    
    <div v-else class="card p-6 text-center text-slate-400">Loading strategy data...</div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'
import type { Strategy } from '@/types/Strategy'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const strategyStore = useStrategyStore()

const model = ref<Partial<Strategy> | null>(null)

onMounted(async () => {
  const fetchedStrategy = await strategyStore.fetchStrategyById(props.id)
  if (fetchedStrategy) {
    model.value = { ...fetchedStrategy }
  }
})

async function onSave() {
  console.log('Save button clicked. Current model:', model.value);

  if (!model.value?.strategy_id) {
    console.error('Strategy ID is missing. Cannot save.');
    return;
  }

  const updatePayload = {
    strategy_name: model.value.strategy_name,
    description: model.value.description,
  }

  console.log('Calling store.update with payload:', updatePayload);

  try {
    await strategyStore.update(model.value.strategy_id, updatePayload)
    console.log('Update successful!');
    router.push({ name: 'strategies-detail', params: { id: model.value.strategy_id } })
  } catch (error) {
    console.error('An error occurred during save:', error);
    // You can add a user-facing error message here, e.g., using a toast notification.
  }
}
</script>
