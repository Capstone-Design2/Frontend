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
          <RouterLink
            v-for="strategy in strategyStore.strategies"
            :key="strategy.strategy_id"
            :to="{ name: 'strategies-detail', params: { id: strategy.strategy_id } }"
            class="card block p-4 transition hover:bg-slate-800"
          >
            <div>
              <h2 class="font-semibold">{{ strategy.strategy_name }}</h2>
              <p class="text-sm text-slate-400">{{ strategy.description }}</p>
            </div>
          </RouterLink>
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
import { onMounted } from 'vue'
import EmptyState from '@/components/Common/EmptyState.vue'
import { RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'

const strategyStore = useStrategyStore()

onMounted(() => {
  // 컴포넌트가 마운트될 때 전략 목록을 불러옵니다.
  strategyStore.fetchStrategies()
})
</script>
