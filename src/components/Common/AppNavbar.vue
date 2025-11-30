<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <!-- Left -->
      <div class="flex items-center gap-8">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="logo">CAPSLOCK</span>
        </RouterLink>
        <nav class="hidden items-center gap-6 md:flex">
          <RouterLink class="text-slate-300 hover:text-white" to="/">Dashboard</RouterLink>
          <RouterLink class="text-slate-300 hover:text-white" to="/strategies"
            >Strategies</RouterLink
          >
          <RouterLink class="text-slate-300 hover:text-white" to="/backtest/run"
            >Backtest</RouterLink
          >
        </nav>
      </div>

      <!-- Search -->
      <div class="relative hidden flex-1 items-center justify-center px-8 md:flex">
        <form @submit.prevent="searchSymbol" class="relative w-full max-w-md">
          <!-- Icon -->
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="h-5 w-5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <!-- Input -->
          <input
            ref="inputRef"
            type="search"
            class="input w-full bg-slate-900/80 pl-10 pr-9"
            placeholder="Search symbol..."
            autocomplete="off"
            @input="onSearchInput"
            @blur="onBlur"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
          />
          <!-- Autocomplete List -->
          <div
            v-if="showSuggestions"
            class="absolute left-0 top-full z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-slate-700 bg-slate-800 shadow-lg"
          >
            <div v-if="isSearching" class="px-4 py-2 text-sm text-slate-400">Searching...</div>
            <ul v-else-if="suggestions.length > 0">
              <li
                v-for="(s, index) in suggestions"
                :key="s.rawSymbol || s.symbol"
                :ref="setItemRef(index)"
                :class="[
                  'cursor-pointer px-4 py-2 text-sm hover:bg-slate-700',
                  { 'bg-slate-700': index === highlightedIndex },
                ]"
                @click="selectSuggestion(s)"
              >
                <span class="font-bold">{{ s.name }}</span>
                <span class="text-slate-400"> — {{ s.symbol }}</span>
              </li>
            </ul>
            <div v-else class="px-4 py-2 text-sm text-slate-400">No results found.</div>
          </div>
        </form>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-4">
        <button class="btn-outline hidden sm:block" @click="ui.toggleKillSwitch()">
          <span :class="ui.killSwitch ? 'text-danger' : 'text-slate-300'">Kill Switch</span>
        </button>
        <template v-if="auth.isAuthed">
          <RouterLink to="/mypage" class="hidden text-sm text-slate-300 hover:text-white md:block">
            Hi, {{ auth.user?.name }}
          </RouterLink>
          <button class="btn-primary" @click="onLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink class="btn-outline hidden sm:block" to="/login">Login</RouterLink>
          <RouterLink class="btn-primary" to="/signup">Sign up</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, nextTick, type ComponentPublicInstance } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { searchSymbolsUdf, type SymbolSearchItem } from '@/services/tvSymbolApi'

/*───────────────────────────────
  STATE
───────────────────────────────*/
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const market = useMarketStore()

const inputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const selectedSymbol = ref<string | null>(null)

const suggestions = ref<SymbolSearchItem[]>([])
const isSearching = ref(false)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

const isSelecting = ref(false)

let searchTimeout: number | undefined
const itemRefs = ref<(HTMLLIElement | null)[]>([])

/*───────────────────────────────
  LOGOUT
───────────────────────────────*/
function onLogout() {
  auth.logout()
  router.push('/')
  ui.pushToast({ type: 'success', message: 'Logged out' })
}

/*───────────────────────────────
  INPUT HANDLER
───────────────────────────────*/
function onSearchInput() {
  if (isSelecting.value) return

  searchQuery.value = inputRef.value?.value ?? ''
  selectedSymbol.value = null

  triggerSearch()
}

/*───────────────────────────────
  NORMALIZE QUERY
───────────────────────────────*/
function normalizeQuery(q: string) {
  const t = q.trim()
  if (/^[A-Za-z0-9]+$/.test(t)) return { q: t.toUpperCase(), minChars: 2 }
  return { q: t, minChars: 1 }
}

/*───────────────────────────────
  SEARCH SUGGESTIONS
───────────────────────────────*/
function triggerSearch() {
  window.clearTimeout(searchTimeout)
  const { q, minChars } = normalizeQuery(searchQuery.value)

  if (q.length < minChars) {
    showSuggestions.value = false
    return
  }

  showSuggestions.value = true
  isSearching.value = true

  searchTimeout = window.setTimeout(async () => {
    try {
      suggestions.value = await searchSymbolsUdf(q, 20)
    } catch {
      suggestions.value = []
    } finally {
      isSearching.value = false
      highlightedIndex.value = -1
    }
  }, 200)
}

/*───────────────────────────────
  SELECT SUGGESTION (1 CLICK!)
───────────────────────────────*/
function selectSuggestion(s: SymbolSearchItem) {
  isSelecting.value = true

  selectedSymbol.value = s.rawSymbol ?? s.symbol
  showSuggestions.value = false

  searchSymbol()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isSelecting.value = false
    })
  })
}

/*───────────────────────────────
  APPLY SYMBOL
───────────────────────────────*/
function searchSymbol() {
  const symbol = selectedSymbol.value
  const typed = searchQuery.value.trim()

  // 1) suggestion 선택 우선
  if (symbol) {
    market.setSymbol(symbol)
    showSuggestions.value = false

    if (router.currentRoute.value.name !== 'dashboard') {
      router.push({ name: 'dashboard' })
    }
    return
  }

  // 2) 직접 코드 입력
  const upper = typed.toUpperCase()
  let final = null

  const hit = suggestions.value.find((s) =>
    [s.rawSymbol, s.symbol].filter(Boolean).some((v) => v!.toUpperCase() === upper),
  )

  if (hit) final = hit.rawSymbol ?? hit.symbol
  if (!final && /^[A-Za-z0-9:.]+$/.test(typed)) final = upper

  if (!final) {
    ui.pushToast({ type: 'error', message: '목록에서 선택하거나 코드로 입력하세요.' })
    return
  }

  market.setSymbol(final)
  showSuggestions.value = false

  if (router.currentRoute.value.name !== 'dashboard') {
    router.push({ name: 'dashboard' })
  }
}

/*───────────────────────────────
  BLUR (safe)
───────────────────────────────*/
function onBlur() {
  // 클릭하는 동안 blur 무시
  setTimeout(() => {
    if (!isSelecting.value) showSuggestions.value = false
  }, 100)
}

/*───────────────────────────────
  ARROWS / ENTER
───────────────────────────────*/
function setItemRef(i: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    itemRefs.value[i] = el as HTMLLIElement | null
  }
}

async function onArrowDown() {
  if (!suggestions.value.length) return
  highlightedIndex.value = (highlightedIndex.value + 1) % suggestions.value.length
  await nextTick()
  itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
}

async function onArrowUp() {
  if (!suggestions.value.length) return
  highlightedIndex.value =
    (highlightedIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  await nextTick()
  itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
}

function onEnter() {
  if (highlightedIndex.value !== -1) selectSuggestion(suggestions.value[highlightedIndex.value])
  else if (suggestions.value[0]) selectSuggestion(suggestions.value[0])
  else searchSymbol()
}
</script>

<style scoped>
.logo {
  font-family: 'Satoshi', 'Inter', sans-serif;
  font-weight: 900;
  font-size: 34px;
  letter-spacing: 4px;
}
</style>
