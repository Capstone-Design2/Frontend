<template>
  <div class="card p-4">
    <h3 class="mb-3 font-medium">Trade</h3>
    <form @submit.prevent="onTrade" class="space-y-4">
      <div>
        <label for="trade-symbol" class="label">Symbol</label>
        <input id="trade-symbol" :value="symbol" class="input" disabled />
      </div>
      <div>
        <label for="trade-quantity" class="label">Quantity</label>
        <input id="trade-quantity" v-model.number="quantity" type="number" class="input" min="1" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="handleTrade('buy')"
          class="btn-success w-full rounded-md bg-green-600 hover:bg-green-700"
          :disabled="!isValid"
        >
          Buy
        </button>
        <button
          type="button"
          @click="handleTrade('sell')"
          class="btn-danger w-full rounded-md bg-red-600 hover:bg-red-700"
          :disabled="!isValid"
        >
          Sell
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketStore } from '@/stores/useMarketStore'
import { useUiStore } from '@/stores/useUiStore'
import { submitOrder, createAccount } from '@/services/paperTradingApi'

const marketStore = useMarketStore()
const uiStore = useUiStore()

const quantity = ref(1)
const isSubmitting = ref(false)

const symbol = computed(() => marketStore.symbol)
const price = computed(() => marketStore.livePrice)
const isValid = computed(() => quantity.value > 0 && !isSubmitting.value)

// 계좌 자동 생성
onMounted(async () => {
  try {
    await createAccount(10000000)
  } catch (e) {
    // 이미 계좌가 있으면 무시
    console.log('[TradeWidget] Account already exists or created')
  }
})

async function handleTrade(type: 'buy' | 'sell') {
  if (!isValid.value) return

  isSubmitting.value = true

  try {
    // TradingView 형식(KRX:000660 또는 000660.KS)에서 KIS 코드(000660)만 추출
    let kisCode = symbol.value

    // "KRX:" 접두사 제거
    if (kisCode.includes(':')) {
      kisCode = kisCode.split(':')[1]
    }

    // ".KS" 또는 ".KQ" 접미사 제거
    if (kisCode.includes('.')) {
      kisCode = kisCode.split('.')[0]
    }

    const order = await submitOrder({
      ticker_code: kisCode,
      side: type.toUpperCase() as 'BUY' | 'SELL',
      quantity: quantity.value,
      order_type: 'MARKET',
    })

    uiStore.pushToast({
      type: 'success',
      message: `${type === 'buy' ? '매수' : '매도'} 주문이 제출되었습니다 (주문 ID: ${order.order_id})`,
    })

    // 주문 후 수량 초기화
    quantity.value = 1
  } catch (e: any) {
    const errorMsg = e.response?.data?.detail || e.message || '주문 처리 중 오류가 발생했습니다'
    uiStore.pushToast({ type: 'error', message: errorMsg })
  } finally {
    isSubmitting.value = false
  }
}
</script>
