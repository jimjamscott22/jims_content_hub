<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkList from '@/components/BookmarkList.vue'
import SortDropdown from '@/components/SortDropdown.vue'
import CategoryStrip from '@/components/CategoryStrip.vue'

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()
const readFilter = ref(parseReadFilter(route.query.read))
const sortOrder = ref(route.query.sort || 'newest')
const fileInput = ref(null)
const fileInputEnriched = ref(null)
const isImporting = ref(false)
const enrichProgress = ref(null) // { current, total, url } or null when idle

const summary = computed(() => {
  const total = bookmarkStore.bookmarks.length
  const unread = bookmarkStore.bookmarks.filter((bookmark) => !bookmark.is_read).length
  const noun = total === 1 ? 'bookmark' : 'bookmarks'
  return `${total.toLocaleString()} ${noun}, ${unread.toLocaleString()} unread`
})

const readFilters = [
  { value: undefined, label: 'All' },
  { value: 0, label: 'Unread' },
  { value: 1, label: 'Read' },
]

const viewTitle = computed(() => {
  if (route.query.favorites === '1') return 'Favorites'
  if (route.query.tag) return route.query.tag_name ? `Tagged #${route.query.tag_name}` : 'Tagged'
  return route.query.search ? `Results for \u201c${route.query.search}\u201d` : 'All bookmarks'
})

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({
    search: route.query.search || '',
    is_read: readFilter.value,
    is_favorite: route.query.favorites === '1' ? 1 : undefined,
    tag_id: route.query.tag || undefined,
    sort: sortOrder.value,
  })
}

function parseReadFilter(value) {
  if (value === 'unread') return 0
  if (value === 'read') return 1
  return undefined
}

function setReadFilter(value) {
  readFilter.value = value
  const query = { ...route.query }

  if (value === 0) {
    query.read = 'unread'
  } else if (value === 1) {
    query.read = 'read'
  } else {
    delete query.read
  }

  router.replace({ name: 'home', query })
}

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!confirm(`Import bookmarks from "${file.name}"? This will add them to your list.`)) {
    fileInput.value.value = ''
    return
  }

  try {
    isImporting.value = true
    const result = await bookmarkStore.importBookmarks(file)
    alert(result.message)
  } catch (error) {
    alert(`Import failed: ${error.message}`)
  } finally {
    isImporting.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function handleEnrichedImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!confirm(`Import bookmarks from "${file.name}" and auto-fetch metadata for each one?\n\nThis may take a moment for large files.`)) {
    fileInputEnriched.value.value = ''
    return
  }

  enrichProgress.value = { current: 0, total: 0, url: '' }

  try {
    const result = await bookmarkStore.importBookmarksEnriched(file, (progress) => {
      enrichProgress.value = progress
    })
    enrichProgress.value = null
    alert(`Successfully imported ${result.count} bookmarks with metadata.`)
  } catch (error) {
    enrichProgress.value = null
    alert(`Import failed: ${error.message}`)
  } finally {
    if (fileInputEnriched.value) fileInputEnriched.value.value = ''
  }
}

onMounted(loadBookmarks)
watch(() => route.query.search, loadBookmarks)
watch(() => route.query.favorites, loadBookmarks)
watch(() => route.query.tag, loadBookmarks)
watch(
  () => route.query.read,
  (value) => {
    readFilter.value = parseReadFilter(value)
  },
)
watch(readFilter, loadBookmarks)
watch(sortOrder, loadBookmarks)
</script>

<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="page-title">{{ viewTitle }}</h1>
        <p v-if="!bookmarkStore.isLoading" class="mt-1 text-[var(--ink-muted)]">{{ summary }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <input type="file" ref="fileInput" accept=".html" @change="handleImport" class="hidden" />
        <input type="file" ref="fileInputEnriched" accept=".html" @change="handleEnrichedImport" class="hidden" />
        <button type="button" @click="fileInput.click()" class="btn" :disabled="isImporting || !!enrichProgress">
          {{ isImporting ? 'Importing…' : 'Import HTML' }}
        </button>
        <button
          type="button"
          @click="fileInputEnriched.click()"
          class="btn"
          :disabled="isImporting || !!enrichProgress"
          title="Import and fetch the title, description and category for every bookmark"
        >
          Import and autofill
        </button>
      </div>
    </div>

    <CategoryStrip v-if="!bookmarkStore.isLoading" :bookmarks="bookmarkStore.bookmarks" class="mb-5" />

    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div class="read-tabs" role="group" aria-label="Filter by read status">
        <button
          v-for="filter in readFilters"
          :key="filter.label"
          type="button"
          @click="setReadFilter(filter.value)"
          class="read-tabs__tab"
          :class="{ 'is-active': readFilter === filter.value }"
          :aria-pressed="readFilter === filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      <SortDropdown v-model="sortOrder" />
    </div>

    <p v-if="bookmarkStore.isLoading" class="notice">Loading bookmarks…</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>

  <!-- Enriched import progress modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="enrichProgress" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="sheet w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="import-progress-title">
          <h2 id="import-progress-title" class="mb-1 text-lg font-bold">Importing and autofilling</h2>
          <p class="mb-4 text-sm text-[var(--ink-muted)]">Fetching details for each bookmark. Keep this tab open.</p>

          <div class="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ink-muted)]">
            <span>Progress</span>
            <span class="tabular-nums">{{ enrichProgress.current }} of {{ enrichProgress.total }}</span>
          </div>

          <div class="h-2 w-full overflow-hidden rounded-sm bg-[var(--bg-soft)]">
            <div
              class="h-full bg-[var(--primary-strong)] transition-all duration-300"
              :style="{ width: enrichProgress.total ? `${(enrichProgress.current / enrichProgress.total) * 100}%` : '0%' }"
            />
          </div>

          <p v-if="enrichProgress.url" class="mt-3 truncate text-xs text-[var(--ink-muted)]" :title="enrichProgress.url">
            {{ enrichProgress.url }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.read-tabs {
  display: flex;
  gap: 1.25rem;
}

.read-tabs__tab {
  border-bottom: 2px solid transparent;
  padding: 0.25rem 0;
  font-weight: 500;
  color: var(--ink-muted);
  cursor: pointer;
}

.read-tabs__tab:hover {
  color: var(--ink-strong);
}

.read-tabs__tab.is-active {
  border-bottom-color: var(--ink-strong);
  font-weight: 700;
  color: var(--ink-strong);
}
</style>
