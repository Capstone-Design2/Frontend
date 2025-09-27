<template>
  <div v-if="isAuthed"><slot /></div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const isAuthed = computed(()=> !!localStorage.getItem('auth.token'))
</script>
