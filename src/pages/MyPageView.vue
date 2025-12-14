<template>
  <div class="mx-auto max-w-6xl px-4 pt-10">
    <h1 class="mb-6 text-2xl font-bold">My Page</h1>

    <!-- Profile Information -->
    <div class="mb-8">
      <div class="card">
        <div class="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 class="text-lg font-semibold">Profile Information</h2>
          <button @click="showEditModal = true" class="btn-secondary">Edit Profile</button>
        </div>
        <div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <div>
            <h3 class="text-sm font-medium text-slate-400">Username</h3>
            <p>{{ auth.user?.name }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-400">Email</h3>
            <p>{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Paper Trading Account Summary -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-semibold">모의투자 계좌</h2>
      <div class="flex gap-2">
        <button @click="resetAccount" class="btn-outline text-sm" :disabled="resetting">
          {{ resetting ? '초기화 중...' : '계좌 초기화' }}
        </button>
        <button @click="loadData" class="btn-secondary text-sm" :disabled="loading">
          {{ loading ? '로딩 중...' : '새로고침' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-8 rounded-lg bg-red-500/10 p-4 text-red-400">
      {{ error }}
    </div>

    <div v-else-if="balance" class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
      <div class="card p-4 overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-2">총 자산</h3>
        <p class="text-xl font-semibold break-words" :class="profitColorClass">
          {{ formatKRW(balance.total_asset_value) }}
        </p>
        <p class="mt-1 text-xs break-words" :class="profitColorClass">
          {{ profitPrefix }}{{ formatKRW(Math.abs(balance.profit_loss)) }}
        </p>
      </div>
      <div class="card p-4 overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-2">현금 잔고</h3>
        <p class="text-xl font-semibold break-words">{{ formatKRW(balance.current_balance) }}</p>
      </div>
      <div class="card p-4 overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-2">보유 자산 평가액</h3>
        <p class="text-xl font-semibold break-words">{{ formatKRW(balance.total_position_value) }}</p>
      </div>
      <div class="card p-4 overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-2">수익률</h3>
        <p class="text-xl font-semibold" :class="profitColorClass">{{ profitRateLabel }}</p>
        <div class="mt-2 flex items-center gap-2">
          <span class="text-xs text-slate-400 whitespace-nowrap">자동 거래:</span>
          <button
            @click="toggleActive"
            :disabled="toggling"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
            :class="balance.is_active ? 'bg-emerald-600' : 'bg-slate-600'"
          >
            <span
              class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
              :class="balance.is_active ? 'translate-x-5' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="mb-8 text-center text-slate-400 py-8">계좌 정보를 불러오는 중...</div>

    <!-- Positions -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold">보유 포지션</h3>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800">
            <thead class="bg-slate-900">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">종목</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">보유 수량</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">평균 매입가</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">현재가</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">평가액</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">손익</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">수익률</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr v-if="positions.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                  보유 중인 포지션이 없습니다
                </td>
              </tr>
              <tr v-for="pos in positions" :key="pos.position_id">
                <td class="px-4 py-2 font-medium">
                  {{ pos.ticker_code || `종목 #${pos.ticker_id}` }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatQuantity(pos.quantity) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatKRW(pos.average_buy_price) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatKRW(pos.current_price) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatKRW(pos.position_value) }}</td>
                <td class="px-4 py-2 text-right tabular-nums" :class="getProfitColor(pos.profit_loss)">
                  {{ formatKRW(pos.profit_loss) }}
                </td>
                <td class="px-4 py-2 text-right tabular-nums font-medium" :class="getProfitColor(pos.profit_loss)">
                  {{ formatPercent(pos.profit_loss_rate) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Order History -->
    <div>
      <h3 class="mb-4 text-lg font-semibold">주문 내역</h3>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800">
            <thead class="bg-slate-900">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">주문 시각</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">종목</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">유형</th>
                <th class="px-4 py-2 text-center text-sm font-semibold">매수/매도</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">수량</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">지정가</th>
                <th class="px-4 py-2 text-center text-sm font-semibold">상태</th>
                <th class="px-4 py-2 text-center text-sm font-semibold">액션</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr v-if="orders.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-slate-400">주문 내역이 없습니다</td>
              </tr>
              <tr v-for="order in paginatedOrders" :key="order.order_id">
                <td class="px-4 py-2 text-sm text-slate-400 tabular-nums">
                  {{ formatDateTime(order.submitted_at) }}
                </td>
                <td class="px-4 py-2 font-medium">종목 #{{ order.ticker_id }}</td>
                <td class="px-4 py-2 text-sm">{{ order.order_type }}</td>
                <td class="px-4 py-2 text-center">
                  <span
                    class="rounded px-2 py-0.5 text-xs font-medium"
                    :class="
                      order.side === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    "
                  >
                    {{ order.side === 'BUY' ? '매수' : '매도' }}
                  </span>
                </td>
                <td class="px-4 py-2 text-right tabular-nums">{{ formatQuantity(order.quantity) }}</td>
                <td class="px-4 py-2 text-right tabular-nums">
                  {{ order.limit_price ? formatKRW(order.limit_price) : '-' }}
                </td>
                <td class="px-4 py-2 text-center whitespace-nowrap">
                  <span
                    class="inline-block rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                    :class="getStatusClass(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-center">
                  <button
                    v-if="order.status === 'PENDING'"
                    @click="handleCancelOrder(order.order_id)"
                    class="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    :disabled="cancelling === order.order_id"
                  >
                    {{ cancelling === order.order_id ? '취소 중...' : '취소' }}
                  </button>
                  <span v-else class="text-xs text-slate-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 border-t border-slate-800 px-4 py-4">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="currentPage === 1
              ? 'bg-slate-800 text-slate-500'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'"
          >
            이전
          </button>

          <div class="flex gap-1">
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="goToPage(page)"
              class="min-w-[2rem] rounded px-3 py-1 text-sm font-medium transition-colors"
              :class="page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            :class="currentPage === totalPages
              ? 'bg-slate-800 text-slate-500'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Modal :show="showEditModal" @close="onCancel">
      <template #header>Edit Profile</template>
      <form @submit.prevent="onSave" class="space-y-4">
        <div>
          <label for="username" class="label">Username</label>
          <input id="username" v-model="form.username" class="input w-full" required />
        </div>
        <div>
          <label for="email" class="label">Email</label>
          <input id="email" v-model="form.email" type="email" class="input w-full" required />
        </div>
      </form>
      <template #footer>
        <button type="button" @click="onCancel" class="btn-outline" :disabled="saving">
          Cancel
        </button>
        <button type="button" @click="onSave" class="btn-primary" :disabled="saving">
          <span v-if="saving">Saving...</span>
          <span v-else>Save</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'
import Modal from '@/components/Common/Modal.vue'
import {
  getBalance,
  getPositions,
  getOrders,
  toggleAccount,
  resetAccount as resetAccountAPI,
  cancelOrder,
  type Balance,
  type Position,
  type Order,
} from '@/services/paperTradingApi'

defineOptions({ name: 'MyPageView' }) // multi-word name

const auth = useAuthStore()
const ui = useUiStore()

const showEditModal = ref(false)
const saving = ref(false)
const form = reactive({ username: '', email: '' })

// Paper Trading 상태
const balance = ref<Balance | null>(null)
const positions = ref<Position[]>([])
const orders = ref<Order[]>([])
const loading = ref(false)
const resetting = ref(false)
const toggling = ref(false)
const cancelling = ref<number | null>(null)
const error = ref<string | null>(null)

// 페이지네이션 상태
const currentPage = ref(1)
const itemsPerPage = 10

// 포맷터
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

const formatDateTime = (dateStr: string) => {
  // UTC 시간을 한국 시간(KST, UTC+9)으로 변환
  const date = new Date(dateStr + 'Z') // 'Z'를 추가하여 UTC로 파싱
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  })
}

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '0.00%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const getProfitColor = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return 'text-slate-400'
  return value > 0 ? 'text-rose-400' : 'text-blue-400'
}

// 수익률 계산
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
  return balance.value.profit_loss >= 0 ? 'text-rose-400' : 'text-blue-400'
})

// 페이지네이션 computed
const totalPages = computed(() => Math.ceil(orders.value.length / itemsPerPage))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return orders.value.slice(start, end)
})

