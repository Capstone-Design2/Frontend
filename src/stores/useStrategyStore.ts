import { defineStore } from 'pinia'
import type { Strategy } from '@/types/Strategy'
import { migrateStrategy, STRATEGY_SCHEMA_VERSION, strategySchema } from '@/utils/validation'

const KEY = 'strategies.v1'

export const useStrategyStore = defineStore('strategies', {
  state: () => ({ strategies: [] as Strategy[] }),
  actions: {
    restore() {
      const raw = localStorage.getItem(KEY)
      if (!raw) return
      try {
        const arr = JSON.parse(raw)
        this.strategies = (arr as any[]).map((s) => migrateStrategy(s))
      } catch { this.strategies = [] }
    },
    persist() { localStorage.setItem(KEY, JSON.stringify(this.strategies)) },
    create(s: Strategy) {
      const parsed = strategySchema.parse(s)
      const item: Strategy = { ...parsed, schemaVersion: STRATEGY_SCHEMA_VERSION, id: crypto.randomUUID() }
      this.strategies.push(item); this.persist()
    },
    update(id: string, patch: Partial<Strategy>) {
      const idx = this.strategies.findIndex(s => s.id === id)
      if (idx !== -1) {
        const merged = { ...this.strategies[idx], ...patch }
        const parsed = strategySchema.parse(merged)
        this.strategies[idx] = parsed
        this.persist()
      }
    },
    remove(id: string) { this.strategies = this.strategies.filter(s => s.id !== id); this.persist() },
    byId(id: string) { return this.strategies.find(s => s.id === id) }
  }
})
