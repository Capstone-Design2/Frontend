<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main class="flex-grow">
      <RouterView />
    </main>
    <Footer />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/Common/ToastContainer.vue'
import AppNavbar from '@/components/Common/AppNavbar.vue'
import Footer from '@/components/Common/Footer.vue'
</script>
