<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main class="flex-grow">
      <RouterView />
    </main>
    <Footer />

    <!-- Toast Container -->
    <div class="fixed bottom-4 right-4 z-50 w-full max-w-xs space-y-3">
      <TransitionGroup
        tag="div"
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
            toast.type === 'success' ? 'bg-green-800/80' : 'bg-red-800/80',
          ]"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-white">{{ toast.message }}</p>
              </div>
              <div class="ml-4 flex flex-shrink-0">
                <button
                  @click="ui.removeToast(toast.id)"
                  class="inline-flex rounded-md text-slate-300 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/Common/AppNavbar.vue'
import Footer from '@/components/Common/Footer.vue'
import { useUiStore } from '@/stores/useUiStore'

const ui = useUiStore()
</script>
