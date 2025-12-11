<template>
  <div class="flex flex-col h-full rounded-xl overflow-hidden bg-slate-930">
    <div ref="listRef" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(msg, i) in messages" :key="i" class="w-full flex">
        <!-- User 질문 -->
        <div
          v-if="msg.type === 'user'"
          class="ml-auto max-w-[70%] px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
        >
          {{ msg.text }}
        </div>

        <!-- Bot 로딩 -->
        <div
          v-else-if="msg.typing === true"
          class="mr-auto max-w-[70%] px-4 py-2 bg-slate-700 text-slate-400 rounded-xl italic opacity-70"
        >
          작성 중...
        </div>

        <!-- Bot 응답 -->
        <div v-else class="mr-auto max-w-[70%] px-4 py-2 bg-slate-700 text-slate-200 rounded-xl">
          <!-- 기본 응답 -->
          <template v-if="msg.status === 'chat'">
            {{ msg.text }}
          </template>

          <!-- 전략 관련 응답 -->
          <template v-else>
            <div class="mb-3">{{ msg.text }}</div>

            <!-- 조건 요약 -->
            <div v-if="msg.conditions" class="mb-3 p-3 bg-slate-800 rounded-lg text-sm">
              <div class="font-semibold mb-2">전략 조건 요약:</div>
              <ul class="space-y-2">
                <li v-for="(cond, key) in msg.conditions" :key="key" class="flex gap-2 items-start">
                  <span v-if="cond.filled" class="text-green-400 font-bold mt-0.5">✔</span>
                  <span v-else class="text-slate-500 font-bold mt-0.5">✖</span>

                  <div>
                    <div class="font-medium">{{ conditionLabel(key) }}</div>

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

            <!-- 전략 JSON -->
            <div
              v-if="msg.status === 'complete' && msg.strategy"
              class="mb-3 p-3 bg-slate-800 rounded-lg text-sm"
            >
              <details>
                <summary class="cursor-pointer mb-1">전략 JSON 보기</summary>
                <pre class="whitespace-pre-wrap mt-2"
                  >{{ formatStrategy(msg.strategy) }}
                </pre>
              </details>
            </div>

            <!-- 전략 생성/수정 버튼 -->
            <div v-if="msg.status === 'complete'" class="flex gap-2 mt-3">
              <button
                class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                @click="$emit('confirmStrategy', msg.strategy)"
              >
                전략 적용하기
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: Array,
})

const emit = defineEmits(['confirmStrategy', 'rejectStrategy'])

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

function conditionLabel(key: string) {
  switch (key) {
    case 'indicators':
      return '지표 설정'
    case 'buy_conditions':
      return '매수 조건'
    case 'sell_conditions':
      return '매도 조건'
    case 'trade_settings':
      return '거래 설정'
    default:
      return key
  }
}

function formatStrategy(strategy: string | object) {
  try {
    const parsed = typeof strategy === 'string' ? JSON.parse(strategy) : strategy
    return JSON.stringify(parsed, null, 2)
  } catch {
    return strategy
  }
}
</script>
