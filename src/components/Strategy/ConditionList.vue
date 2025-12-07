<template>
  <div>
    <div v-if="isAll">
      <p class="text-slate-400 text-xs mb-3">아래 조건을 모두 만족할 때</p>
      <FlowList :items="group.all!" :indicators="indicators" />
    </div>

    <div v-else-if="isAny">
      <p class="text-slate-400 text-xs mb-3">아래 조건 중 하나라도 만족할 때</p>
      <FlowList :items="group.any!" :indicators="indicators" />
    </div>

    <p v-else class="text-slate-500 text-sm">No conditions defined.</p>
  </div>
</template>

<script setup lang="ts">
import FlowList from './FlowList.vue'
import type { ConditionGroupValue, Indicator } from '@/types/Strategy'

const props = defineProps<{
  group: ConditionGroupValue
  indicators: Indicator[]
  type: 'buy' | 'sell'
}>()

const isAll = 'all' in props.group
const isAny = 'any' in props.group
</script>
