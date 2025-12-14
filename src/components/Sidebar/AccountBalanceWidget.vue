<template>
  <div class="card p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-medium">모의투자 계좌</h3>
      <button
        @click="refresh"
        class="text-xs text-slate-400 hover:text-slate-200"
        :disabled="loading"
      >
        {{ loading ? '로딩 중...' : '새로고침' }}
      </button>
    </div>

    <div v-if="error" class="rounded bg-red-500/10 p-3 text-sm text-red-400">
      {{ error }}
    </div>

    <div v-else-if="balance" class="space-y-3">
      <!-- 총 자산 -->
      <div class="rounded-lg bg-slate-800/50 p-3">
        <div class="mb-1 text-xs text-slate-400">총 자산</div>
        <div class="text-xl font-semibold" :class="profitColorClass">
          {{ formatKRW(balance.total_asset_value) }}
        </div>
        <div class="mt-1 text-xs" :class="profitColorClass">
          {{ profitPrefix }}{{ formatKRW(Math.abs(balance.profit_loss)) }} ({{
            profitRateLabel
          }})
        </div>
      </div>

      <!-- 현금 잔고 -->
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">현금 잔고</span>
        <span class="font-medium tabular-nums">{{ formatKRW(balance.current_balance) }}</span>
      </div>

      <!-- 보유 자산 -->
      <div class="flex justify-between text-sm">
        <span class="text-slate-400">보유 자산</span>
        <span class="font-medium tabular-nums">{{
          formatKRW(balance.total_position_value)
        }}</span>
      </div>

      <!-- Kill Switch -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-700">
        <span class="text-sm text-slate-400">자동 거래</span>
        <button
          @click="toggleActive"
          :disabled="toggling"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="balance.is_active ? 'bg-emerald-600' : 'bg-slate-600'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="balance.is_active ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <div v-else class="text-center text-sm text-slate-400 py-4">계좌 정보를 불러오는 중...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getBalance, toggleAccount, type Balance } from '@/services/paperTradingApi'
import { useUiStore } from '@/stores/useUiStore'

const uiStore = useUiStore()

const balance = ref<Balance | null>(null)
const loading = ref(false)
const toggling = ref(false)
const error = ref<string | null>(null)

const formatKRW = (value: number) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)

const profitRate = computed(() => {
  if (!balance.value || balance.value.initial_balance === 0) return 0
  return (balance.value.profit_loss / balance.value.initial_balance) * 100
})

const profitRateLabel = computed(() => {
  const rate = profitRate.value
  const sign = rate >= 0 ? '▲' : '▼'
  return `${sign}${Math.abs(rate).toFixed(2)}%`
})

const profitPrefix = computed(() => (balance.value && balance.value.profit_loss >= 0 ? '+' : ''))

const profitColorClass = computed(() => {
  if (!balance.value) return 'text-slate-200'
  return balance.value.profit_loss >= 0 ? 'text-red-400' : 'text-blue-400'
})

async function refresh() {
  loading.value = true
  error.value = null

  try {
    balance.value = await getBalance()
  } catch (e: any) {
    error.value = e.response?.data?.detail || '계좌 정보를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

async function toggleActive() {
  if (!balance.value || toggling.value) return

  toggling.value = true

  try {
    const newStatus = !balance.value.is_active
    const updated = await toggleAccount(newStatus)
    balance.value = { ...balance.value, is_active: updated.is_active }

    uiStore.pushToast({
      type: 'success',
      message: `자동 거래가 ${newStatus ? '활성화' : '비활성화'}되었습니다`,
    })
  } catch (e: any) {
    uiStore.pushToast({
      type: 'error',
      message: e.response?.data?.detail || '상태 변경에 실패했습니다',
    })
  } finally {
    toggling.value = false
  }
}

onMounted(() => {
  refresh()
})

// 주기적 업데이트 (30초마다)
setInterval(refresh, 30000)
</script>
