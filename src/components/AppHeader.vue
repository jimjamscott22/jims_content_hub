<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchQuery = ref(route.query.search || '')

function handleSearch() {
  router.push({ name: 'home', query: searchQuery.value ? { search: searchQuery.value } : {} })
}

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = value || ''
  },
)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-[var(--line)]/80 glass">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-4">
      <router-link to="/" class="group flex min-w-0 items-center gap-3 whitespace-nowrap">
        <div class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-700 text-lg text-white shadow-lg shadow-cyan-700/35 transition-transform group-hover:scale-105">
          J
        </div>
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold leading-tight text-[var(--ink-strong)]">Jim's Content Hub</p>
          <p class="text-xs text-[var(--ink-muted)]">Bookmarks, reading list, and web notes</p>
        </div>
      </router-link>
      <form @submit.prevent="handleSearch" class="mx-auto hidden w-full max-w-xl md:block">
        <div class="group flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 shadow-sm transition-all focus-within:border-cyan-400 focus-within:shadow-cyan-200/60">
          <span class="text-slate-400">⌕</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search bookmarks, urls, or notes..."
            class="ui-focus-ring w-full border-0 bg-transparent p-0 text-[15px] text-[var(--ink-strong)] placeholder:text-slate-400"
          />
        </div>
      </form>
      <router-link
        to="/add"
        class="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-700/35 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-teal-600 whitespace-nowrap"
      >
        + Add Bookmark
      </router-link>
    </div>
    <div class="mx-auto max-w-7xl px-4 pb-3 md:hidden">
      <form @submit.prevent="handleSearch">
        <div class="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 shadow-sm">
          <span class="text-slate-400">⌕</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search bookmarks..."
            class="ui-focus-ring w-full border-0 bg-transparent p-0 text-[15px] text-[var(--ink-strong)] placeholder:text-slate-400"
          />
        </div>
      </form>
    </div>
  </header>
</template>
