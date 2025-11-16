<template>
  <div class="flex flex-col h-full rounded-xl overflow-hidden bg-slate-930">
    <!-- Messages -->
    <div ref="listRef" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(msg, i) in messages" :key="i" class="w-full flex">
        <!-- User -->
        <div
          v-if="!msg.isBot"
          class="ml-auto max-w-[70%] px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
        >
          {{ msg.content }}
        </div>

        <!-- Bot -->
        <div v-else class="mr-auto max-w-[70%] px-4 py-2 bg-slate-700 text-slate-200 rounded-xl">
          {{ msg.content }}
        </div>
      </div>

      <!-- bottom spacing for input -->
      <div class="h-20"></div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-slate-700 bg-slate-900/80 backdrop-blur">
      <form @submit.prevent="onSend" class="flex gap-3 items-end">
        <!-- Auto grow textarea -->
        <textarea
          ref="taRef"
          v-model="internal"
          class="flex-1 px-3 py-2 bg-slate-800 text-slate-100 rounded-xl border border-slate-600 resize-none focus:outline-none focus:ring-0"
          placeholder="메시지를 입력하세요..."
          @input="autoGrow"
          rows="1"
        ></textarea>

        <!-- Button: SVG icon -->
        <button
          type="submit"
          class="btn-primary p-2 rounded-xl disabled:opacity-50 flex items-center justify-center cursor-pointer"
          :disabled="!internal.trim() || isLoading"
        >
          <img
            src="@/assets/icons/chat.svg"
            alt="send"
            class="w-6 h-6 opacity-90 hover:opacity-100 transition filter invert"
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

const emit = defineEmits(['update:modelValue', 'sendMessage'])

const internal = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const taRef = ref<HTMLTextAreaElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

// 메시지 추가 시 자동 스크롤
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

function onSend() {
  if (!internal.value.trim()) return
  emit('sendMessage', internal.value.trim())
  internal.value = ''
  nextTick(() => autoGrow())
}
</script>
