<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categories'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useRoute } from 'vue-router'

const categoryStore = useCategoryStore()
const bookmarkStore = useBookmarkStore()
const newCategoryName = ref('')
const route = useRoute()

const palette = [
  'from-cyan-100 to-cyan-50 text-cyan-700',
  'from-amber-100 to-amber-50 text-amber-700',
  'from-emerald-100 to-emerald-50 text-emerald-700',
  'from-sky-100 to-sky-50 text-sky-700',
  'from-rose-100 to-rose-50 text-rose-700',
]

onMounted(() => {
  categoryStore.fetchCategories()
  bookmarkStore.fetchReadingStats()
})

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  await categoryStore.createCategory(newCategoryName.value.trim())
  newCategoryName.value = ''
}

function readingQuery(state) {
  const query = { ...route.query }
  if (state) {
    query.read = state
  } else {
    delete query.read
  }
  return query
}
</script>

<template>
  <aside class="space-y-4">
    <section class="panel overflow-hidden p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">Bookmarks</h2>
        <span class="rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)]">{{ categoryStore.categories.length + 1 }}</span>
      </div>
      <ul class="space-y-2">
        <li>
          <router-link to="/" custom v-slot="{ navigate, isActive }">
            <button
              @click="navigate"
              type="button"
              class="w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all"
              :class="isActive && !route.params.id
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                : 'border-[var(--line)] bg-white text-[var(--ink-strong)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40'"
            >
              All Bookmarks
            </button>
          </router-link>
        </li>
        <li v-for="(cat, idx) in categoryStore.categories" :key="cat.id">
          <router-link :to="{ name: 'category', params: { id: cat.id } }" custom v-slot="{ navigate, isActive }">
            <button
              @click="navigate"
              type="button"
              class="w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all"
              :class="isActive
                ? 'border-transparent bg-gradient-to-r ' + palette[idx % palette.length] + ' shadow-sm'
                : 'border-[var(--line)] bg-white text-[var(--ink-strong)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40'"
            >
              {{ cat.name }}
            </button>
          </router-link>
        </li>
      </ul>
      <div class="mt-5 border-t border-[var(--line)] pt-4">
      <form @submit.prevent="addCategory" class="flex gap-2">
        <input
          v-model="newCategoryName"
          placeholder="New category"
          class="ui-focus-ring min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          class="cursor-pointer rounded-lg bg-gradient-to-r from-cyan-600 to-teal-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:from-cyan-500 hover:to-teal-600"
        >
          Add
        </button>
      </form>
      </div>
    </section>

    <section class="panel overflow-hidden p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">Reading Lists</h2>
        <span
          v-if="bookmarkStore.isReadingStatsLoading"
          class="h-5 w-11 animate-pulse rounded-full bg-[var(--bg-soft)]"
        ></span>
        <span
          v-else
          class="rounded-full bg-[var(--bg-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)]"
        >{{ bookmarkStore.readingStats.total }}</span>
      </div>
      <ul class="space-y-2">
        <li>
          <router-link :to="{ name: 'home', query: readingQuery('unread') }" custom v-slot="{ navigate }">
            <button
              @click="navigate"
              type="button"
              class="flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all"
              :class="route.name === 'home' && route.query.read === 'unread'
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                : 'border-[var(--line)] bg-white text-[var(--ink-strong)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40'"
            >
              <span>To Read</span>
              <span
                v-if="bookmarkStore.isReadingStatsLoading"
                class="h-5 w-7 animate-pulse rounded-full bg-[var(--bg-soft)]"
              ></span>
              <span
                v-else
                class="rounded-full bg-white/85 px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)]"
              >{{ bookmarkStore.readingStats.unread }}</span>
            </button>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'home', query: readingQuery() }" custom v-slot="{ navigate }">
            <button
              @click="navigate"
              type="button"
              class="flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all"
              :class="route.name === 'home' && !route.query.read
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                : 'border-[var(--line)] bg-white text-[var(--ink-strong)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40'"
            >
              <span>All Reading</span>
              <span
                v-if="bookmarkStore.isReadingStatsLoading"
                class="h-5 w-10 animate-pulse rounded-full bg-[var(--bg-soft)]"
              ></span>
              <span
                v-else
                class="rounded-full bg-white/85 px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)]"
              >{{ bookmarkStore.readingStats.total }}</span>
            </button>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'home', query: readingQuery('read') }" custom v-slot="{ navigate }">
            <button
              @click="navigate"
              type="button"
              class="flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all"
              :class="route.name === 'home' && route.query.read === 'read'
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                : 'border-[var(--line)] bg-white text-[var(--ink-strong)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40'"
            >
              <span>Finished</span>
              <span
                v-if="bookmarkStore.isReadingStatsLoading"
                class="h-5 w-6 animate-pulse rounded-full bg-[var(--bg-soft)]"
              ></span>
              <span
                v-else
                class="rounded-full bg-white/85 px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)]"
              >{{ bookmarkStore.readingStats.read }}</span>
            </button>
          </router-link>
        </li>
      </ul>
    </section>
  </aside>
</template>
