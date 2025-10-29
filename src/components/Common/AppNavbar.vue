<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <!-- Left Section: Logo and Nav Links -->
      <div class="flex items-center gap-8">
        <RouterLink to="/" class="flex flex-shrink-0 items-center gap-2">
          <div class="h-6 w-6 rounded bg-[hsl(var(--primary))]"></div>
          <span class="font-semibold">CAPSLOCK</span>
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
          <!-- input: 키보드 숏컷/조합 이벤트는 기존 그대로 유지 -->
          <input
            id="symbol-search-nav"
            v-model="searchQuery"
            type="search"
            class="input w-full bg-slate-900/80 pl-10 pr-9"
            placeholder="Search symbol..."
            autocomplete="off"
            @input="onSearchInput"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @blur="hideSuggestions"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
            aria-autocomplete="list"
            :aria-expanded="showSuggestions"
            role="combobox"
          />
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
                @mousedown="selectSuggestion(s)"
              >
                <span class="font-bold">{{ s.name }}</span>
                <span class="text-slate-400"> — {{ s.symbol }}</span>
              </li>
            </ul>
            <div v-else class="px-4 py-2 text-sm text-slate-400">No results found.</div>
          </div>
        </form>
      </div>

      <!-- Right Section -->
      <div class="flex flex-shrink-0 items-center gap-4">
        <button class="btn-outline hidden sm:block" @click="ui.toggleKillSwitch()">
          <span :class="ui.killSwitch ? 'text-danger' : 'text-slate-300'">Kill Switch</span>
        </button>
        <template v-if="auth.isAuthed">
          <RouterLink
            to="/mypage"
            class="hidden cursor-pointer text-sm text-slate-300 hover:text-white md:block"
            title="마이페이지로 이동"
          >
            Hi, {{ auth.user?.username }}
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
import { ref, onBeforeUpdate, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUiStore } from '@/stores/useUiStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { searchSymbolsUdf, type SymbolSearchItem } from '@/services/tvSymbolApi.ts'

defineOptions({ name: 'AppNavbar' })

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const market = useMarketStore()

const searchQuery = ref('')
const selectedSymbol = ref<string | null>(null)
const suggestions = ref<SymbolSearchItem[]>([])
const showSuggestions = ref(false)
const isSearching = ref(false)
const highlightedIndex = ref(-1)
const itemRefs = ref<Array<HTMLLIElement | null>>([])
let searchTimeout: number | undefined

const isComposing = ref(false)

onBeforeUpdate(() => {
  itemRefs.value = []
})

function onLogout() {
  auth.logout()
  router.push('/')
  ui.pushToast({ type: 'success', message: 'Logged out' })
}

function searchSymbol() {
  const typed = searchQuery.value.trim()
  if (!typed) return

  let symbol = selectedSymbol.value

  // 제안 목록에서 코드 매칭 시도 (사용자가 직접 코드로 입력한 경우 포함)
  if (!symbol) {
    const upper = typed.toUpperCase()
    const hit = suggestions.value.find((s) =>
      [s.rawSymbol, s.symbol].filter(Boolean).some((v) => v!.toUpperCase() === upper),
    )
    if (hit) symbol = hit.rawSymbol ?? hit.symbol
  }

  // 그래도 없으면 "코드처럼 보이는" 직접입력 허용 (예: KRX:005930, 005930.KS)
  if (!symbol && /^[A-Za-z0-9:.]+$/.test(typed)) {
    symbol = typed.toUpperCase()
  }

  if (!symbol) {
    ui.pushToast({ type: 'error', message: '목록에서 종목을 선택하거나 코드로 입력하세요.' })
    return
  }

  market.setSymbol(symbol)
  showSuggestions.value = false
  if (router.currentRoute.value.name !== 'dashboard') {
    router.push({ name: 'dashboard' })
  }
}

function setItemRef(index: number) {
  return (el: Element | import('vue').ComponentPublicInstance | null) => {
    itemRefs.value[index] = el instanceof HTMLLIElement ? el : null
  }
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd(e: CompositionEvent) {
  isComposing.value = false
  triggerSearch()
}

function onSearchInput() {
  if (isComposing.value) return
  selectedSymbol.value = null
  triggerSearch()
}

function normalizeQuery(q: string): { q: string; minChars: number } {
  const trimmed = q.trim()
  if (/^[A-Za-z0-9]+$/.test(trimmed)) {
    // 영문/숫자 → 대문자 변환, 2글자 이상부터 검색
    return { q: trimmed.toUpperCase(), minChars: 2 }
  }
  // 한글/기타 유니코드 → 그대로, 1글자부터 검색 허용
  return { q: trimmed, minChars: 1 }
}

function triggerSearch() {
  window.clearTimeout(searchTimeout)
  const { q, minChars } = normalizeQuery(searchQuery.value)

  if (q.length < minChars) {
    showSuggestions.value = false
    highlightedIndex.value = -1
    return
  }

  isSearching.value = true
  showSuggestions.value = true

  searchTimeout = window.setTimeout(async () => {
    try {
      suggestions.value = await searchSymbolsUdf(q, 20)
    } catch {
      suggestions.value = []
    } finally {
      highlightedIndex.value = -1
      isSearching.value = false
    }
  }, 250)
}

function selectSuggestion(suggestion: SymbolSearchItem) {
  searchQuery.value = suggestion.name
  selectedSymbol.value = suggestion.rawSymbol ?? suggestion.symbol
  showSuggestions.value = false
  searchSymbol()
}

function hideSuggestions() {
  window.setTimeout(() => {
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
  } else if (suggestions.value[0]) {
    selectSuggestion(suggestions.value[0])
  } else {
    searchSymbol()
  }
}
</script>
