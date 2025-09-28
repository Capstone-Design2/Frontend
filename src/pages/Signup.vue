<template>
  <div class="mx-auto max-w-md px-4 pt-10">
    <div class="card p-6">
      <h1 class="mb-4 text-xl font-semibold">Create account</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="label">Username</label>
          <input v-model="form.username" class="input" autocomplete="username" />
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" class="input" type="email" autocomplete="email" />
        </div>
        <div>
          <label class="label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            autocomplete="new-password"
          />
        </div>
        <button class="btn-primary w-full">Sign up</button>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const form = reactive({ username: '', email: '', password: '' })

async function onSubmit() {
  try {
    await auth.signup(form)
    ui.pushToast({ type: 'success', message: 'Account created' })
    router.push('/')
  } catch (e: any) {
    let errorMessage = 'An unknown error occurred. Please try again.'
    if (e.message) {
      // Zod 유효성 검사 오류 메시지 파싱
      try {
        const zodErrors = JSON.parse(e.message)
        if (Array.isArray(zodErrors) && zodErrors[0]?.message) {
          errorMessage = zodErrors[0].message
        } else {
          errorMessage = e.message
        }
      } catch (jsonError) {
        // JSON 파싱 실패 시 원본 메시지 사용 (예: "Username already exists")
        errorMessage = e.message
      }
    }
    ui.pushToast({ type: 'error', message: errorMessage })
  }
}
</script>
