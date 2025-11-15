<template>
  <div class="flex flex-col h-[400px] rounded-lg text-slate-200">
    <!-- Loading -->
    <div v-if="initialLoading" class="flex flex-1 items-center justify-center">
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
import { ref, onMounted } from 'vue'
import EmptyChatView from '@/components/Chat/EmptyChatView.vue'
import ActiveChatView from '@/components/Chat/ActiveChatView.vue'

const messages = ref([])
const newMessage = ref('')
const chatId = ref(null)

const initialLoading = ref(true)
const isLoading = ref(false)

// 초기 로딩 (딜레이만)
onMounted(() => {
  setTimeout(() => {
    initialLoading.value = false
  }, 200)
})

// 메시지 전송
async function sendMessage(content = null) {
  const text = content || newMessage.value.trim()
  if (!text) return

  // 사용자 메시지
  messages.value.push({ content: text, isBot: false })
  newMessage.value = ''
  isLoading.value = true

  try {
    let response

    if (!chatId.value) {
      // 새 대화 생성
      const res = await createConversation({ content: text })
      chatId.value = res.id

      if (res.first_message) {
        messages.value.push({
          content: res.first_message.content,
          isBot: true,
          audioBase64: res.first_message.audio_base64,
        })
      }
    } else {
      // 기존 대화 전송
      response = await apiSendMessage(chatId.value, { content: text })
      messages.value.push({
        content: response.content,
        isBot: true,
        audioBase64: response.audio_base64,
      })
    }
  } catch (e) {
    messages.value.push({
      content: 'AI 응답을 가져오는 데 실패했습니다.',
      isBot: true,
    })
  }

  isLoading.value = false
}
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>