// 페이지 변경
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 페이지 번호 배열 생성
const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxVisible = 5 // 표시할 최대 페이지 번호 개수

  if (totalPages.value <= maxVisible) {
    // 전체 페이지가 적으면 모두 표시
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // 현재 페이지를 중심으로 표시
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    // 끝에 도달하면 시작점 조정
    if (end === totalPages.value) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 주문 상태 라벨
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '대기 중',
    PARTIAL: '부분 체결',
    FILLED: '체결 완료',
    CANCELED: '취소됨',
  }
  return labels[status] || status
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-300',
    PARTIAL: 'bg-blue-500/20 text-blue-300',
    FILLED: 'bg-emerald-500/20 text-emerald-300',
    CANCELED: 'bg-slate-500/20 text-slate-400',
  }
  return classes[status] || 'bg-slate-500/20 text-slate-400'
}

// 데이터 로드
async function loadData() {
  loading.value = true
  error.value = null

  try {
    const [balanceData, positionsData, ordersData] = await Promise.all([
      getBalance(),
      getPositions(),
      getOrders(50),
    ])

    balance.value = balanceData
    positions.value = positionsData
    orders.value = ordersData
    currentPage.value = 1 // 데이터 새로고침 시 첫 페이지로
  } catch (e: any) {
    error.value = e.response?.data?.detail || '데이터를 불러올 수 없습니다'
  } finally {
    loading.value = false
  }
}

