<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useCategoryStore } from '@/stores/categories'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const categoryStore = useCategoryStore()

const searchQuery = ref('')

const ACCENTS = [
  { stripe: '#e11d48', soft: 'rgba(225, 29, 72, 0.09)' },
  { stripe: '#ea580c', soft: 'rgba(234, 88, 12, 0.09)' },
  { stripe: '#ca8a04', soft: 'rgba(202, 138, 4, 0.1)' },
  { stripe: '#9333ea', soft: 'rgba(147, 51, 234, 0.09)' },
  { stripe: '#0d9488', soft: 'rgba(13, 148, 136, 0.1)' },
  { stripe: '#2563eb', soft: 'rgba(37, 99, 235, 0.09)' },
]

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
  const cols = categoryStore.categories.map((cat, idx) => ({
    key: `cat-${cat.id}`,
    id: cat.id,
    name: cat.name,
    bookmarks: list.filter((b) => b.category_id === cat.id),
    accent: ACCENTS[idx % ACCENTS.length],
  }))

  const uncategorized = list.filter((b) => !b.category_id)
  if (uncategorized.length > 0) {
    cols.push({
      key: 'uncat',
      id: null,
      name: 'Uncategorized',
      bookmarks: uncategorized,
      accent: ACCENTS[cols.length % ACCENTS.length],
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

function cardGradient(seed) {
  let hash = 0
  const s = seed || 'x'
  for (let i = 0; i < s.length; i += 1) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  const hueA = Math.abs(hash) % 360
  const hueB = (hueA + 48) % 360
  return `linear-gradient(145deg, hsl(${hueA} 72% 88%), hsl(${hueB} 70% 82%))`
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
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-[0.55] board-page__mesh"
      aria-hidden="true"
    />

    <header class="board-page__hero mb-6 rounded-2xl border border-[var(--line)] p-5 shadow-[var(--shadow-soft)] md:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="board-page__eyebrow mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Board
          </p>
          <h1 class="board-page__title text-3xl font-bold tracking-tight text-[var(--ink-strong)] md:text-4xl">
            Link library
          </h1>
          <p class="mt-1 max-w-xl text-sm text-[var(--ink-muted)]">
            Scan every category at once—columns follow your folders, with quick open and light actions on each row.
          </p>
        </div>
        <dl
          class="flex flex-wrap gap-3 text-sm md:justify-end"
        >
          <div class="board-stat rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] px-4 py-2.5">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Links</dt>
            <dd class="board-page__title text-2xl font-bold tabular-nums text-[var(--ink-strong)]">{{ stats.total }}</dd>
          </div>
          <div class="board-stat rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] px-4 py-2.5">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Folders</dt>
            <dd class="board-page__title text-2xl font-bold tabular-nums text-[var(--ink-strong)]">{{ stats.categories }}</dd>
          </div>
          <div class="board-stat rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] px-4 py-2.5">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Unread</dt>
            <dd class="board-page__title text-2xl font-bold tabular-nums text-[var(--primary-strong)]">{{ stats.unread }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="board-page__search flex flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] px-3 py-2.5 shadow-inner">
          <span class="text-[var(--ink-muted)]" aria-hidden="true">⌕</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Filter this board…"
            class="ui-focus-ring min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--ink-strong)] placeholder:text-[var(--ink-muted)]"
            autocomplete="off"
          />
        </label>
        <router-link
          to="/add"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary-strong)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
        >
          <span class="text-lg leading-none">+</span>
          Add link
        </router-link>
      </div>
    </header>

    <section
      v-if="pinnedItems.length"
      class="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)]/90 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="board-page__subtitle text-sm font-semibold text-[var(--ink-strong)]">Pinned &amp; picks</h2>
        <span class="text-xs font-medium text-[var(--ink-muted)]">Quick open</span>
      </div>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="b in pinnedItems" :key="b.id">
          <a
            :href="b.url"
            target="_blank"
            rel="noopener"
            class="board-pin group flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)]/80 p-3 transition hover:border-[var(--line-strong)] hover:shadow-md"
          >
            <div
              class="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/70 shadow-sm"
              :style="{ background: cardGradient(b.url) }"
            >
              <span class="absolute inset-0 grid place-items-center text-[11px] font-bold text-[var(--ink-strong)]">
                {{ previewLabel(b) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-[var(--primary-strong)] group-hover:underline">
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
      class="rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] px-4 py-4 text-[var(--ink-muted)]"
    >
      Loading your board…
    </p>

    <div
      v-else-if="!bookmarkStore.bookmarks.length"
      class="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--bg-soft)]/50 px-6 py-12 text-center"
    >
      <p class="board-page__subtitle text-lg font-semibold text-[var(--ink-strong)]">Nothing on this board yet</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">
        Add a bookmark or import links from the home view to see them grouped here by category.
      </p>
    </div>

    <div
      v-else-if="searchQuery.trim() && !columns.length"
      class="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--bg-soft)]/50 px-6 py-12 text-center"
    >
      <p class="board-page__subtitle text-lg font-semibold text-[var(--ink-strong)]">No matches</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">Try a different word or clear the filter to see every column again.</p>
    </div>

    <div
      v-else-if="!columns.length"
      class="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--bg-soft)]/50 px-6 py-12 text-center"
    >
      <p class="board-page__subtitle text-lg font-semibold text-[var(--ink-strong)]">Nothing to show in columns</p>
      <p class="mt-2 text-sm text-[var(--ink-muted)]">Add categories from the sidebar or save bookmarks without a folder to populate this view.</p>
    </div>

    <div
      v-else
      class="board-columns flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:thin]"
    >
      <section
        v-for="(col, colIdx) in columns"
        :key="col.key"
        class="board-column flex min-w-[min(100%,280px)] max-w-[320px] shrink-0 flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] shadow-[var(--shadow-soft)]"
        :style="{ animationDelay: `${colIdx * 45}ms` }"
      >
        <div
          class="flex items-start gap-3 border-b border-[var(--line)] px-4 py-3"
          :style="{ background: `linear-gradient(90deg, ${col.accent.soft}, transparent 72%)` }"
        >
          <span
            class="mt-0.5 h-10 w-1 shrink-0 rounded-full"
            :style="{ background: col.accent.stripe }"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <h2 class="board-page__subtitle truncate text-base font-bold text-[var(--ink-strong)]">
              {{ col.name }}
            </h2>
            <p class="text-xs font-medium text-[var(--ink-muted)]">{{ col.bookmarks.length }} saved</p>
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
                class="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/80 shadow-sm"
                :style="{ background: cardGradient(bookmark.url) }"
              >
                <span class="absolute inset-0 grid place-items-center text-[10px] font-bold text-[var(--ink-strong)]">
                  {{ previewLabel(bookmark) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <a
                  :href="bookmark.url"
                  target="_blank"
                  rel="noopener"
                  class="line-clamp-2 text-sm font-semibold leading-snug text-[var(--primary-strong)] hover:underline"
                >
                  {{ bookmark.title }}
                </a>
                <p class="truncate text-xs text-[var(--ink-muted)]">{{ hostLabel(bookmark.url) }}</p>
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-1 border-t border-[var(--line)]/60 bg-[var(--bg-soft)]/40 px-2 py-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
            >
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-muted)] hover:bg-[var(--bg-surface)] hover:text-amber-600"
                :title="bookmark.is_favorite ? 'Remove favorite' : 'Favorite'"
                @click="onToggleFavorite(bookmark.id)"
              >
                {{ bookmark.is_favorite ? '★' : '☆' }}
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-muted)] hover:bg-[var(--bg-surface)]"
                @click="onToggleRead(bookmark.id)"
              >
                {{ bookmark.is_read ? 'Read' : 'Unread' }}
              </button>
              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold text-[var(--primary-strong)] hover:bg-[var(--bg-surface)]"
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
            No links here yet.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@9..144,600;9..144,700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
</style>

<style scoped>
.board-page {
  font-family: 'DM Sans', system-ui, sans-serif;
  --board-title-font: 'Fraunces', Georgia, serif;
}

.board-page__title,
.board-page__subtitle {
  font-family: var(--board-title-font);
}

.board-page__eyebrow,
.board-page__search input {
  font-family: 'DM Sans', system-ui, sans-serif;
}

.board-page__mesh {
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, rgba(15, 154, 168, 0.12), transparent 50%),
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(245, 181, 61, 0.14), transparent 45%),
    linear-gradient(180deg, var(--bg-page) 0%, var(--bg-page) 100%);
}

.board-page__hero {
  background: linear-gradient(
    125deg,
    color-mix(in srgb, var(--bg-surface) 92%, var(--primary) 8%),
    var(--bg-surface) 48%,
    color-mix(in srgb, var(--bg-surface) 94%, var(--accent) 6%)
  );
}

.board-stat {
  min-width: 5.5rem;
}

.board-columns::-webkit-scrollbar {
  height: 8px;
}

.board-columns::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--line-strong) 70%, transparent);
  border-radius: 999px;
}

.board-column {
  animation: boardColIn 0.55s ease both;
}

@keyframes boardColIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.board-row:hover {
  background: color-mix(in srgb, var(--bg-soft) 65%, transparent);
}
</style>
