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
      <p class="mt-3 text-center text-sm text-slate-400">No account? <RouterLink class="underline" to="/signup">Sign up</RouterLink></p>
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
    ui.pushToast({ type:'success', message:'Welcome back!' })
    router.push((route.query.from as string) || '/')
  } catch (e:any) {
    ui.pushToast({ type:'error', message: e.message })
  }
}
</script>
