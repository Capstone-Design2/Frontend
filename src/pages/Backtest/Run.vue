<template>
  <div class="mx-auto max-w-6xl px-4 pt-6 pb-8">
    <!-- 헤더 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-100">백테스팅 실행</h1>
      <p class="mt-1 text-sm text-slate-400">
        LLM으로 생성한 전략을 선택하고 백테스팅 파라미터를 설정하세요.
      </p>
    </div>

    <!-- 에러 메시지 -->
    <div
      v-if="error"
      class="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg backdrop-blur"
    >
      <p class="text-sm text-rose-300">{{ error }}</p>
    </div>

    <!-- 백테스팅 설정 폼 -->
    <div class="card p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 전략 선택 -->
        <div>
          <label for="strategy" class="label">전략 선택</label>
          <select
            id="strategy"
            v-model="selectedStrategyId"
            required
            class="input mt-1.5"
            :disabled="isLoadingStrategies || isRunning"
          >
            <option value="" disabled>전략을 선택하세요</option>
            <option
              v-for="strategy in strategies"
              :key="strategy.strategy_id"
              :value="strategy.strategy_id"
            >
              {{ strategy.strategy_name }}
            </option>
          </select>
          <p v-if="isLoadingStrategies" class="mt-1.5 text-sm text-slate-400">
            전략 목록을 불러오는 중...
          </p>
        </div>

        <!-- 선택된 전략 정보 표시 -->
        <div v-if="selectedStrategy" class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 class="text-sm font-medium text-slate-200 mb-2.5">전략 상세 정보</h3>
          <div class="text-sm text-slate-400 space-y-1.5">
            <p><span class="text-slate-300">전략명:</span> {{ selectedStrategy.rules.strategy_name }}</p>
            <p v-if="selectedStrategy.description">
              <span class="text-slate-300">설명:</span> {{ selectedStrategy.description }}
            </p>
            <p>
              <span class="text-slate-300">지표 개수:</span>
              {{ selectedStrategy.rules.indicators.length }}개
            </p>
            <p>
              <span class="text-slate-300">매수 조건:</span>
              {{
                selectedStrategy.rules.buy_conditions.all
                  ? `${selectedStrategy.rules.buy_conditions.all.length}개 (AND)`
                  : `${selectedStrategy.rules.buy_conditions.any?.length}개 (OR)`
              }}
            </p>
            <p>
              <span class="text-slate-300">매도 조건:</span>
              {{
                selectedStrategy.rules.sell_conditions.all
                  ? `${selectedStrategy.rules.sell_conditions.all.length}개 (AND)`
                  : `${selectedStrategy.rules.sell_conditions.any?.length}개 (OR)`
              }}
            </p>
          </div>
        </div>

        <!-- 종목 코드 -->
        <div>
          <label for="ticker" class="label">종목 코드</label>
          <input
            id="ticker"
            v-model="ticker"
            type="text"
            required
            placeholder="예: 005930 (삼성전자)"
            class="input mt-1.5"
            :disabled="isRunning"
          />
          <p class="mt-1.5 text-sm text-slate-400">한국 주식 6자리 종목 코드를 입력하세요</p>
        </div>

        <!-- 백테스팅 기간 -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="start-date" class="label">시작일</label>
            <input
              id="start-date"
              v-model="startDate"
              type="date"
              required
              class="input mt-1.5"
              :disabled="isRunning"
            />
          </div>

          <div>
            <label for="end-date" class="label">종료일</label>
            <input id="end-date" v-model="endDate" type="date" required class="input mt-1.5" :disabled="isRunning" />
          </div>
        </div>

        <!-- 실행 버튼 -->
        <div class="flex justify-end space-x-3 pt-2">
          <button type="button" @click="resetForm" class="btn-outline" :disabled="isRunning">
            초기화
          </button>
          <button type="submit" class="btn-primary" :disabled="!canSubmit || isRunning">
            <span v-if="isRunning" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              백테스팅 실행 중...
            </span>
            <span v-else>백테스팅 실행</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 최근 실행 결과 -->
    <div v-if="recentResults.length > 0" class="mt-8">
      <h2 class="text-lg font-medium text-slate-100 mb-4">최근 백테스팅 결과</h2>
      <div class="card overflow-hidden">
        <ul class="divide-y divide-slate-800">
          <li
            v-for="result in recentResults"
            :key="result.result_id"
            class="hover:bg-slate-800/50 transition-colors"
          >
            <div class="w-full flex items-center justify-between px-6 py-4">
              <button
                type="button"
                class="flex-1 text-left flex items-center justify-between cursor-pointer"
                @click="viewResult(result.job_id)"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-200">{{ result.kpi.strategy_name }}</p>
                  <p class="text-sm text-slate-400">
                    Job ID: {{ result.job_id }} · {{ formatDate(result.created_at) }}
                  </p>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <p
                      class="text-sm font-medium tabular-nums"
                      :class="result.kpi.total_return >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                    >
                      수익률: {{ formatPercent(result.kpi.total_return) }}
                    </p>
                    <p class="text-sm text-slate-400 tabular-nums">
                      샤프: {{ result.kpi.sharpe_ratio?.toFixed(2) ?? 'N/A' }} · MDD:
                      {{ formatPercent(result.max_drawdown) }}
                    </p>
                  </div>
                  <svg
                    class="h-5 w-5 text-slate-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </button>
              <button
                type="button"
                @click.stop="deleteResult(result.result_id)"
                class="ml-3 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                title="삭제"
              >
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useBacktestStore } from '@/stores/useBacktestStore'
import type { Strategy } from '@/types/Strategy'

