<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const searchQuery = ref(route.query.search || '')
const themeStore = useThemeStore()
const { effectiveTheme } = storeToRefs(themeStore)
const isDarkMode = computed(() => effectiveTheme.value === 'dark')
const themeButtonLabel = computed(() =>
  isDarkMode.value ? 'Switch to light mode' : 'Switch to dark mode',
)

function handleSearch() {
  router.push({ name: 'home', query: searchQuery.value ? { search: searchQuery.value } : {} })
}

function handleThemeToggle() {
  themeStore.toggleTheme()
}

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = value || ''
  },
)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg-page)]">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-5">
      <router-link to="/" class="flex min-w-0 items-center gap-2.5 whitespace-nowrap">
        <span class="brand-ribbon" aria-hidden="true"></span>
        <span class="brand-name truncate">Jim's content hub</span>
      </router-link>
      <form @submit.prevent="handleSearch" role="search" class="mx-auto hidden w-full max-w-xl md:block">
        <label class="search-box">
          <span class="sr-only">Search bookmarks</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search titles, URLs and descriptions"
            class="ui-focus-ring w-full border-0 bg-transparent p-0 text-[15px] text-[var(--ink-strong)] placeholder:text-[var(--ink-muted)]"
          />
        </label>
      </form>
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          @click="handleThemeToggle"
          :aria-label="themeButtonLabel"
          :title="themeButtonLabel"
          class="btn"
        >
          {{ isDarkMode ? 'Light' : 'Dark' }}
        </button>
        <router-link to="/add" class="btn btn-primary">Add bookmark</router-link>
      </div>
    </div>
    <div class="mx-auto max-w-7xl px-4 pb-3 md:hidden">
      <form @submit.prevent="handleSearch" role="search">
        <label class="search-box">
          <span class="sr-only">Search bookmarks</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search bookmarks"
            class="ui-focus-ring w-full border-0 bg-transparent p-0 text-[15px] text-[var(--ink-strong)] placeholder:text-[var(--ink-muted)]"
          />
        </label>
      </form>
    </div>
  </header>
</template>

<style scoped>
.brand-name {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* A ribbon bookmark: the one place the ribbon colour appears outside unread marks. */
.brand-ribbon {
  width: 0.8rem;
  height: 1.35rem;
  flex-shrink: 0;
  background: var(--ribbon);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
}
</style>
