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
  <TransitionGroup v-if="bookmarks.length" name="fade-slide" tag="div" class="space-y-3">
    <BookmarkCard
      v-for="(bookmark, idx) in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      :index="idx"
      @toggle-read="handleToggleRead"
      @delete="handleDelete"
    />
  </TransitionGroup>
  <div v-else class="grid place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-white px-4 py-14 text-center">
    <div class="max-w-sm">
      <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--bg-soft)] text-2xl">🔎</div>
      <p class="text-lg font-semibold">No bookmarks found</p>
      <p class="text-sm text-[var(--ink-muted)]">Try another search, toggle filters, or add your first bookmark.</p>
    </div>
  </div>
</template>
