<template>
  <div class="mx-auto max-w-7xl px-4 pt-6 pb-8">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg
          class="animate-spin h-12 w-12 text-blue-500 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-4 text-slate-400">백테스팅 결과를 불러오는 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="py-12">
      <div class="card p-6 border-rose-500/30 bg-rose-500/10">
        <h3 class="text-lg font-medium text-rose-300">오류 발생</h3>
        <p class="mt-2 text-sm text-rose-200">{{ error }}</p>
        <button
          @click="router.push({ name: 'backtest-run' })"
          class="mt-4 btn-primary"
        >
          백테스팅 페이지로 돌아가기
        </button>
      </div>
    </div>

    <!-- 결과 표시 -->
    <div v-else-if="result" class="space-y-6">
      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">{{ result.kpi.strategy_name }}</h1>
          <p class="mt-1 text-sm text-slate-400">
            Job ID: {{ result.job_id }} · 생성: {{ formatDate(result.created_at) }}
          </p>
        </div>
        <button
          @click="router.push({ name: 'backtest-run' })"
          class="btn-outline"
        >
          새 백테스팅 실행
        </button>
      </div>

      <!-- 수익성 지표 -->
      <div>
        <h2 class="text-lg font-medium text-slate-100 mb-3">수익성 지표</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- 총 수익률 -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">총 수익률</dt>
              <dd
                class="mt-1 text-2xl font-semibold tabular-nums"
                :class="result.kpi.total_return >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ formatPercent(result.kpi.total_return) }}
              </dd>
            </dl>
          </div>

          <!-- CAGR -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">연평균 수익률 (CAGR)</dt>
              <dd
                class="mt-1 text-2xl font-semibold tabular-nums"
                :class="result.kpi.cagr >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ formatPercent(result.kpi.cagr) }}
              </dd>
            </dl>
          </div>

          <!-- 승률 -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">승률</dt>
              <dd class="mt-1 text-2xl font-semibold text-slate-200 tabular-nums">
                {{ formatPercent(result.kpi.win_rate) }}
              </dd>
            </dl>
          </div>

          <!-- 손익비 -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">손익비 (Profit Factor)</dt>
              <dd class="mt-1 text-2xl font-semibold text-slate-200 tabular-nums">
                {{ formatProfitFactor(result.kpi.profit_factor) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- 리스크 지표 -->
      <div>
        <h2 class="text-lg font-medium text-slate-100 mb-3">리스크 지표</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <!-- 샤프 비율 -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">샤프 비율</dt>
              <dd class="mt-1 text-2xl font-semibold text-slate-200 tabular-nums">
                {{ result.kpi.sharpe_ratio?.toFixed(2) ?? 'N/A' }}
              </dd>
            </dl>
          </div>

          <!-- 소티노 비율 -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">소티노 비율</dt>
              <dd class="mt-1 text-2xl font-semibold text-slate-200 tabular-nums">
                {{ result.kpi.sortino_ratio?.toFixed(2) ?? 'N/A' }}
              </dd>
            </dl>
          </div>

          <!-- MDD -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">최대 낙폭 (MDD)</dt>
              <dd class="mt-1 text-2xl font-semibold text-rose-400 tabular-nums">
                {{ formatPercent(result.max_drawdown) }}
              </dd>
            </dl>
          </div>

          <!-- VaR -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">VaR (95%)</dt>
              <dd class="mt-1 text-2xl font-semibold text-rose-400 tabular-nums">
                {{ formatPercent(result.kpi.var_95) }}
              </dd>
            </dl>
          </div>

          <!-- CVaR -->
          <div class="card p-5">
            <dl>
              <dt class="text-sm font-medium text-slate-400 truncate">CVaR (95%)</dt>
              <dd class="mt-1 text-2xl font-semibold text-rose-400 tabular-nums">
                {{ formatPercent(result.kpi.cvar_95) }}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- 추가 통계 -->
      <div class="card p-6">
        <h2 class="text-lg font-medium text-slate-100 mb-4">거래 통계</h2>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <div>
            <dt class="text-sm font-medium text-slate-400">완료된 거래</dt>
            <dd class="mt-1 text-lg font-semibold text-slate-200 tabular-nums">
              {{ result.kpi.completed_trades }}회
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">승률</dt>
            <dd class="mt-1 text-lg font-semibold text-slate-200 tabular-nums">
              {{ formatPercent(result.kpi.win_rate) }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">총 액션</dt>
            <dd class="mt-1 text-lg font-semibold text-slate-200 tabular-nums">
              {{ result.kpi.total_actions }}회 (매수: {{ result.kpi.buy_count }}, 매도:
              {{ result.kpi.sell_count }})
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">초기 자본</dt>
            <dd class="mt-1 text-lg font-semibold text-slate-200 tabular-nums">
              {{ formatCurrency(result.kpi.initial_cash) }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">최종 포트폴리오 가치</dt>
            <dd
              class="mt-1 text-lg font-semibold tabular-nums"
              :class="
                result.kpi.final_portfolio_value >= result.kpi.initial_cash
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              "
            >
              {{ formatCurrency(result.kpi.final_portfolio_value) }}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">손익</dt>
            <dd
              class="mt-1 text-lg font-semibold tabular-nums"
              :class="
                result.kpi.final_portfolio_value - result.kpi.initial_cash >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              "
            >
              {{ formatCurrency(result.kpi.final_portfolio_value - result.kpi.initial_cash) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Equity Curve 차트 -->
      <div class="card p-6">
        <h2 class="text-lg font-medium text-slate-100 mb-4">포트폴리오 가치 변화</h2>
        <div class="h-96">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- 드로우다운 차트 -->
      <div class="card p-6">
        <h2 class="text-lg font-medium text-slate-100 mb-4">드로우다운 차트</h2>
        <div class="h-80">
          <canvas ref="drawdownChartCanvas"></canvas>
        </div>
      </div>

      <!-- 포지션 히트맵 -->
      <div class="card p-6">
        <h2 class="text-lg font-medium text-slate-100 mb-4">포지션 히트맵</h2>
        <p class="text-sm text-slate-400 mb-4">
          녹색: 포지션 보유 중 | 회색: 포지션 없음
        </p>
        <div class="h-20 relative">
          <canvas ref="positionHeatmapCanvas"></canvas>
        </div>
      </div>

      <!-- 거래 내역 테이블 -->
      <div class="card overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-lg font-medium text-slate-100">거래 내역</h2>
          <p class="text-sm text-slate-400">
            총 {{ result.kpi.trades.length }}건
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800">
            <thead class="bg-slate-800/50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  일시
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  유형
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  가격
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  수량
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  손익
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr v-for="(trade, index) in paginatedTrades" :key="index" class="hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {{ formatDate(trade.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 text-xs font-semibold rounded-full"
                    :class="
                      trade.type === 'buy'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    "
                  >
                    {{ trade.type === 'buy' ? '매수' : '매도' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300 tabular-nums">
                  {{ formatCurrency(trade.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300 tabular-nums">
                  {{ trade.quantity.toFixed(0) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium tabular-nums"
                  :class="trade.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ trade.type === 'sell' ? formatCurrency(trade.profit) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div class="text-sm text-slate-400">
            {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, result.kpi.trades.length) }} / {{ result.kpi.trades.length }}
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentPage === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'"
            >
              처음
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentPage === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'"
            >
              이전
            </button>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="px-3 py-1 text-sm rounded-md transition-colors"
                :class="page === currentPage ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-slate-800'"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentPage === totalPages ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'"
            >
              다음
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentPage === totalPages ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'"
            >
              마지막
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-else class="py-12">
      <div class="text-center">
        <p class="text-slate-400">백테스팅 결과를 찾을 수 없습니다.</p>
        <button
          @click="router.push({ name: 'backtest-run' })"
          class="mt-4 btn-primary"
        >
          백테스팅 실행하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBacktestStore } from '@/stores/useBacktestStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const route = useRoute()
const router = useRouter()
const backtestStore = useBacktestStore()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const drawdownChartCanvas = ref<HTMLCanvasElement | null>(null)
const positionHeatmapCanvas = ref<HTMLCanvasElement | null>(null)

let chartInstance: Chart | null = null
let drawdownChartInstance: Chart | null = null
let positionHeatmapInstance: Chart | null = null

const jobId = computed(() => {
  const id = route.params.jobId
  return typeof id === 'string' ? Number.parseInt(id, 10) : null
})

const result = computed(() => backtestStore.currentResult)
const isLoading = computed(() => backtestStore.isLoading)
const error = computed(() => backtestStore.error)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

// Computed properties for pagination
const paginatedTrades = computed(() => {
  if (!result.value) return []
  // 최신순으로 정렬 (날짜 내림차순)
  const sortedTrades = [...result.value.kpi.trades].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedTrades.slice(start, end)
})

const totalPages = computed(() => {
  if (!result.value) return 0
  return Math.ceil(result.value.kpi.trades.length / pageSize.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // Show 2 pages on each side of current

  const range = []
  const rangeStart = Math.max(1, current - delta)
  const rangeEnd = Math.min(total, current + delta)

  for (let i = rangeStart; i <= rangeEnd; i++) {
    range.push(i)
  }

  return range
})

// Methods
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)}%`
}

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('ko-KR')} 원`
}

const formatProfitFactor = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A'
  if (value === Infinity || value > 999) return '∞'
  return value.toFixed(2)
}

const createChart = () => {
  if (!chartCanvas.value || !result.value) return

  // 이전 차트 파괴
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const equityCurve = result.value.equity_curve
  const labels = equityCurve.map((point) => formatDate(point.timestamp))
  const data = equityCurve.map((point) => point.value)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '포트폴리오 가치',
          data,
          borderColor: 'rgb(52, 211, 153)', // emerald-400
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: 'rgb(226, 232, 240)', // slate-200
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
          titleColor: 'rgb(226, 232, 240)', // slate-200
          bodyColor: 'rgb(203, 213, 225)', // slate-300
          borderColor: 'rgb(51, 65, 85)', // slate-700
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y
              return `가치: ${formatCurrency(value)}`
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 10,
            color: 'rgb(148, 163, 184)', // slate-400
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)', // slate-700 with opacity
          },
        },
        y: {
          display: true,
          ticks: {
            color: 'rgb(148, 163, 184)', // slate-400
            callback: (value) => {
              return formatCurrency(value as number)
            },
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)', // slate-700 with opacity
          },
        },
      },
    },
  })
}

