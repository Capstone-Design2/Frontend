<template>
  <div class="flex flex-col h-full rounded-xl overflow-hidden bg-slate-930">
    <!-- Messages -->
    <div ref="listRef" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(msg, i) in messages" :key="i" class="w-full flex">
        <!-- User Message -->
        <div
          v-if="msg.type === 'user'"
          class="ml-auto max-w-[70%] px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
        >
          {{ msg.text }}
        </div>

        <!-- Bot Loading Bubble -->
        <div
          v-else-if="msg.typing === true"
          class="mr-auto max-w-[70%] px-4 py-2 bg-slate-700 text-slate-400 rounded-xl italic opacity-70"
        >
          작성 중...
        </div>

        <!-- Bot Normal Response -->
        <div v-else class="mr-auto max-w-[70%] px-4 py-2 bg-slate-700 text-slate-200 rounded-xl">
          <!-- 1) 기본 대화 (chat 상태) -->
          <template v-if="msg.status === 'chat'">
            {{ msg.text }}
          </template>

          <!-- 2) in_progress 또는 complete 상태일 때 -->
          <template v-else>
            <div class="mb-3">{{ msg.text }}</div>

            <!-- 조건 요약 박스 -->
            <div class="mb-3 p-3 bg-slate-800 rounded-lg text-sm" v-if="msg.conditions">
              <div class="font-semibold mb-2">전략 조건 요약:</div>
              <ul class="space-y-2">
                <li v-for="(cond, key) in msg.conditions" :key="key" class="flex gap-2 items-start">
                  <!-- 체크 아이콘 -->
                  <span v-if="cond.filled" class="text-green-400 font-bold mt-0.5">✔</span>
                  <span v-else class="text-slate-500 font-bold mt-0.5">✖</span>

                  <div>
                    <!-- 조건 제목 -->
                    <div class="font-medium">
                      {{ conditionLabel(key) }}
                    </div>

                    <!-- 조건 설명 -->
                    <div v-if="cond.description" class="text-xs text-slate-300 mt-0.5">
                      {{ cond.description }}
                    </div>
                    <div v-else class="text-xs text-slate-500 italic mt-0.5">
                      아직 설명이 없습니다.
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 전략 JSON 출력 -->
            <div
              v-if="msg.status === 'complete' && msg.strategy"
              class="mb-3 p-3 bg-slate-800 rounded-lg text-sm"
            >
              <details>
                <summary class="cursor-pointer mb-1">전략 JSON 보기</summary>
                <pre class="whitespace-pre-wrap mt-2">{{ formatStrategy(msg.strategy) }}</pre>
              </details>
            </div>

            <!-- complete 상태에서만 버튼 표시 -->
            <div v-if="msg.status === 'complete'" class="flex gap-2 mt-3">
              <button
                class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                @click="$emit('confirmStrategy', msg.strategy)"
              >
                전략 생성하기
              </button>

              <button
                class="bg-slate-600 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition"
                @click="$emit('rejectStrategy')"
              >
                다시 수정하기
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="h-20"></div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-slate-700 bg-slate-900/80 backdrop-blur">
      <form @submit.prevent class="flex gap-3 items-end">
        <textarea
          ref="taRef"
          v-model="internal"
          class="flex-1 px-3 py-2 bg-slate-800 text-slate-100 rounded-xl border border-slate-600 resize-none focus:outline-none focus:ring-0"
          placeholder="메시지를 입력하세요..."
          @keydown="handleKeyDown"
          @input="autoGrow"
          rows="1"
        ></textarea>

        <button
          type="button"
          @click="onSend"
          class="btn-primary p-2 rounded-xl disabled:opacity-50 flex items-center justify-center cursor-pointer"
          :disabled="!internal.trim() || isLoading"
        >
          <img
            src="@/assets/icons/chat.svg"
            alt="send"
            class="w-6 h-6 opacity-90 transition filter invert"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'

const props = defineProps({
  messages: Array,
  modelValue: String,
  isLoading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'sendMessage', 'confirmStrategy', 'rejectStrategy'])

const internal = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const taRef = ref<HTMLTextAreaElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

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

function autoGrow() {
  const ta = taRef.value
  if (!ta) return
  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    e.stopPropagation()
    onSend()
  }
}

function onSend() {
  if (!internal.value.trim()) return
  emit('sendMessage', internal.value.trim())
  internal.value = ''
  nextTick(() => autoGrow())
}

/* 조건 이름 라벨 */
function conditionLabel(key: string) {
  switch (key) {
    case 'indicators':
      return '지표 설정'
    case 'buy_entry':
      return '매수 진입 조건'
    case 'buy_exit':
      return '매수 청산 조건'
    case 'sell_entry':
      return '매도 진입 조건'
    case 'sell_exit':
      return '매도 청산 조건'
    default:
      return key
  }
}

/* JSON 예쁘게 포맷 */
function formatStrategy(strategy: string | object) {
  try {
    const parsed = typeof strategy === 'string' ? JSON.parse(strategy) : strategy
    return JSON.stringify(parsed, null, 2)
  } catch {
    return strategy
  }
}
</script>
