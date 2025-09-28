<template>
  <div class="mx-auto max-w-2xl px-4 pt-10">
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
            <p>{{ auth.user?.username }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-400">Email</h3>
            <p>{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Summary -->
    <h2 class="mb-4 text-xl font-semibold">My Portfolio</h2>
    <div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div class="card p-4">
        <h3 class="text-sm font-medium text-slate-400">Total Value</h3>
        <p class="text-2xl font-semibold">${{ portfolioStore.totalValue.toLocaleString() }}</p>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-medium text-slate-400">Portfolio Value</h3>
        <p class="text-2xl font-semibold">${{ portfolioStore.portfolioValue.toLocaleString() }}</p>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-medium text-slate-400">Available Cash</h3>
        <p class="text-2xl font-semibold">${{ portfolioStore.cash.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Positions -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold">Open Positions</h3>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800">
            <thead class="bg-slate-900">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">Symbol</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Quantity</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Avg. Price</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Market Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr v-if="portfolioStore.positions.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-slate-400">No open positions.</td>
              </tr>
              <tr v-for="pos in portfolioStore.positions" :key="pos.symbol">
                <td class="px-4 py-2 font-medium">{{ pos.symbol }}</td>
                <td class="px-4 py-2 text-right">{{ pos.quantity }}</td>
                <td class="px-4 py-2 text-right">${{ pos.averagePrice.toFixed(2) }}</td>
                <td class="px-4 py-2 text-right">
                  ${{ (pos.quantity * pos.averagePrice).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Trade History -->
    <div>
      <h3 class="mb-4 text-lg font-semibold">Trade History</h3>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-800">
            <thead class="bg-slate-900">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-semibold">Date</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">Type</th>
                <th class="px-4 py-2 text-left text-sm font-semibold">Symbol</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Quantity</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Price</th>
                <th class="px-4 py-2 text-right text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr v-if="portfolioStore.tradeHistory.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-slate-400">No trade history.</td>
              </tr>
              <tr v-for="trade in portfolioStore.tradeHistory" :key="trade.id">
                <td class="px-4 py-2 text-sm text-slate-400">
                  {{ new Date(trade.timestamp).toLocaleString() }}
                </td>
                <td
                  class="px-4 py-2 font-medium"
                  :class="trade.type === 'buy' ? 'text-success' : 'text-danger'"
                >
                  {{ trade.type.toUpperCase() }}
                </td>
                <td class="px-4 py-2">{{ trade.symbol }}</td>
                <td class="px-4 py-2 text-right">{{ trade.quantity }}</td>
                <td class="px-4 py-2 text-right">${{ trade.price.toFixed(2) }}</td>
                <td class="px-4 py-2 text-right">
                  ${{ (trade.quantity * trade.price).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Modal :show="showEditModal" @close="onCancel">
      <template #header>Edit Profile</template>
      <form @submit.prevent="onSave" class="space-y-4">
        <div>
          <label for="username" class="label">Username</label>
          <input id="username" v-model="form.username" class="input w-full" />
        </div>
        <div>
          <label for="email" class="label">Email</label>
          <input id="email" v-model="form.email" type="email" class="input w-full" />
        </div>
      </form>
      <template #footer>
        <button type="button" @click="onCancel" class="btn-outline">Cancel</button>
        <button type="button" @click="onSave" class="btn-primary">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePortfolioStore } from '@/stores/usePortfolioStore'
import { useUiStore } from '@/stores/useUiStore'
import Modal from '@/components/Common/Modal.vue'

const auth = useAuthStore()
const portfolioStore = usePortfolioStore()
const ui = useUiStore()

const showEditModal = ref(false)
const form = reactive({
  username: '',
  email: '',
})

function syncFormWithStore() {
  if (auth.user) {
    form.username = auth.user.username
    form.email = auth.user.email
  }
}

watch(
  showEditModal,
  (isShown) => {
    if (isShown) {
      syncFormWithStore()
    }
  },
  { immediate: true },
)

function onCancel() {
  showEditModal.value = false
}

async function onSave() {
  if (!auth.user) return

  try {
    await auth.updateUser(form)
    ui.pushToast({ type: 'success', message: 'Profile updated successfully!' })
    showEditModal.value = false
  } catch (e: any) {
    ui.pushToast({ type: 'error', message: e.message || 'Failed to update profile.' })
  }
}
</script>
