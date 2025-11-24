<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <h1 class="mb-4 text-xl font-semibold">Create Strategy</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <RuleBuilder @save="onSave" />
      <section class="card">
        <ChatPanel />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const strategies = useStrategyStore()

async function onSave(payload: any) {
  try {
    await strategies.create(payload)
    // 성공적으로 생성되면 목록 페이지로 이동합니다.
    router.push('/strategies')
  } catch (error) {
    // 에러 발생 시 사용자에게 알림을 표시할 수 있습니다.
    console.error('Failed to save strategy:', error)
  }
}
</script>
