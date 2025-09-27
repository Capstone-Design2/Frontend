<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
    <Toast />
  </div>
</template>
<script setup lang="ts">
import AppNavbar from '@/components/Common/AppNavbar.vue'
import Footer from '@/components/Common/Footer.vue'
import Toast from '@/components/Common/Toast.vue'
</script>
