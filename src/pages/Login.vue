<template>
  <div class="mx-auto max-w-md px-4 pt-10">
    <div class="card p-6">
      <h1 class="mb-4 text-xl font-semibold">Login</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="label">Username</label>
          <input v-model="username" class="input" autocomplete="username" />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="password" type="password" class="input" autocomplete="current-password" />
        </div>
        <button class="btn-primary w-full">Sign in</button>
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

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const username = ref('')
const password = ref('')

async function onSubmit() {
  try {
    await auth.login({ username: username.value, password: password.value })
    ui.pushToast({ type: 'success', message: 'Welcome back!' })
    router.push((route.query.from as string) || '/')
  } catch (e: any) {
    let errorMessage = 'An unknown error occurred. Please try again.'
    if (e.message?.includes('Invalid credentials')) {
      errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.'
    } else {
      // Zod 유효성 검사 오류 메시지 파싱
      try {
        const zodErrors = JSON.parse(e.message)
        if (Array.isArray(zodErrors) && zodErrors[0]?.message) {
          errorMessage = zodErrors[0].message // e.g., "String must contain at least 6 character(s)"
        }
      } catch (jsonError) {
        // JSON 파싱 실패 시 원본 메시지 사용
        errorMessage = e.message
      }
    }
    ui.pushToast({ type: 'error', message: errorMessage })
  }
}
</script>
