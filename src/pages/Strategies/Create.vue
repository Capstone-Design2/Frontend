<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <h1 class="mb-4 text-xl font-semibold">Create Strategy</h1>
    <RuleBuilder @save="onSave" />
  </div>
</template>
<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const strategies = useStrategyStore()

function onSave(payload: any) {
  strategies.create(payload)
  router.push('/strategies')
}
</script>
