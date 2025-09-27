<template>
  <div class="mx-auto max-w-5xl px-4 pt-6" v-if="model">
    <h1 class="mb-4 text-xl font-semibold">Edit Strategy</h1>
    <RuleBuilder :model-value="model" @save="onSave" />
  </div>
  <div v-else class="px-4 pt-6">
    <div class="card p-6">Loading…</div>
  </div>
</template>
<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute(); const router = useRouter()
const strategies = useStrategyStore()
const model = computed(()=> strategies.byId(route.params.id as string) || null)

function onSave(payload: any) {
  strategies.update(route.params.id as string, payload)
  router.push('/strategies')
}
</script>
