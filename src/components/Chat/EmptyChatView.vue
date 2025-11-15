<template>
  <div class="flex flex-col items-center justify-center p-6 text-slate-200 bg-slate-930">
    <h2 class="text-2xl font-bold mb-4">AI Strategy Assistant</h2>

    <p class="text-center text-slate-400 mb-6">
      전략 설정, 지표 추천, 매매 규칙 아이디어 등<br />
      무엇이든 편하게 질문하세요!
    </p>

    <form @submit.prevent="handleSend" class="w-full max-w-xl">
      <div class="relative">
        <!-- ChatGPT style textarea -->
        <textarea
          ref="textareaRef"
          v-model="internal"
          class="chat-input w-full px-3 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-600 resize-none"
          placeholder="메시지를 입력하세요..."
          @input="autoGrow"
        ></textarea>

        <button
          type="submit"
          class="absolute bottom-5 right-2 btn-primary px-3 py-1 text-sm rounded-lg disabled:opacity-50"
          :disabled="isLoading || !internal.trim()"
        >
          전송
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  isLoading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'sendMessage'])

const internal = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 자동 높이 조절
function autoGrow() {
  const ta = textareaRef.value
  if (!ta) return

  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 100) + 'px' // 최대 100px (약 6줄)
}

function handleSend() {
  if (!internal.value.trim()) return
  emit('sendMessage', internal.value.trim())
  internal.value = ''

  // 입력 후 다시 auto-grow 적용
  nextTick(() => autoGrow())
}
</script>

<style scoped>
.chat-input {
  min-height: 38px; /* 정확히 한 줄 높이 */
  max-height: 120px; /* 3~5줄 */
  line-height: 1.4;
  overflow-y: auto;
  height: auto;
}

.chat-input:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
