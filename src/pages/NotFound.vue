<template>
  <div class="mx-auto max-w-xl px-4 pt-10">
    <div class="card p-8 text-center">
      <h1 class="mb-2 text-2xl font-semibold">404</h1>
      <p class="mb-4 text-slate-400">We couldn't find that page.</p>
      <RouterLink class="btn-primary" to="/">Go home</RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