const createDrawdownChart = () => {
  if (!drawdownChartCanvas.value || !result.value) return

  if (drawdownChartInstance) {
    drawdownChartInstance.destroy()
  }

  const ctx = drawdownChartCanvas.value.getContext('2d')
  if (!ctx) return

  const drawdownData = result.value.kpi.drawdown_series || []
  const labels = drawdownData.map((point) => formatDate(point.timestamp))
  const data = drawdownData.map((point) => point.drawdown * 100) // Convert to percentage

  drawdownChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '드로우다운 (%)',
          data,
          borderColor: 'rgb(251, 113, 133)', // rose-400
          backgroundColor: 'rgba(251, 113, 133, 0.1)',
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: 'rgb(226, 232, 240)', // slate-200
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
          titleColor: 'rgb(226, 232, 240)', // slate-200
          bodyColor: 'rgb(203, 213, 225)', // slate-300
          borderColor: 'rgb(51, 65, 85)', // slate-700
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y
              return `드로우다운: ${value.toFixed(2)}%`
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 10,
            color: 'rgb(148, 163, 184)', // slate-400
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)', // slate-700 with opacity
          },
        },
        y: {
          display: true,
          ticks: {
            color: 'rgb(148, 163, 184)', // slate-400
            callback: (value) => {
              return `${value}%`
            },
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)', // slate-700 with opacity
          },
        },
      },
    },
  })
}

