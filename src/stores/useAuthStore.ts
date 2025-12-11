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
      console.log('🔐 [AUTH] Login started for:', payload.username)

      // 0) 기존 세션 정리
      this.logout()

      // 1) 로그인 → 토큰 획득
      const { token } = await loginApi(payload)
      console.log('🎫 [AUTH] Token received:', token.substring(0, 20) + '...')
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)

      // 2) 내 정보 조회
      const u = await meApi()
      console.log('👤 [AUTH] User info received:', u)
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

    async restore() {
      const token = localStorage.getItem(TOKEN_KEY)
      const userRaw = localStorage.getItem(USER_KEY)

      if (!token || !userRaw) {
        this.logout()
        return
      }

      this.token = token
      this.user = JSON.parse(userRaw) as User

      // 토큰 유효성 검증 (선택적)
      try {
        const u = await meApi()
        this.user = u
        localStorage.setItem(USER_KEY, JSON.stringify(u))
      } catch (err) {
        // 토큰이 만료되었거나 유효하지 않으면 로그아웃
        console.warn('Token validation failed, logging out:', err)
        this.logout()
      }
    },
  },
})
