<template>
  <div class="card p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-medium">보유 포지션</h3>
      <button @click="refresh" class="text-xs text-slate-400 hover:text-slate-200" :disabled="loading">
        {{ loading ? '로딩 중...' : '새로고침' }}
      </button>
    </div>

    <div v-if="error" class="rounded bg-red-500/10 p-3 text-sm text-red-400">
      {{ error }}
    </div>

    <div v-else-if="positions.length === 0" class="text-center text-sm text-slate-400 py-4">
      보유 중인 포지션이 없습니다
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="pos in positions"
        :key="pos.position_id"
        class="rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800/70 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">{{ getTickerName(pos.ticker_id) }}</div>
          <div class="text-xs text-slate-400">ID: {{ pos.ticker_id }}</div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div class="text-xs text-slate-400">수량</div>
            <div class="font-medium tabular-nums">{{ formatQuantity(pos.quantity) }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">평균 단가</div>
            <div class="font-medium tabular-nums">{{ formatKRW(pos.average_buy_price) }}</div>
          </div>
        </div>

        <div class="mt-2 pt-2 border-t border-slate-700">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">평가액</span>
            <span class="font-medium tabular-nums">{{
              formatKRW(pos.quantity * pos.average_buy_price)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPositions, type Position } from '@/services/paperTradingApi'

const positions = ref<Position[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const formatKRW = (value: number) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)

const formatQuantity = (value: number) =>
  new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 2,
  }).format(value)

function getTickerName(tickerId: number): string {
  // TODO: ticker_id를 실제 종목명으로 변환하는 API 호출 또는 캐시 사용
  // 현재는 임시로 ticker_id를 표시
  return `종목 #${tickerId}`
}

async function refresh() {
  loading.value = true
  error.value = null

  try {
    positions.value = await getPositions()
  } catch (e: any) {
    error.value = e.response?.data?.detail || '포지션 정보를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
})

// 주기적 업데이트 (30초마다)
setInterval(refresh, 30000)
</script>
