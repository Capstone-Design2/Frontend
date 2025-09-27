<template>
  <div class="flex items-center justify-between gap-3 py-2">
    <div class="min-w-24 text-sm text-slate-300">{{ title }}</div>
    <MiniChart :data="data" />
    <div class="w-16 text-right text-sm" :class="change>=0 ? 'text-success':'text-danger'">{{ change>=0?'+':'' }}{{ change.toFixed(2) }}%</div>
  </div>
</template>
<script setup lang="ts">
import MiniChart from './MiniChart.vue'
import { computed } from 'vue'

interface Point { time: number; value: number }
const props = defineProps<{ title: string; data: Point[]; note?: string }>()

const change = computed(() => {
  const d = props.data
  if (!d || d.length<2) return 0
  const a = d[0].value, b = d[d.length-1].value
  return ((b-a)/a)*100
})
</script>
