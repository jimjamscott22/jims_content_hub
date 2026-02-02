<script setup>
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkForm from '@/components/BookmarkForm.vue'

const router = useRouter()
const bookmarkStore = useBookmarkStore()

async function handleSubmit(data) {
  await bookmarkStore.createBookmark(data)
  router.push('/')
}
</script>

<template>
  <div>
    <h1 class="mb-2 text-3xl font-bold">Add Bookmark</h1>
    <p class="mb-6 text-sm text-[var(--ink-muted)]">Drop in a URL and let auto-fill pull details for you.</p>
    <BookmarkForm @submit="handleSubmit">
      Add Bookmark
    </BookmarkForm>
  </div>
</template>
