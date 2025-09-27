<template>
  <div class="mx-auto max-w-5xl px-4 pt-6">
    <h1 class="mb-4 text-xl font-semibold">My Page</h1>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="card p-4 md:col-span-2">
        <h2 class="mb-2 font-medium">Account</h2>
        <div class="text-sm text-slate-300">ID: {{ auth.user?.id }}</div>
        <div class="text-sm text-slate-300">Username: {{ auth.user?.username }}</div>
        <div class="text-sm text-slate-300">Email: {{ auth.user?.email }}</div>
      </div>
      <div class="card p-4">
        <h2 class="mb-2 font-medium">Snapshot</h2>
        <div class="text-sm text-slate-400">Latest Backtest: none</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore'
const auth = useAuthStore()
</script>
