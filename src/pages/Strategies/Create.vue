<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <h1 class="mb-4 text-xl font-semibold">Create Strategy</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <RuleBuilder :presets="presets" @save="onSave" />
      <section class="card">
        <ChatPanel />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import type { Strategy } from '@/types/Strategy'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const strategies = useStrategyStore()

// presets 추가 필수
const presets: Partial<Strategy>[] = []

async function onSave(payload: Partial<Strategy>) {
  try {
    await strategies.create(payload)
    router.push('/strategies')
  } catch (error) {
    console.error('Failed to save strategy:', error)
  }
}
</script>

<style scoped>
/* 필요하면 작성 */
</style>
