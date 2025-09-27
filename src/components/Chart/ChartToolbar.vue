<template>
  <div class="flex items-center gap-2">
    <div class="rounded-md border border-slate-800 bg-slate-900 p-1">
      <button v-for="tf in tfs" :key="tf.k" class="px-2 py-1 text-xs text-slate-300 hover:text-white" :class="{ 'bg-slate-800 rounded': tf.k===modelValue }" @click="$emit('update:modelValue', tf.k)">{{ tf.l }}</button>
    </div>
    <div class="rounded-md border border-slate-800 bg-slate-900 p-1">
      <button v-for="tool in tools" :key="tool.k" class="px-2 py-1 text-xs text-slate-300 hover:text-white" :class="{ 'bg-slate-800 rounded': tool.k===toolValue }" @click="$emit('update:toolValue', tool.k)">{{ tool.l }}</button>
    </div>
    <button class="btn-outline" @click="$emit('clear')">Clear Drawings</button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ modelValue: string; toolValue: string }>()
const tfs = [
  { k: '1min', l: '1m' }, { k: '5min', l: '5m' }, { k: '15min', l: '15m' }, { k: '60min', l: '1h' }, { k: '1day', l: '1D' }
]
const tools = [
  { k: 'none', l: 'None' }, { k: 'trendline', l: 'Trend' }, { k: 'hline', l: 'H-Line' }, { k: 'fib', l: 'Fib' }
]
</script>
