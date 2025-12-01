<template>
  <div class="space-y-4">
    <!-- Group Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex h-6 items-center rounded-full bg-slate-900 px-3 text-xs font-medium text-slate-300"
        >
          {{ title }}
        </span>
        <span class="text-[11px] text-slate-500">
          {{ mode === 'all' ? '모든 조건 충족 시' : '하나라도 충족 시' }} 트리거
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="text-slate-400">Logic</span>
        <select
          v-model="mode"
          class="input w-32 bg-slate-900 border-slate-700 text-xs text-slate-200"
        >
          <option value="all">ALL (AND)</option>
          <option value="any">ANY (OR)</option>
        </select>
      </div>
    </div>

    <!-- Condition Blocks -->
    <div class="space-y-3">
      <div
        v-for="(c, idx) in list"
        :key="idx"
        class="relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/80 p-4 shadow"
      >
        <!-- top label -->
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
              IF
            </span>
            <span class="text-slate-500">#{{ idx + 1 }}</span>
          </div>

          <button
            type="button"
            @click="remove(idx)"
            class="text-xs text-slate-400 transition hover:text-danger"
          >
            ✕ Remove
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-[1.4fr,1.2fr,1.4fr,1fr]">
          <!-- Indicator 1 -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Indicator 1</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.indicator1">
              <option value="price">price</option>
              <option v-for="i in indicatorOptions" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>

          <!-- Operator -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Operator</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.operator">
              <option value="is_above">is above</option>
              <option value="is_below">is below</option>
              <option value="crosses_above">crosses above</option>
              <option value="crosses_below">crosses below</option>
            </select>
          </div>

          <!-- Indicator 2 -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Compare To</label>
            <select class="input bg-slate-950 border-slate-700" v-model="c.indicator2">
              <option value="price">price</option>
              <option v-for="i in indicatorOptions" :key="i" :value="i">{{ i }}</option>
              <option value="num">Number…</option>
            </select>
          </div>

          <!-- Number input -->
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">Value</label>
            <input
              v-if="c.indicator2 === 'num'"
              v-model="c._num"
              class="input bg-slate-950 border-slate-700"
              placeholder="예: 30"
            />
            <div
              v-else
              class="flex h-10 items-center rounded border border-dashed border-slate-700/70 bg-slate-950 px-3 text-xs text-slate-500"
            >
              선택된 인디케이터 값 사용
            </div>
          </div>
        </div>

        <!-- AND / OR 연결 텍스트 (다음 블록과 논리 연결 표시용) -->
        <div
          v-if="idx < list.length - 1"
          class="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500"
        >
          {{ mode === 'all' ? 'AND' : 'OR' }}
        </div>
      </div>
    </div>

    <!-- Add Button -->
    <button type="button" class="btn-outline text-sm" @click="add">+ Add Condition</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: Record<string, any>
  indicatorOptions: string[]
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// all / any 모드
const mode = computed({
  get: () => {
    const keys = Object.keys(props.modelValue || {})
    return (keys[0] as 'all' | 'any') || 'all'
  },
  set: (v: 'all' | 'any') => {
    emit('update:modelValue', { [v]: list.value })
  },
})

// 조건 리스트
const list = computed({
  get: () => {
    const current = (props.modelValue as any)[mode.value] || []
    // 숫자 문자열을 가진 기존 JSON을 UI 상태로 변환
    for (const c of current) {
      if (!c._initialized) {
        if (typeof c.indicator2 === 'string' && c.indicator2 !== 'price') {
          const maybeNum = Number(c.indicator2)
          if (!isNaN(maybeNum)) {
            c._num = c.indicator2
            c.indicator2 = 'num'
          }
        }
        c._initialized = true
      }
    }
    return current
  },
  set: (v) => {
    emit('update:modelValue', { [mode.value]: v })
  },
})

function add() {
  list.value.push({
    indicator1: 'price',
    operator: 'is_above',
    indicator2: 'price',
    _num: '',
    _initialized: true,
  })
}

function remove(idx: number) {
  list.value.splice(idx, 1)
}
</script>
