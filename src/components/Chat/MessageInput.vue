<template>
  <div class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2">
    <textarea
      ref="taRef"
      :value="value"
      :disabled="disabled"
      @input="onInput"
      @keydown="onKey"
      rows="1"
      class="flex-1 bg-transparent resize-none text-slate-200 outline-none"
      placeholder="메시지를 입력하세요..."
    />

    <button
      @click="send"
      :disabled="disabled || !value.trim()"
      class="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-40"
    >
      <img
        src="@/assets/icons/chat.svg"
        alt="send"
        class="w-5 h-5 opacity-80 invert hover:opacity-100 transition"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps({
  value: String,
  disabled: Boolean,
})
const emit = defineEmits(['update:value', 'send'])

const taRef = ref<HTMLTextAreaElement | null>(null)

function onInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  emit('update:value', val)
  autoResize()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function send() {
  if (!props.value.trim()) return

  emit('send', props.value.trim())
  emit('update:value', '')

  nextTick(() => autoResize())
}

function autoResize() {
  const ta = taRef.value
  if (!ta) return

  ta.style.height = 'auto'
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
}
</script>
