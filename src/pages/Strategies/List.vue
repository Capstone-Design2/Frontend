<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <!-- 로딩 인디케이터 -->
    <div v-if="strategyStore.isLoading" class="py-12 text-center text-slate-400">
      Loading strategies...
    </div>

    <!-- 전략 목록 또는 빈 상태 메시지 -->
    <div v-else>
      <!-- 전략이 있을 경우 목록을 보여줍니다. -->
      <div v-if="strategyStore.strategies.length > 0">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-xl font-semibold">My Strategies</h1>
          <RouterLink class="btn-primary" to="/strategies/create">Create Strategy</RouterLink>
        </div>
        <div class="space-y-4">
          <div
            v-for="strategy in strategyStore.strategies"
            :key="strategy.strategy_id"
            class="card p-4 transition hover:bg-slate-800 flex items-center justify-between"
          >
            <RouterLink
              :to="{ name: 'strategies-detail', params: { id: strategy.strategy_id } }"
              class="flex-1 cursor-pointer"
            >
              <div>
                <h2 class="font-semibold">{{ strategy.strategy_name }}</h2>
                <p class="text-sm text-slate-400">{{ strategy.description }}</p>
              </div>
            </RouterLink>
            <button
              type="button"
              @click.stop="deleteStrategy(strategy.strategy_id)"
              class="ml-3 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="삭제"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 전략이 없을 경우 안내 메시지를 보여줍니다. -->
      <EmptyState v-else title="No Strategies Found" description="Get started by creating your first strategy.">
        <RouterLink class="btn-primary" to="/strategies/create">Create Strategy</RouterLink>
      </EmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EmptyState from '@/components/Common/EmptyState.vue'
import { RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'

const strategyStore = useStrategyStore()
const error = ref<string | null>(null)

const deleteStrategy = async (strategyId: number | undefined) => {
  if (!strategyId) return

  if (!confirm('이 전략을 삭제하시겠습니까?')) {
    return
  }

  try {
    await strategyStore.remove(strategyId)
    // 성공 시 목록이 store에서 자동으로 업데이트됩니다
  } catch (err) {
    error.value = err instanceof Error ? err.message : '전략 삭제 중 오류가 발생했습니다.'
    console.error('Delete strategy error:', err)
  }
}

onMounted(() => {
  // 컴포넌트가 마운트될 때 전략 목록을 불러옵니다.
  strategyStore.fetchStrategies()
})
</script>
