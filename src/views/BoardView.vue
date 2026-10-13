<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useCategoryStore } from '@/stores/categories'
import { categoryColor } from '@/utils/categoryColor'
import { safeUrl } from '@/utils/safeUrl'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const categoryStore = useCategoryStore()

const searchQuery = ref('')

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    bookmarkStore.fetchBookmarks({ sort: 'newest' }),
  ])
})

const filteredBookmarks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return bookmarkStore.bookmarks
  return bookmarkStore.bookmarks.filter((b) => {
    const hay = [b.title, b.url, b.description, b.category_name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const columns = computed(() => {
  const list = filteredBookmarks.value
  const hasSearch = !!searchQuery.value.trim()
  const cols = categoryStore.categories.map((cat) => ({
    key: `cat-${cat.id}`,
    id: cat.id,
    name: cat.name,
    bookmarks: list.filter((b) => b.category_id === cat.id),
    color: categoryColor(cat.id),
  }))

  const uncategorized = list.filter((b) => !b.category_id)
  if (uncategorized.length > 0) {
    cols.push({
      key: 'uncat',
      id: null,
      name: 'Uncategorized',
      bookmarks: uncategorized,
      color: categoryColor(null),
    })
  }

  if (hasSearch) {
    return cols.filter((c) => c.bookmarks.length > 0)
  }
  return cols
})

const pinnedItems = computed(() => {
  const favs = bookmarkStore.bookmarks.filter((b) => b.is_favorite)
  const pool = favs.length ? favs : bookmarkStore.bookmarks
  return pool.slice(0, 4)
})

const stats = computed(() => {
  const list = filteredBookmarks.value
  const unread = list.filter((b) => !b.is_read).length
  return {
    total: list.length,
    categories: categoryStore.categories.length,
    unread,
  }
})

function hostLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
}

function previewLabel(bookmark) {
  const h = hostLabel(bookmark.url)
  return h.slice(0, 2).toUpperCase()
}

async function onToggleRead(id) {
  await bookmarkStore.toggleRead(id)
}

async function onToggleFavorite(id) {
  await bookmarkStore.toggleFavorite(id)
}

function goEdit(id) {
  router.push({ name: 'edit-bookmark', params: { id } })
}
</script>

<template>
  <div class="board-page relative">
    <header class="mb-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="page-title">
            Board
          </h1>
          <p class="mt-1 max-w-xl text-sm text-[var(--ink-muted)]">
            Every category side by side, one column each.
          </p>
        </div>
        <dl
          class="flex flex-wrap gap-6 md:justify-end"
        >
          <div class="board-stat">
            <dt class="text-sm text-[var(--ink-muted)]">Bookmarks</dt>
            <dd class="text-xl font-bold tabular-nums">{{ stats.total }}</dd>
          </div>
          <div class="board-stat">
            <dt class="text-sm text-[var(--ink-muted)]">Categories</dt>
            <dd class="text-xl font-bold tabular-nums">{{ stats.categories }}</dd>
          </div>
          <div class="board-stat">
            <dt class="text-sm text-[var(--ink-muted)]">Unread</dt>
            <dd class="text-xl font-bold tabular-nums">{{ stats.unread }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="search-box flex-1">
          <span class="sr-only">Filter this board</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Filter this board"
            class="ui-focus-ring min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--ink-strong)] placeholder:text-[var(--ink-muted)]"
            autocomplete="off"
          />
        </label>
      </div>
    </header>

    <section
      v-if="pinnedItems.length"
      class="mb-6"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="text-base font-semibold">Favorites</h2>
      </div>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="b in pinnedItems" :key="b.id">
          <a
            :href="safeUrl(b.url)"
            target="_blank"
            rel="noopener"
            class="group flex gap-3 rounded-md border border-[var(--line)] p-3 hover:border-[var(--line-strong)] hover:bg-[var(--bg-soft)]"
          >
            <div
              class="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-[var(--bg-soft)]"
            >
              <span class="absolute inset-0 grid place-items-center text-[11px] font-bold text-[var(--ink-muted)]">
                {{ previewLabel(b) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold group-hover:underline">
                {{ b.title }}
              </p>
              <p class="truncate text-xs text-[var(--ink-muted)]">{{ hostLabel(b.url) }}</p>
            </div>
          </a>
        </li>
      </ul>
    </section>

    <p
      v-if="bookmarkStore.isLoading"
      class="notice"
    >
      Loading bookmarks…
    </p>

    <div
      v-else-if="!bookmarkStore.bookmarks.length"
      class="notice py-10 text-center"
    >
      <p class="text-lg font-semibold text-[var(--ink-strong)]">No bookmarks yet</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">
        Add a bookmark, or import a browser export from All bookmarks, and it appears here under its category.
      </p>
    </div>

    <div
      v-else-if="searchQuery.trim() && !columns.length"
      class="notice py-10 text-center"
    >
      <p class="text-lg font-semibold text-[var(--ink-strong)]">No matches</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">Try a different word, or clear the filter to see every column.</p>
    </div>

    <div
      v-else-if="!columns.length"
      class="notice py-10 text-center"
    >
      <p class="text-lg font-semibold text-[var(--ink-strong)]">No categories yet</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">Add a category in the sidebar to start a column.</p>
    </div>

    <div
      v-else
      class="board-columns flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:thin]"
    >
      <section
        v-for="col in columns"
        :key="col.key"
        class="board-column flex min-w-[min(100%,280px)] max-w-[320px] shrink-0 flex-col rounded-md border border-[var(--line)]"
        :style="{ '--cat': col.color }"
      >
        <div class="board-column__head border-b border-[var(--line)] px-4 py-3">
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-bold">
              {{ col.name }}
            </h2>
            <p class="text-sm text-[var(--ink-muted)]">{{ col.bookmarks.length }} {{ col.bookmarks.length === 1 ? 'bookmark' : 'bookmarks' }}</p>
          </div>
        </div>

        <ul class="flex max-h-[min(68vh,720px)] flex-col gap-0 overflow-y-auto">
          <li
            v-for="bookmark in col.bookmarks"
            :key="bookmark.id"
            class="board-row group border-b border-[var(--line)]/80 last:border-b-0"
          >
            <div class="flex items-start gap-2.5 px-3 py-2.5">
              <div
                class="relative mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded bg-[var(--bg-soft)]"
              >
                <span class="absolute inset-0 grid place-items-center text-[10px] font-bold text-[var(--ink-muted)]">
                  {{ previewLabel(bookmark) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <a
                  :href="safeUrl(bookmark.url)"
                  target="_blank"
                  rel="noopener"
                  class="line-clamp-2 text-sm leading-snug hover:underline"
                  :class="bookmark.is_read ? 'text-[var(--ink-muted)]' : 'font-bold text-[var(--ink-strong)]'"
                >
                  {{ bookmark.title }}
                </a>
                <p class="truncate text-xs text-[var(--ink-muted)]">{{ hostLabel(bookmark.url) }}</p>
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-1 px-2 pb-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            >
              <button
                type="button"
                class="text-action"
                :class="{ 'text-[var(--accent)]': bookmark.is_favorite }"
                :aria-label="bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
                :title="bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
                @click="onToggleFavorite(bookmark.id)"
              >
                {{ bookmark.is_favorite ? '★' : '☆' }}
              </button>
              <button
                type="button"
                class="text-action"
                @click="onToggleRead(bookmark.id)"
              >
                {{ bookmark.is_read ? 'Mark unread' : 'Mark read' }}
              </button>
              <button
                type="button"
                class="text-action"
                @click="goEdit(bookmark.id)"
              >
                Edit
              </button>
            </div>
          </li>
          <li
            v-if="!col.bookmarks.length"
            class="px-4 py-8 text-center text-sm text-[var(--ink-muted)]"
          >
            No bookmarks in this category.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.board-columns::-webkit-scrollbar {
  height: 8px;
}

.board-columns::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--line-strong) 70%, transparent);
  border-radius: 999px;
}

.board-column__head {
  border-top: 4px solid color-mix(in srgb, var(--cat) var(--cat-keep), white);
  border-radius: 5px 5px 0 0;
}

.board-row:hover {
  background: color-mix(in srgb, var(--bg-soft) 55%, transparent);
}
</style>
