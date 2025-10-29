// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/styles/index.css'

import { useAuthStore } from '@/stores/useAuthStore'
import { usePortfolioStore } from '@/stores/usePortfolioStore'
import { useBacktestStore } from '@/stores/useBacktestStore'
import { useStrategyStore } from '@/stores/useStrategyStore' // ← 존재 가정

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// ✅ 안전하게 복원
const auth = useAuthStore()
auth.restore?.()

const portfolio = usePortfolioStore()
portfolio.restore?.()

const backtest = useBacktestStore()
backtest.restore?.()

const strategies = useStrategyStore()
strategies.restore?.()

app.mount('#app')
