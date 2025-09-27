import { defineStore } from 'pinia'
import { loginApi, signupApi, meApi } from '@/mock/api'

export interface User {
  id: string
  email: string
  username: string
}

interface State {
  user: User | null
  token: string | null
}

const TOKEN_KEY = 'auth.token'
const USER_KEY = 'auth.user'

export const useAuthStore = defineStore('auth', {
  state: (): State => ({ user: null, token: null }),
  getters: {
    isAuthed: (s) => !!s.token,
  },

  actions: {
    async signup(payload: { username: string; email: string; password: string }) {
      await signupApi(payload)
      return this.login({ username: payload.username, password: payload.password })
    },

    async login(payload: { username: string; password: string }) {
      const { token } = await loginApi(payload)
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
      const u = await meApi(token)
      this.user = u
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    restore() {
      const token = localStorage.getItem(TOKEN_KEY)
      const userRaw = localStorage.getItem(USER_KEY)
      if (token) this.token = token
      if (userRaw) this.user = JSON.parse(userRaw)
    },
  },
})
