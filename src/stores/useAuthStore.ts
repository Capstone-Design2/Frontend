import { defineStore } from 'pinia'
import { loginApi, signupApi, meApi, updateUserApi, type User } from '@/services/authApi'

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
    async signup(payload: { email: string; name: string; password: string }) {
      return await signupApi(payload)
    },

    async login(payload: { username: string; password: string }) {
      // 1) 로그인 → 토큰 획득
      const { token } = await loginApi(payload)
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)

      // 2) 내 정보 조회
      const u = await meApi()
      this.user = u
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    },

    async updateUser(payload: { name: string; email: string }) {
      if (!this.user) throw new Error('User not authenticated')
      const updatedUser = await updateUserApi(this.user.id, payload)
      this.user = updatedUser
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
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
      if (userRaw) this.user = JSON.parse(userRaw) as User
    },
  },
})
