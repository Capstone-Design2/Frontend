/**
 * Paper Trading API Service
 * 모의투자 REST API 호출
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE}/caps_lock/api/paper-trading`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러 처리
      localStorage.removeItem('auth.token')
      localStorage.removeItem('auth.user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ========== 타입 정의 ==========

export interface Account {
  account_id: number
  user_id: number
  initial_balance: number
  current_balance: number
  total_asset_value: number
  is_active: boolean
}

export interface Order {
  order_id: number
  account_id: number
  ticker_id: number
  strategy_id: number | null
  order_type: 'MARKET' | 'LIMIT' | 'STOP'
  side: 'BUY' | 'SELL'
  quantity: number
  limit_price: number | null
  status: 'PENDING' | 'PARTIAL' | 'FILLED' | 'CANCELED'
  submitted_at: string
  completed_at: string | null
}

export interface Position {
  position_id: number
  account_id: number
  ticker_id: number
  quantity: number
  average_buy_price: number
}

export interface Balance {
  account_id: number
  current_balance: number
  total_position_value: number
  total_asset_value: number
  initial_balance: number
  profit_loss: number
  is_active: boolean
}

export interface OrderRequest {
  ticker_code: string
  side: 'BUY' | 'SELL'
  quantity: number
  order_type?: 'MARKET' | 'LIMIT' | 'STOP'
  limit_price?: number
  strategy_id?: number
}

// ========== API 함수 ==========

/**
 * 계좌 생성 또는 조회
 */
export async function createAccount(initialBalance: number = 10000000): Promise<Account> {
  const response = await api.post<Account>('/account', {
    initial_balance: initialBalance,
  })
  return response.data
}

/**
 * 계좌 정보 조회
 */
export async function getAccount(): Promise<Account> {
  const response = await api.get<Account>('/account')
  return response.data
}

/**
 * 계좌 초기화
 */
export async function resetAccount(): Promise<Account> {
  const response = await api.post<Account>('/account/reset')
  return response.data
}

/**
 * 계좌 활성화/비활성화 토글
 */
export async function toggleAccount(isActive: boolean): Promise<Account> {
  const response = await api.patch<Account>(`/account/toggle?is_active=${isActive}`)
  return response.data
}

/**
 * 주문 제출
 */
export async function submitOrder(request: OrderRequest): Promise<Order> {
  const response = await api.post<Order>('/order', request)
  return response.data
}

/**
 * 주문 취소
 */
export async function cancelOrder(orderId: number): Promise<Order> {
  const response = await api.delete<Order>(`/order/${orderId}`)
  return response.data
}

/**
 * 주문 목록 조회
 */
export async function getOrders(limit: number = 100): Promise<Order[]> {
  const response = await api.get<Order[]>(`/orders?limit=${limit}`)
  return response.data
}

/**
 * 포지션 목록 조회
 */
export async function getPositions(): Promise<Position[]> {
  const response = await api.get<Position[]>('/positions')
  return response.data
}

/**
 * 잔고 조회
 */
export async function getBalance(): Promise<Balance> {
  const response = await api.get<Balance>('/balance')
  return response.data
}
