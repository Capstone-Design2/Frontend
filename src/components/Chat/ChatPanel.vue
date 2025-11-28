<template>
  <div class="flex flex-col h-[600px] rounded-lg text-slate-200">
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
      @confirmStrategy="onConfirmStrategy"
      @rejectStrategy="onRejectStrategy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

  // 1. 사용자 메시지 push
  messages.value.push({
    type: 'user',
    text: text,
  })

  newMessage.value = ''
  isLoading.value = true

  messages.value.push({
    type: 'bot',
    typing: true,
  })

  try {
    // 백엔드 응답: { session_id, status, reply, strategy, conditions }
    const response = await strategyStore.sendChatMessage(text)
    const { status, reply, strategy, conditions } = response

    // 2. 봇 메시지를 status 기반으로 push
    messages.value.push({
      type: 'bot',
      text: reply,
      status,
      strategy,
      conditions,
    })
  } catch (e) {
    console.log(e)

    messages.value.push({
      type: 'bot',
      text: 'AI 응답을 가져오는 데 실패했습니다.',
      status: 'chat',
    })
  } finally {
    messages.value = messages.value.filter((m) => !m.typing)
    isLoading.value = false
  }
}

function onConfirmStrategy(strategy: any) {
  const name = prompt('전략 이름을 입력하세요:')

  if (!name || name.trim() === '') {
    alert('전략 이름을 입력해야 합니다.')
    return
  }

  try {
    isLoading.value = true
    const rulesObj = JSON.parse(strategy)

    const payload = {
      strategy_name: name,
      description: '',
      rules: rulesObj,
    }

    strategyStore.create(payload)

    messages.value.push({
      type: 'bot',
      text: `전략이 성공적으로 저장되었습니다!`,
      status: 'chat',
    })
  } catch (e) {
    console.log(e)

    messages.value.push({
      type: 'bot',
      text: '전략 저장 중 오류가 발생했습니다.',
      status: 'chat',
    })
  } finally {
    isLoading.value = false
  }
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
