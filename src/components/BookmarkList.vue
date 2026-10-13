<script setup>
import BookmarkCard from './BookmarkCard.vue'
import BookmarkTable from './BookmarkTable.vue'
import { ref } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'

defineProps({
  bookmarks: { type: Array, required: true },
  layout: { type: String, default: 'list' },
})

const emit = defineEmits(['changed'])
const bookmarkStore = useBookmarkStore()

const actionError = ref('')
const pendingId = ref(null)
async function runAction(id, action) {
  if (pendingId.value !== null) return
  pendingId.value = id
  actionError.value = ''
  try { await action(id); emit('changed') } catch (error) { actionError.value = error.message } finally { pendingId.value = null }
}
function handleToggleRead(id) { return runAction(id, bookmarkStore.toggleRead) }
function handleToggleFavorite(id) { return runAction(id, bookmarkStore.toggleFavorite) }
function handleDelete(id) {
  if (confirm('Delete this bookmark?')) return runAction(id, bookmarkStore.deleteBookmark)
}
</script>

<template>
  <p v-if="actionError" role="alert" class="notice mb-3">{{ actionError }}</p>
  <BookmarkTable v-if="bookmarks.length && layout === 'table'" :bookmarks="bookmarks" :pending-id="pendingId" @toggle-read="handleToggleRead" @toggle-favorite="handleToggleFavorite" @delete="handleDelete" />
  <TransitionGroup v-else-if="bookmarks.length" name="fade-slide" tag="div" :class="layout === 'grid' ? 'bookmark-grid' : 'border-t border-[var(--line)]'">
    <BookmarkCard
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      :layout="layout"
      :disabled="pendingId === bookmark.id"
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

<style scoped>
.bookmark-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 1rem; }
</style>
