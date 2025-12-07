<template>
  <div class="px-4 md:px-8 lg:px-12 pt-6 pb-4">
    <div class="card p-6 h-[calc(100vh-8rem)] overflow-hidden max-w-[1500px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <!-- LEFT -->
        <div class="h-full overflow-y-auto pr-3 scrollbar-hide">
          <RuleBuilder :presets="presets" @save="onSave" />
        </div>

        <!-- RIGHT -->
        <div class="sticky top-20 h-[calc(100vh-10rem)]">
          <ChatPanel class="h-full rounded-xl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useRouter } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'

const router = useRouter()
const strategies = useStrategyStore()

const presets = []

async function onSave(payload) {
  await strategies.create(payload)
  router.push('/strategies')
}
</script>
