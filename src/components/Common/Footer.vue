<template>
  <footer class="border-t border-slate-800 bg-slate-950/80">
    <div class="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-400">
      © {{ year }} CAPSLOCK. Educational use only.
    </div>
  </footer>
</template>
<script setup lang="ts">
const year = new Date().getFullYear()
</script>
