<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkList from '@/components/BookmarkList.vue'

const route = useRoute()
const bookmarkStore = useBookmarkStore()
const readFilter = ref(undefined)
const fileInput = ref(null)
const isImporting = ref(false)

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({
    search: route.query.search || '',
    is_read: readFilter.value,
  })
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
watch(readFilter, loadBookmarks)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">All Bookmarks</h1>
      <div class="flex gap-2">
        <input type="file" ref="fileInput" accept=".html" @change="handleImport" class="hidden" />
        <button @click="fileInput.click()" 
                class="px-3 py-1 text-sm rounded-md bg-green-600 text-white cursor-pointer hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                :disabled="isImporting">
          <span v-if="isImporting" class="animate-spin text-white">⟳</span>
          <span>{{ isImporting ? 'Importing...' : 'Import HTML' }}</span>
        </button>
        <div class="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <button @click="readFilter = undefined"
                :class="readFilter === undefined ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'"
                class="px-3 py-1 text-sm rounded-md cursor-pointer">All</button>
        <button @click="readFilter = 0"
                :class="readFilter === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'"
                class="px-3 py-1 text-sm rounded-md cursor-pointer">Unread</button>
        <button @click="readFilter = 1"
                :class="readFilter === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'"
                class="px-3 py-1 text-sm rounded-md cursor-pointer">Read</button>
      </div>
    </div>
    <p v-if="bookmarkStore.isLoading" class="text-gray-500">Loading...</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>
</template>
