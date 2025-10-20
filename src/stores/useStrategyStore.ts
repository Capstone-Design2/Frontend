import { defineStore } from 'pinia'
import type { Strategy } from '@/types/Strategy'
// API 서비스 함수들을 임포트합니다.
import { getStrategies, createStrategy, updateStrategy, deleteStrategy } from '@/services/strategy/strategyApi'

export const useStrategyStore = defineStore('strategies', {
  state: () => ({
    strategies: [] as Strategy[],
    // 로딩 상태를 관리할 플래그를 추가합니다.
    isLoading: false,
  }),
  actions: {
    // localStorage 복원 로직을 API 호출로 변경
    async fetchStrategies() {
      this.isLoading = true
      console.log('[useStrategyStore] Fetching strategies...');
      try {
        this.strategies = await getStrategies()
        console.log('[useStrategyStore] Successfully fetched strategies:', this.strategies);
      } catch (error) {
        console.error('[useStrategyStore] Failed to fetch strategies. Error details:', error);
      } finally {
        this.isLoading = false
      }
    },

    // 'create' 액션을 API 호출로 변경
    async create(s: Omit<Strategy, 'id'>) {
      this.isLoading = true
      try {
        const newStrategy = await createStrategy(s)
        this.strategies.push(newStrategy)
      } catch (error) {
        console.error('Failed to create strategy:', error)
        throw error 
      } finally {
        this.isLoading = false
      }
    },

    // 'update' 액션을 API 호출로 변경
    async update(id: string, patch: Partial<Strategy>) {
      this.isLoading = true
      try {
        const updatedStrategy = await updateStrategy(id, patch)
        const index = this.strategies.findIndex(s => s.id === id)
        if (index !== -1) {
          this.strategies[index] = updatedStrategy
        }
      } catch (error) {
        console.error('Failed to update strategy:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 'remove' 액션을 API 호출로 변경
    async remove(id: string) {
      this.isLoading = true
      try {
        await deleteStrategy(id)
        this.strategies = this.strategies.filter(s => s.id !== id)
      } catch (error) {
        console.error('Failed to delete strategy:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    byId(id: string) {
      return this.strategies.find(s => s.id === id)
    }
  }
})