const createPositionHeatmap = () => {
  if (!positionHeatmapCanvas.value || !result.value) return

  if (positionHeatmapInstance) {
    positionHeatmapInstance.destroy()
  }

  const ctx = positionHeatmapCanvas.value.getContext('2d')
  if (!ctx) return

  const positionData = result.value.kpi.position_history || []
  const labels = positionData.map((point) => formatDate(point.timestamp))
  const data = positionData.map((point) => (point.has_position ? 1 : 0))

  positionHeatmapInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '포지션',
          data,
          backgroundColor: data.map((val) =>
            val === 1 ? 'rgba(52, 211, 153, 0.8)' : 'rgba(100, 116, 139, 0.3)'
          ), // emerald-400 or slate-500
          borderWidth: 0,
          barPercentage: 1,
          categoryPercentage: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: 'rgb(226, 232, 240)',
          bodyColor: 'rgb(203, 213, 225)',
          borderColor: 'rgb(51, 65, 85)',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const index = context.dataIndex
              const point = positionData[index]
              if (point.has_position) {
                return [
                  '포지션: 보유 중',
                  `수량: ${point.quantity.toFixed(0)}`,
                  `진입가: ${formatCurrency(point.entry_price)}`,
                ]
              } else {
                return '포지션: 없음'
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
          min: 0,
          max: 1,
        },
      },
    },
  })
}

// Watch for result changes to update charts and reset pagination
watch(
  () => result.value,
  async (newResult) => {
    if (newResult) {
      // Reset pagination
      currentPage.value = 1

      // Update charts
      await nextTick()
      createChart()
      createDrawdownChart()
      createPositionHeatmap()
    }
  },
)

// Lifecycle
onMounted(async () => {
  if (jobId.value) {
    try {
      await backtestStore.fetchResultByJobId(jobId.value)
    } catch (err) {
      console.error('Failed to fetch backtest result:', err)
    }
  }
})
</script>
