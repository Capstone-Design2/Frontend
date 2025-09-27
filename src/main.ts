import '@/styles/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useStrategyStore } from '@/stores/useStrategyStore'
import { useBacktestStore } from '@/stores/useBacktestStore'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Pinia 스토어 생성 후 상태 복원
useAuthStore().restore()
useStrategyStore().restore()
useBacktestStore().restore()

app.mount('#app')
