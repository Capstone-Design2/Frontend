<template>
  <div class="flex flex-col h-full bg-slate-930 rounded-xl">
    <!-- ① 메시지 목록 -->
    <MessageList
      class="flex-1 overflow-y-auto"
      :messages="messages"
      :isLoading="isLoading"
      @confirmStrategy="onConfirmStrategy"
      @rejectStrategy="onRejectStrategy"
    />

    <!-- Divider -->
    <div class="h-[1px] bg-slate-700/50 my-2"></div>

    <!-- ② 입력창 -->
    <MessageInput
      :value="newMessage"
      :disabled="isLoading"
      @update:value="newMessage = $event"
      @send="sendMessage"
      class="p-3"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import { useStrategyStore } from '@/stores/useStrategyStore'

const emit = defineEmits(['apply-strategy'])

const messages = ref([])
const newMessage = ref('')
const isLoading = ref(false)

const strategyStore = useStrategyStore()

async function sendMessage(text: string) {
  if (!text.trim()) return

  messages.value.push({ type: 'user', text })
  newMessage.value = ''

  // typing bubble
  isLoading.value = true
  messages.value.push({ type: 'bot', typing: true })

  try {
    const res = await strategyStore.sendChatMessage(text)
    const { status, reply, strategy, conditions } = res

    // remove typing
    messages.value = messages.value.filter((m) => !m.typing)

    messages.value.push({
      type: 'bot',
      text: reply,
      status,
      strategy,
      conditions,
    })
  } finally {
    isLoading.value = false
  }
}

function onConfirmStrategy(strategyJson) {
  emit('apply-strategy', strategyJson)
  messages.value.push({
    type: 'bot',
    text: '전략을 왼쪽에 적용했습니다. 확인 후 저장해주세요.',
    status: 'chat',
  })
}

function onRejectStrategy() {
  messages.value.push({
    type: 'bot',
    text: '알겠습니다. 다시 전략을 이어가보죠!',
    status: 'chat',
  })
}

onMounted(() => {
  sessionStorage.removeItem('strategy_session_id')
  messages.value = []
})
</script>
