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
import { ref, computed } from 'vue'
import { usePortfolioStore } from '@/stores/usePortfolioStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { useUiStore } from '@/stores/useUiStore'

const portfolioStore = usePortfolioStore()
const marketStore = useMarketStore()
const uiStore = useUiStore()

const quantity = ref(1)

const symbol = computed(() => marketStore.symbol)
const price = computed(() => marketStore.livePrice)
const isValid = computed(() => quantity.value > 0 && price.value !== null)

async function handleTrade(type: 'buy' | 'sell') {
  if (!isValid.value || !price.value) return

  try {
    if (type === 'buy') {
      portfolioStore.executeBuy(symbol.value, quantity.value, price.value)
    } else {
      portfolioStore.executeSell(symbol.value, quantity.value, price.value)
    }
    uiStore.pushToast({
      type: 'success',
      message: `Successfully ${type} ${quantity.value} ${symbol.value}`,
    })
  } catch (e: any) {
    uiStore.pushToast({ type: 'error', message: e.message })
  }
}
</script>
