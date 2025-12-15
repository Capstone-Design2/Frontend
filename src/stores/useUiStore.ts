import { defineStore } from 'pinia'

export interface Toast { id: string; message: string; type?: 'info'|'success'|'error'|'buy'|'sell'; timeout?: number }

export const useUiStore = defineStore('ui', {
  state: () => ({
    killSwitch: false as boolean,
    toasts: [] as Toast[],
    theme: 'dark' as 'dark'|'light',
  }),
  actions: {
    toggleKillSwitch() { this.killSwitch = !this.killSwitch },
    pushToast(t: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).slice(2)
      const toast = { id, timeout: 4000, type: 'info', ...t }
      this.toasts.push(toast)
      setTimeout(() => this.removeToast(id), toast.timeout)
    },
    removeToast(id: string) { this.toasts = this.toasts.filter(t => t.id !== id) },
  }
})
