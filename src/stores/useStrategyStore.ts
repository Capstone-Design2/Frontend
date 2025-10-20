import { defineStore } from 'pinia'
import type { Strategy } from '@/types/Strategy'
import { getStrategies, createStrategy, updateStrategy, deleteStrategy, getStrategyById } from '@/services/strategy/strategyApi'

export const useStrategyStore = defineStore('strategies', {
  state: () => ({
    strategies: [] as Strategy[],
    isLoading: false,
  }),
  actions: {
    async fetchStrategies() {
      this.isLoading = true
      try {
        this.strategies = await getStrategies()
      } catch (error) {
        console.error('Failed to fetch strategies:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchStrategyById(id: string | number) {
      this.isLoading = true
      try {
        const fetchedStrategy = await getStrategyById(id as string)
        const index = this.strategies.findIndex(s => s.strategy_id === fetchedStrategy.strategy_id)
        if (index !== -1) {
          this.strategies[index] = fetchedStrategy
        } else {
          this.strategies.push(fetchedStrategy)
        }
        return fetchedStrategy;
      } catch (error) {
        console.error(`Failed to fetch strategy with id ${id}:`, error)
        throw error;
      } finally {
        this.isLoading = false
      }
    },

    async create(s: Partial<Strategy>) {
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

    async update(id: string | number, patch: Partial<Strategy>) {
      this.isLoading = true
      try {
        const updatedStrategy = await updateStrategy(id, patch)
        const index = this.strategies.findIndex(s => s.strategy_id === updatedStrategy.strategy_id)
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

    async remove(id: string | number) {
      this.isLoading = true
      try {
        await deleteStrategy(id)
        this.strategies = this.strategies.filter(s => s.strategy_id !== id)
      } catch (error) {
        console.error('Failed to delete strategy:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
  }
})