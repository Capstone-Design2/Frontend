<template>
  <div class="flex flex-col items-center justify-center p-6 text-slate-200 bg-slate-930">
    <h2 class="text-2xl font-bold mb-4">AI Strategy Assistant</h2>

    <p class="text-center text-slate-400 mb-6">
      전략 설정, 지표 추천, 매매 규칙 아이디어 등<br />
      무엇이든 편하게 질문하세요!
    </p>

    <form @submit.prevent="handleSend" class="w-full max-w-xl">
      <div class="relative">
        <textarea
          ref="textareaRef"
          v-model="internal"
          class="w-full px-3 py-4 pr-14 rounded-xl bg-slate-800 text-slate-200 border border-slate-600 resize-none leading-relaxed chat-input"
          placeholder="메시지를 입력하세요..."
          @input="autoGrow"
          rows="1"
        ></textarea>

        <button
          type="submit"
          class="absolute bottom-4 right-2 btn-primary p-2 rounded-xl disabled:opacity-50 flex items-center justify-center"
          :disabled="isLoading || !internal.trim()"
        >
          <img
            src="@/assets/icons/chat.svg"
            alt="send"
            class="w-5 h-5 opacity-80 invert hover:opacity-100 transition"
          />
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
  ta.style.height = Math.min(ta.scrollHeight, 100) + 'px'
}

function handleSend() {
  if (!internal.value.trim()) return
  emit('sendMessage', internal.value.trim())
  internal.value = ''

  nextTick(() => autoGrow())
}
</script>

<style scoped>
.chat-input {
  min-height: 38px;
  max-height: 120px;
  line-height: 1.4;
  overflow-y: auto;
  height: auto;
}

.chat-input:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
