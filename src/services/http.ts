import axios, { isAxiosError } from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router'

// 서버가 에러 바디에 내려주는 형태를 명시
type ApiErrorResponse = {
  message?: string
  detail?: string
  [key: string]: unknown
}

// Axios 요청 설정에 재시도 메타 확장
declare module 'axios' {
  interface AxiosRequestConfig {
    _retryCount?: number
  }
}

// 환경변수(없으면 기본값)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/caps_lock/api'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const isIdempotent = (method?: string) =>
  ['get', 'head', 'options'].includes((method ?? '').toLowerCase())

function extractMessage(error: AxiosError<ApiErrorResponse>): string {
  const data = error.response?.data
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string') return data.message
    if (typeof data.detail === 'string') return data.detail
  }
  return error.message || 'Unexpected error'
}

// Request 인터셉터: 토큰 주입
http.interceptors.request.use((config) => {
  const { token } = useAuthStore()
  if (token) {
    const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders
    headers.Authorization = `Bearer ${token}`
    config.headers = headers
  }
  return config
})

// Response 인터셉터: 에러 통합 + 제한적 재시도
http.interceptors.response.use(
  (r) => r,
  async (err: unknown) => {
    // AxiosError 아닌 예외 (네트워크/런타임)
    if (!isAxiosError<ApiErrorResponse>(err)) {
      const fallbackMsg = err instanceof Error ? err.message : 'Network error'
      return Promise.reject(new Error(fallbackMsg))
    }

    const error = err as AxiosError<ApiErrorResponse>
    const { config } = error
    const status = error.response?.status
    const errMsg = extractMessage(error)

    // 401: 세션 만료 처리
    if (status === 401) {
      const auth = useAuthStore()
      if (auth.token) auth.logout()
      const current = router.currentRoute?.value
      if (!current || current.name !== 'login') {
        router.push({ name: 'login', query: { msg: 'Session expired. Please login again.' } })
      }
      return Promise.reject(new Error(`Unauthorized: ${errMsg}`))
    }

    // 일시적 오류면 (네트워크/429/5xx/타임아웃) GET/HEAD/OPTIONS 한정 재시도
    const isTransient =
      !error.response ||
      status === 429 ||
      (typeof status === 'number' && status >= 500) ||
      error.code === 'ECONNABORTED'
    const canRetry = isIdempotent(config?.method)
    const maxRetries = 2

    if (config && isTransient && canRetry) {
      config._retryCount = (config._retryCount ?? 0) + 1
      if (config._retryCount <= maxRetries) {
        const delayMs = 300 * Math.pow(2, config._retryCount - 1) // 300 → 600ms
        await sleep(delayMs)
        return http(config as AxiosRequestConfig)
      }
    }

    // 표준화된 에러 메시지
    switch (status) {
      case 403:
        return Promise.reject(new Error(`Forbidden: ${errMsg}`))
      case 404:
        return Promise.reject(new Error(`Not Found: ${errMsg}`))
      case 500:
      case 502:
      case 503:
        return Promise.reject(new Error(`Server Error: ${errMsg}`))
      default:
        return Promise.reject(new Error(errMsg))
    }
  },
)

export { http }
export default http