const router = useRouter()
const strategyStore = useStrategyStore()
const backtestStore = useBacktestStore()

// State
const selectedStrategyId = ref<number | ''>('')
const ticker = ref('005930')
const startDate = ref('')
const endDate = ref('')
const isRunning = ref(false)
const error = ref<string | null>(null)

// Computed
const strategies = computed(() => strategyStore.strategies)
const isLoadingStrategies = computed(() => strategyStore.isStrategyLoading)
const recentResults = computed(() => backtestStore.results.slice(0, 5))

const selectedStrategy = computed<Strategy | undefined>(() => {
  if (!selectedStrategyId.value) return undefined
  return strategies.value.find((s) => s.strategy_id === selectedStrategyId.value)
})

const canSubmit = computed(() => {
  return selectedStrategyId.value && ticker.value && startDate.value && endDate.value
})

// Methods
const setDefaultDates = () => {
  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  endDate.value = today.toISOString().split('T')[0]
  startDate.value = oneYearAgo.toISOString().split('T')[0]
}

const resetForm = () => {
  selectedStrategyId.value = ''
  ticker.value = '005930'
  setDefaultDates()
  error.value = null
}

const handleSubmit = async () => {
  if (!selectedStrategy.value) {
    error.value = '전략을 선택해주세요.'
    return
  }

  isRunning.value = true
  error.value = null

  try {
    const result = await backtestStore.executeBacktest({
      ticker: ticker.value,
      start_date: startDate.value,
      end_date: endDate.value,
      strategy_definition: selectedStrategy.value.rules,
    })

    // 최근 결과 목록 새로고침
    await backtestStore.fetchResults(5)

    // 결과 페이지로 이동
    router.push({
      name: 'backtest-results',
      params: { jobId: result.job_id.toString() },
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '백테스팅 실행 중 오류가 발생했습니다.'
    console.error('Backtest execution error:', err)
  } finally {
    isRunning.value = false
  }
}

const viewResult = (jobId: number) => {
  console.log('viewResult clicked, jobId:', jobId)
  console.log('Navigating to backtest-results with jobId:', jobId)
  router.push({
    name: 'backtest-results',
    params: { jobId: jobId.toString() },
  })
}

const deleteResult = async (resultId: number) => {
  if (!confirm('이 백테스팅 결과를 삭제하시겠습니까?')) {
    return
  }

  try {
    await backtestStore.deleteResult(resultId)
    // 성공 시 목록 새로고침
    await backtestStore.fetchResults(5)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '백테스팅 결과 삭제 중 오류가 발생했습니다.'
    console.error('Delete result error:', err)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(2)}%`
}

// Lifecycle
onMounted(async () => {
  setDefaultDates()
  await strategyStore.fetchStrategies()
  await backtestStore.fetchResults(5)
  console.log('Recent results loaded:', recentResults.value)
  console.log('Recent results count:', recentResults.value.length)
})
</script>
