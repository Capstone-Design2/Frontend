import { http } from '@/services/http'
import type { Strategy, StrategyChatRequest, StrategyChatResponse } from '@/types/Strategy'

export const getStrategies = async (): Promise<Strategy[]> => {
  const response = await http.get('strategy/')
  return response.data
}

export const createStrategy = async (strategyData: Omit<Strategy, 'id'>): Promise<Strategy> => {
  const response = await http.post('strategy/', strategyData)
  return response.data
}

export const getStrategyById = async (id: string): Promise<Strategy> => {
  const response = await http.get(`strategy/${id}`)
  return response.data
}

export const updateStrategy = async (
  id: string | number,
  strategyData: Partial<Strategy>,
): Promise<Strategy> => {
  const response = await http.put(`strategy/${id}`, strategyData)
  return response.data
}

export const deleteStrategy = async (id: string | number): Promise<void> => {
  await http.delete(`strategy/${id}`)
}

export const strategyChat = async (request: StrategyChatRequest): Promise<StrategyChatResponse> => {
  const storedSessionId = sessionStorage.getItem('strategy_session_id')

  const response = await http.post('/strategy/chat', {
    content: request.content,
    session_id: storedSessionId ?? null,
  })

  if (response.data?.session_id) {
    sessionStorage.setItem('strategy_session_id', response.data.session_id)
  }

  return response.data
}
