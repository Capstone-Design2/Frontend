<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <!-- 전략이 있을 경우 목록을 보여줍니다. -->
    <div v-if="strategyStore.strategies.length > 0">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">My Strategies</h1>
        <RouterLink class="btn-primary" to="/strategies/create">Create Strategy</RouterLink>
      </div>
      <div class="space-y-4">
        <RouterLink
          v-for="strategy in strategyStore.strategies"
          :key="strategy.id"
          :to="{ name: 'strategies-detail', params: { id: strategy.id } }"
          class="card block p-4 transition hover:bg-gray-50"
        >
          <div>
            <h2 class="font-semibold">{{ strategy.name }}</h2>
            <p class="text-sm text-gray-500">{{ strategy.description }}</p>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 전략이 없을 경우 안내 메시지를 보여줍니다. -->
    <EmptyState v-else title="Strategies" description="List and manage your strategies.">
      <RouterLink class="btn-primary" to="/strategies/create">Create Strategy</RouterLink>
    </EmptyState>
  </div>
</template>
<script setup lang="ts">
import EmptyState from '@/components/Common/EmptyState.vue'
import { RouterLink } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'
const strategyStore = useStrategyStore()
</script>
