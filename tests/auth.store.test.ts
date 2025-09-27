import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'
import { signupApi } from '@/mock/api'

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('handles login, logout and restore with persistence', async () => {
    await signupApi({ username: 'tester', email: 't@e.st', password: 'secret12' })
    const store = useAuthStore()
    await store.login({ username: 'tester', password: 'secret12' })
    expect(store.isAuthed).toBe(true)
    expect(localStorage.getItem('auth.token')).toBeTruthy()

    store.logout()
    expect(store.isAuthed).toBe(false)

    const store2 = useAuthStore()
    store2.restore()
    // Not authed until a token exists again
    expect(store2.isAuthed).toBe(false)

    await store2.login({ username: 'tester', password: 'secret12' })
    const store3 = useAuthStore()
    store3.restore()
    expect(store3.isAuthed).toBe(true)
    expect(store3.user?.username).toBe('tester')
  })
})
