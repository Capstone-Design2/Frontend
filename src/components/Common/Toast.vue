<template>
  <div class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
    <transition-group name="toast" tag="div" class="flex flex-col gap-2">
      <div v-for="t in ui.toasts" :key="t.id" class="pointer-events-auto card px-4 py-3 shadow-card">
        <div class="flex items-center gap-3">
          <span :class="{
            'text-success': t.type==='success', 'text-danger': t.type==='error', 'text-accent': t.type==='info'
          }">●</span>
          <span class="text-sm">{{ t.message }}</span>
          <button class="ml-4 text-xs text-slate-400 hover:text-slate-200" @click="ui.removeToast(t.id)">Dismiss</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { useUiStore } from '@/stores/useUiStore'
const ui = useUiStore()
</script>
<style scoped>
.toast-enter-active,.toast-leave-active{ transition: all .2s ease }
.toast-enter-from,.toast-leave-to{ opacity:0; transform: translateY(6px) }
</style>
