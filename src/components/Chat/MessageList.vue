<template>
  <div ref="listRef" class="h-full overflow-y-auto px-3 py-4 space-y-4">
    <!-- 초기 로딩 -->
    <div v-if="isLoading && messages.length === 0" class="flex items-center justify-center h-full">
      <div
        class="animate-spin w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <!-- Empty -->
    <EmptyChatView v-else-if="messages.length === 0" />

    <!-- Active -->
    <ActiveChatView
      v-else
      :messages="messages"
      @confirmStrategy="$emit('confirmStrategy', $event)"
      @rejectStrategy="$emit('rejectStrategy')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import EmptyChatView from './EmptyChatView.vue'
import ActiveChatView from './ActiveChatView.vue'

const props = defineProps({
  messages: Array,
  isLoading: Boolean,
})

const listRef = ref(null)

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight
      }
    })
  },
  { deep: true },
)
</script>