// 계좌 초기화
async function resetAccount() {
  if (!confirm('정말로 계좌를 초기화하시겠습니까? 모든 포지션과 거래 내역이 삭제됩니다.')) {
    return
  }

  resetting.value = true

  try {
    await resetAccountAPI()
    ui.pushToast({ type: 'success', message: '계좌가 초기화되었습니다' })
    await loadData()
  } catch (e: any) {
    ui.pushToast({
      type: 'error',
      message: e.response?.data?.detail || '계좌 초기화에 실패했습니다',
    })
  } finally {
    resetting.value = false
  }
}

// Kill Switch 토글
async function toggleActive() {
  if (!balance.value || toggling.value) return

  toggling.value = true

  try {
    const newStatus = !balance.value.is_active
    const updated = await toggleAccount(newStatus)
    balance.value = { ...balance.value, is_active: updated.is_active }

    ui.pushToast({
      type: 'success',
      message: `자동 거래가 ${newStatus ? '활성화' : '비활성화'}되었습니다`,
    })
  } catch (e: any) {
    ui.pushToast({
      type: 'error',
      message: e.response?.data?.detail || '상태 변경에 실패했습니다',
    })
  } finally {
    toggling.value = false
  }
}

// 주문 취소
async function handleCancelOrder(orderId: number) {
  if (!confirm('이 주문을 취소하시겠습니까?')) {
    return
  }

  cancelling.value = orderId

  try {
    await cancelOrder(orderId)
    ui.pushToast({ type: 'success', message: '주문이 취소되었습니다' })
    await loadData()
  } catch (e: any) {
    ui.pushToast({
      type: 'error',
      message: e.response?.data?.detail || '주문 취소에 실패했습니다',
    })
  } finally {
    cancelling.value = null
  }
}

// Profile 관련
function syncFormWithStore() {
  if (auth.user) {
    form.username = auth.user.name
    form.email = auth.user.email
  }
}

watch(showEditModal, (isShown) => {
  if (isShown) syncFormWithStore()
})

function onCancel() {
  showEditModal.value = false
}

function parseErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    try {
      const z = JSON.parse(err.message)
      if (Array.isArray(z) && typeof z[0]?.message === 'string') return z[0].message
    } catch {
      /* ignore */
    }
    return err.message || 'Failed to update profile.'
  }
  return 'Failed to update profile.'
}

async function onSave() {
  if (!auth.user) return
  saving.value = true
  try {
    await auth.updateUser({ name: form.username, email: form.email })
    ui.pushToast({ type: 'success', message: 'Profile updated successfully!' })
    showEditModal.value = false
  } catch (err: unknown) {
    ui.pushToast({ type: 'error', message: parseErrorMessage(err) })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
