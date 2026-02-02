<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkList from '@/components/BookmarkList.vue'

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()
const readFilter = ref(parseReadFilter(route.query.read))
const fileInput = ref(null)
const isImporting = ref(false)

const stats = computed(() => {
  const total = bookmarkStore.bookmarks.length
  const read = bookmarkStore.bookmarks.filter((bookmark) => bookmark.is_read).length
  const unread = total - read
  const categories = new Set(
    bookmarkStore.bookmarks
      .map((bookmark) => bookmark.category_name)
      .filter(Boolean),
  ).size

  return { total, read, unread, categories }
})

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({
    search: route.query.search || '',
    is_read: readFilter.value,
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

onMounted(loadBookmarks)
watch(() => route.query.search, loadBookmarks)
watch(
  () => route.query.read,
  (value) => {
    readFilter.value = parseReadFilter(value)
  },
)
watch(readFilter, loadBookmarks)
</script>

<template>
  <div class="space-y-5">
    <div class="rounded-2xl border border-[var(--line)] bg-gradient-to-r from-cyan-50 via-white to-amber-50 p-4 md:p-5">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold leading-tight md:text-3xl">All Bookmarks</h1>
          <p class="text-sm text-[var(--ink-muted)]">Organize your links, reading queue, and notes in one place.</p>
        </div>
        <div class="flex flex-wrap gap-2">
        <input type="file" ref="fileInput" accept=".html" @change="handleImport" class="hidden" />
          <button
            @click="fileInput.click()"
            class="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/30 transition-all hover:-translate-y-0.5 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-60"
            :disabled="isImporting"
          >
            <span v-if="isImporting" class="animate-spin text-white">⟳</span>
          <span>{{ isImporting ? 'Importing...' : 'Import HTML' }}</span>
        </button>
          <button
            @click="setReadFilter(undefined)"
            :class="readFilter === undefined ? 'border-transparent bg-cyan-600 text-white shadow-sm shadow-cyan-600/30' : 'border-[var(--line)] bg-white text-[var(--ink-muted)] hover:bg-[var(--bg-soft)]'"
            class="cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
          >
            All
          </button>
          <button
            @click="setReadFilter(0)"
            :class="readFilter === 0 ? 'border-transparent bg-cyan-600 text-white shadow-sm shadow-cyan-600/30' : 'border-[var(--line)] bg-white text-[var(--ink-muted)] hover:bg-[var(--bg-soft)]'"
            class="cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
          >
            Unread
          </button>
          <button
            @click="setReadFilter(1)"
            :class="readFilter === 1 ? 'border-transparent bg-cyan-600 text-white shadow-sm shadow-cyan-600/30' : 'border-[var(--line)] bg-white text-[var(--ink-muted)] hover:bg-[var(--bg-soft)]'"
            class="cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
          >
            Read
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div class="rounded-xl border border-cyan-100 bg-cyan-50/80 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-cyan-700">Total</p>
          <p class="text-xl font-bold text-cyan-900">{{ stats.total }}</p>
        </div>
        <div class="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-amber-700">Unread</p>
          <p class="text-xl font-bold text-amber-900">{{ stats.unread }}</p>
        </div>
        <div class="rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-emerald-700">Read</p>
          <p class="text-xl font-bold text-emerald-900">{{ stats.read }}</p>
        </div>
        <div class="rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-sky-700">Categories</p>
          <p class="text-xl font-bold text-sky-900">{{ stats.categories }}</p>
        </div>
      </div>
    </div>
    <p v-if="bookmarkStore.isLoading" class="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink-muted)]">
      Loading bookmarks...
    </p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>
</template>
