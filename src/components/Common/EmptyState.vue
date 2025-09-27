<template>
  <div class="card mx-auto max-w-2xl p-10 text-center">
    <h2 class="mb-2 text-xl font-semibold">{{ title }}</h2>
    <p class="mb-6 text-slate-400">{{ description }}</p>
    <slot />
  </div>
</template>
<script setup lang="ts">
interface Props { title: string; description?: string }
withDefaults(defineProps<Props>(), { description: '' })
</script>
