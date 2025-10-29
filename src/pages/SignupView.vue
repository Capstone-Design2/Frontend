<template>
  <div class="mx-auto max-w-md px-4 pt-10">
    <div class="card p-6">
      <h1 class="mb-4 text-xl font-semibold">Create account</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="label" for="username">Username</label>
          <input id="username" v-model="form.name" class="input" autocomplete="username" required />
        </div>
        <div>
          <label class="label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            class="input"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            autocomplete="new-password"
            minlength="6"
            required
          />
        </div>
        <button class="btn-primary w-full" :disabled="loading">
          <span v-if="loading">Signing up...</span>
          <span v-else>Sign up</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'

defineOptions({ name: 'SignupView' }) // multi-word name

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const form = reactive({ name: '', email: '', password: '' })
const loading = ref(false)

function parseErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // 서버가 Zod 오류 배열을 문자열로 보낼 수 있으므로 파싱 시도
    try {
      const z = JSON.parse(err.message)
      if (Array.isArray(z) && typeof z[0]?.message === 'string') return z[0].message
    } catch {
      /* ignore */
    }
    return err.message || 'An unknown error occurred. Please try again.'
  }
  return 'An unknown error occurred. Please try again.'
}

async function onSubmit() {
  loading.value = true
  try {
    await auth.signup({ ...form })
    ui.pushToast({ type: 'success', message: 'Account created' })
    router.push('/')
  } catch (err: unknown) {
    ui.pushToast({ type: 'error', message: parseErrorMessage(err) })
  } finally {
    loading.value = false
  }
}
</script>
