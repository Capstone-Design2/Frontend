<template>
  <svg :viewBox="`0 0 ${width} ${height}`" xmlns="http://www.w3.org/2000/svg" class="h-10 w-full">
    <polyline :points="points" fill="none" class="stroke-[hsl(var(--primary))]" stroke-width="2" />
  </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Point { time: number; value: number }
interface Props { data: Point[]; width?: number; height?: number }
const props = withDefaults(defineProps<Props>(), { width: 100, height: 24 })

const points = computed(() => {
  if (!props.data?.length) return ''
  const xs = props.data.map((_, i) => i)
  const ys = props.data.map(p => p.value)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const norm = (v: number) => maxY===minY ? props.height/2 : props.height - ((v - minY) / (maxY - minY)) * props.height
  return xs.map((x,i)=> `${(x/(xs.length-1))*props.width},${norm(ys[i])}`).join(' ')
})

const width = props.width
const height = props.height
</script>
