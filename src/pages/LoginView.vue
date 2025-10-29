<template>
  <div class="mx-auto max-w-md px-4 pt-10">
    <div class="card p-6">
      <h1 class="mb-4 text-xl font-semibold">Login</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="label" for="username">Username</label>
          <input id="username" v-model="username" class="input" autocomplete="username" required />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input"
            autocomplete="current-password"
            required
          />
        </div>
        <button class="btn-primary w-full" :disabled="loading">
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>
      <p class="mt-3 text-center text-sm text-slate-400">
        No account? <RouterLink class="underline" to="/signup">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'

defineOptions({ name: 'LoginView' }) // multi-word 컴포넌트 네이밍

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

function parseErrorMessage(err: unknown): string {
  // http.ts에서 new Error(...)로 통일되어 들어오지만, 방어적으로 처리
  if (err instanceof Error) {
    // 1) 자주 쓰는 패턴: 인증 실패 메시지
    if (err.message.includes('Invalid credentials')) {
      return '아이디 또는 비밀번호가 올바르지 않습니다.'
    }
    // 2) 혹시 서버가 Zod 배열을 문자열로 실어 보냈다면 시도
    try {
      const asJson = JSON.parse(err.message)
      if (Array.isArray(asJson) && asJson[0]?.message && typeof asJson[0].message === 'string') {
        return asJson[0].message
      }
    } catch {
      /* ignore JSON parse fail */
    }
    // 3) 기본 메시지
    return err.message || 'An unknown error occurred. Please try again.'
  }
  return 'An unknown error occurred. Please try again.'
}

async function onSubmit() {
  if (!username.value || !password.value) return
  loading.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    ui.pushToast({ type: 'success', message: 'Welcome back!' })
    const from = typeof route.query.from === 'string' ? route.query.from : '/'
    router.push(from)
  } catch (err: unknown) {
    const errorMessage = parseErrorMessage(err)
    ui.pushToast({ type: 'error', message: errorMessage })
  } finally {
    loading.value = false
  }
}
</script>
