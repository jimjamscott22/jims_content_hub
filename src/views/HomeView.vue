<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkList from '@/components/BookmarkList.vue'

const route = useRoute()
const bookmarkStore = useBookmarkStore()
const readFilter = ref(undefined)

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({
    search: route.query.search || '',
    is_read: readFilter.value,
  })
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
