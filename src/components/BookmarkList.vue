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

async function handleToggleFavorite(id) {
  await bookmarkStore.toggleFavorite(id)
}

async function handleDelete(id) {
  if (confirm('Delete this bookmark?')) {
    await bookmarkStore.deleteBookmark(id)
  }
}
</script>

<template>
  <TransitionGroup v-if="bookmarks.length" name="fade-slide" tag="div" class="border-t border-[var(--line)]">
    <BookmarkCard
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      @toggle-read="handleToggleRead"
      @toggle-favorite="handleToggleFavorite"
      @delete="handleDelete"
    />
  </TransitionGroup>
  <div v-else class="notice py-10 text-center">
    <p class="text-lg font-semibold text-[var(--ink-strong)]">No bookmarks match</p>
    <p class="mt-1 text-sm">
      Clear the search or filter, or
      <router-link to="/add" class="font-semibold text-[var(--primary-strong)] underline">add a bookmark</router-link>.
    </p>
  </div>
</template>
