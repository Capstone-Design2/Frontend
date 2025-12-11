<template>
  <div class="px-4 md:px-8 lg:px-12 pt-6 pb-4">
    <div class="card p-6 h-[calc(100vh-8rem)] overflow-hidden max-w-[1500px] mx-auto">
      <div class="relative grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <!-- LEFT -->
        <div class="h-full overflow-y-auto pr-3 scrollbar-hide">
          <RuleBuilder ref="ruleBuilderRef" :presets="presets" @save="onSave" />
        </div>

        <!-- Divider -->
        <div
          class="absolute left-1/2 -translate-x-1/2 w-px bg-gray-100/20 dark:bg-slate-800 h-full hidden md:block"
        ></div>

        <!-- RIGHT -->
        <div class="sticky top-20 h-[calc(100vh-10rem)]">
          <ChatPanel class="h-full rounded-xl" @apply-strategy="onApplyStrategy" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RuleBuilder from '@/components/Strategy/RuleBuilder.vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useRouter } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'

const router = useRouter()
const strategies = useStrategyStore()
const ruleBuilderRef = ref<InstanceType<typeof RuleBuilder> | null>(null)

const presets = []

async function onSave(payload) {
  console.log('Create.vue onSave received payload:', payload)
  try {
    await strategies.create(payload)
    console.log('Strategy created successfully.')
    router.push('/strategies')
  } catch (error) {
    console.error('Failed to create strategy:', error)
    alert('Failed to save strategy. See console for details.')
  }
}

function onApplyStrategy(strategyJson: string) {
  if (ruleBuilderRef.value) {
    try {
      const strategyRules = JSON.parse(strategyJson)
      ruleBuilderRef.value.loadStrategy(strategyRules)
    } catch (e) {
      console.error('Failed to parse and apply strategy from chat:', e)
      // Optionally, inform the user about the error
    }
  }
}
</script>
