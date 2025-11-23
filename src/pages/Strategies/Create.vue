<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <h1 class="mb-4 text-xl font-semibold">Create Strategy</h1>
    <RuleBuilder @save="onSave" :presets="presets" />
  </div>
</template>

<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { getStrategyPresets } from '@/services/strategy/strategyApi'
import type { Strategy } from '@/types/Strategy'

const router = useRouter()
const strategies = useStrategyStore()
const presets = ref<Partial<Strategy>[]>([])

onMounted(async () => {
  try {
    presets.value = await getStrategyPresets()
  } catch (error) {
    console.error("Failed to fetch strategy presets:", error)
  }
})

async function onSave(payload: any) {
  try {
    await strategies.create(payload)
    // 성공적으로 생성되면 목록 페이지로 이동합니다.
    router.push('/strategies')
  } catch (error) {
    // 에러 발생 시 사용자에게 알림을 표시할 수 있습니다.
    console.error("Failed to save strategy:", error)
  }
}
</script>
