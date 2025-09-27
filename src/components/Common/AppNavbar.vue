<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <RouterLink to="/" class="flex items-center gap-2">
        <div class="h-6 w-6 rounded bg-[hsl(var(--primary))]"></div>
        <span class="font-semibold">CAPSLOCK</span>
      </RouterLink>

      <!-- 검색창 -->
      <div class="relative hidden flex-grow items-center justify-center md:flex">
        <form @submit.prevent="searchSymbol" class="relative w-full max-w-md">
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
          <input
            id="symbol-search-nav"
            v-model="searchQuery"
            type="search"
            class="input w-full bg-slate-900/80 pl-10"
            placeholder="Search symbol..."
            autocomplete="off"
            @input="onSearchInput"
            @blur="hideSuggestions"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
          />
          <div
            v-if="showSuggestions"
            class="absolute left-0 top-full z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-slate-700 bg-slate-800 shadow-lg"
          >
            <div v-if="isSearching" class="px-4 py-2 text-sm text-slate-400">Searching...</div>
            <ul v-else-if="suggestions.length > 0">
              <li
                v-for="(s, index) in suggestions"
                :key="s.symbol"
                :ref="
                  (el) => {
                    if (el) itemRefs[index] = el
                  }
                "
                :class="[
                  'cursor-pointer px-4 py-2 text-sm hover:bg-slate-700',
                  { 'bg-slate-700': index === highlightedIndex },
                ]"
                @mousedown="selectSuggestion(s)"
              >
                <span class="font-bold">{{ s.symbol }}</span> -
                <span class="text-slate-400">{{ s.name }}</span>
              </li>
            </ul>
            <div v-else class="px-4 py-2 text-sm text-slate-400">No results found.</div>
          </div>
        </form>
      </div>

      <nav class="hidden items-center gap-6 md:flex">
        <RouterLink class="text-slate-300 hover:text-white" to="/">Dashboard</RouterLink>
        <RouterLink class="text-slate-300 hover:text-white" to="/strategies">Strategies</RouterLink>
        <RouterLink class="text-slate-300 hover:text-white" to="/backtest/run">Backtest</RouterLink>
        <RouterLink class="text-slate-300 hover:text-white" to="/mypage">My Page</RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <button class="btn-outline" @click="ui.toggleKillSwitch()">
          <span :class="ui.killSwitch ? 'text-danger' : 'text-slate-300'">Kill Switch</span>
        </button>
        <template v-if="auth.isAuthed">
          <span class="hidden text-sm text-slate-300 md:block">Hi, {{ auth.user?.username }}</span>
          <button class="btn-primary" @click="onLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink class="btn-outline" to="/login">Login</RouterLink>
          <RouterLink class="btn-primary" to="/signup">Sign up</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUpdate, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { searchSymbols, type SymbolSearchResult } from '@/services/alphaVantage'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const market = useMarketStore()

const searchQuery = ref('')
const suggestions = ref<SymbolSearchResult[]>([])
const showSuggestions = ref(false)
const isSearching = ref(false)
const highlightedIndex = ref(-1)
const itemRefs = ref<HTMLLIElement[]>([])
let searchTimeout: number | undefined

// suggestions가 변경될 때마다 itemRefs 배열을 초기화합니다.
onBeforeUpdate(() => {
  itemRefs.value = []
})

function onLogout() {
  auth.logout()
  router.push('/')
  ui.pushToast({ type: 'success', message: 'Logged out' })
}

function searchSymbol() {
  const newSymbol = searchQuery.value.trim().toUpperCase()
  if (!newSymbol) return

  const isValidSymbol = suggestions.value.some((s) => s.symbol === newSymbol)

  if (showSuggestions.value && suggestions.value.length > 0 && !isValidSymbol) {
    alert('Please select a valid symbol from the list.')
    return
  }

  market.setSymbol(newSymbol)
  showSuggestions.value = false
  // 검색 후 대시보드 페이지가 아니라면 이동합니다.
  if (router.currentRoute.value.name !== 'dashboard') {
    router.push({ name: 'dashboard' })
  }
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    showSuggestions.value = false
    highlightedIndex.value = -1
    return
  }
  isSearching.value = true
  showSuggestions.value = true
  searchTimeout = setTimeout(async () => {
    try {
      suggestions.value = await searchSymbols(searchQuery.value.toUpperCase())
    } catch (error) {
      console.error('Symbol search failed:', error)
      suggestions.value = []
    } finally {
      highlightedIndex.value = -1
      isSearching.value = false
    }
  }, 300)
}

function selectSuggestion(suggestion: SymbolSearchResult) {
  searchQuery.value = suggestion.symbol
  showSuggestions.value = false
  searchSymbol()
}

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 200)
}

async function onArrowDown() {
  if (suggestions.value.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + 1) % suggestions.value.length
  await nextTick()
  itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
}

async function onArrowUp() {
  if (suggestions.value.length === 0) return
  highlightedIndex.value =
    (highlightedIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  await nextTick()
  itemRefs.value[highlightedIndex.value]?.scrollIntoView({ block: 'nearest' })
}

function onEnter() {
  if (highlightedIndex.value !== -1) {
    selectSuggestion(suggestions.value[highlightedIndex.value])
  } else {
    searchSymbol()
  }
}
</script>
