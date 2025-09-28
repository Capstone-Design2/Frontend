<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="card w-full max-w-lg" role="dialog" aria-modal="true">
          <header class="flex items-center justify-between border-b border-slate-800 p-4">
            <h2 class="text-lg font-semibold">
              <slot name="header">Modal Title</slot>
            </h2>
            <button @click="close" class="text-2xl leading-none text-slate-400 hover:text-white">
              &times;
            </button>
          </header>
          <section class="p-6">
            <slot>Modal content goes here.</slot>
          </section>
          <footer v-if="$slots.footer" class="flex justify-end gap-4 border-t border-slate-800 p-4">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (props.show && e.key === 'Escape') {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
