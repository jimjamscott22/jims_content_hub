<script setup>
import BookmarkCard from './BookmarkCard.vue'
import { useBookmarkStore } from '@/stores/bookmarks'

defineProps({
  bookmarks: { type: Array, required: true },
})

const bookmarkStore = useBookmarkStore()

async function handleToggleRead(id) {
  await bookmarkStore.toggleRead(id)
}

async function handleDelete(id) {
  if (confirm('Delete this bookmark?')) {
    await bookmarkStore.deleteBookmark(id)
  }
}
</script>

<template>
  <div v-if="bookmarks.length" class="space-y-3">
    <BookmarkCard
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      @toggle-read="handleToggleRead"
      @delete="handleDelete"
    />
  </div>
  <p v-else class="text-gray-500 text-center py-8">No bookmarks found.</p>
</template>
