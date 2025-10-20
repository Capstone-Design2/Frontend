import axios, { isAxiosError } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router'

export const http = axios.create({ baseURL: 'http://localhost:8000/caps_lock' })

http.interceptors.request.use((config) => {
  // Pinia 스토어는 플러그인이 설치된 후에만 사용할 수 있으므로,
  // 인터셉터 함수 내에서 스토어를 가져오는 것이 안전합니다.
  const { token } = useAuthStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (r) => r,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      switch (status) {
        case 401:
          // 401 오류 발생 시, 인증 정보를 초기화하고 로그인 페이지로 이동시킵니다.
          useAuthStore().logout()
          router.push({ name: 'login', query: { msg: 'Session expired. Please login again.' } })
          return Promise.reject(new Error('Unauthorized: ' + message))
        case 403:
          return Promise.reject(new Error('Forbidden: ' + message))
        case 500:
        case 502:
        case 503:
          return Promise.reject(new Error('Server Error: ' + message))
        default:
          return Promise.reject(new Error(message))
      }
    }
    // Axios 오류가 아닌 경우 (예: 네트워크 오류)
    return Promise.reject(new Error(error.message || 'An unexpected error occurred'))
  },
)

export default http
