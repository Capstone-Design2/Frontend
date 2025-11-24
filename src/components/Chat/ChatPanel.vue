<template>
  <div class="flex flex-col h-[400px] rounded-lg text-slate-200">
    <!-- Loading -->
    <div v-if="isLoading && messages.length === 0" class="flex flex-1 items-center justify-center">
      <div
        class="animate-spin w-10 h-10 border-4 border-slate-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <!-- Empty View -->
    <EmptyChatView
      v-else-if="messages.length === 0"
      v-model="newMessage"
      @sendMessage="sendMessage"
      :isLoading="isLoading"
      class="flex-1"
    />

    <!-- Active Chat -->
    <ActiveChatView
      v-else
      class="flex-1"
      :messages="messages"
      v-model="newMessage"
      @sendMessage="sendMessage"
      :isLoading="isLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyChatView from '@/components/Chat/EmptyChatView.vue'
import ActiveChatView from '@/components/Chat/ActiveChatView.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'
import type { StrategyChatMessage } from '@/types/Strategy'

const strategyStore = useStrategyStore()

const messages = ref<StrategyChatMessage[]>([])
const newMessage = ref('')
const isLoading = ref(false)

async function sendMessage(content: string | null = null) {
  const text = content || newMessage.value.trim()
  if (!text) return

  // 1. 사용자 메시지를 로컬 상태에 추가
  messages.value.push({ content: text, isBot: false })
  newMessage.value = ''
  isLoading.value = true

  try {
    // 2. 스토어 액션을 호출하고 결과를 기다림
    const response = await strategyStore.sendChatMessage(text)

    // 3. 받은 객체를 보기 좋은 JSON 문자열로 변환하여 로컬 상태에 추가
    const jsonString = JSON.stringify(response, null, 2)
    messages.value.push({ content: jsonString, isBot: true })
  } catch (e) {
    messages.value.push({
      content: 'AI 응답을 가져오는 데 실패했습니다.',
      isBot: true,
    })
    // 에러를 콘솔에도 출력
    console.error('Failed to send chat message:', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>
