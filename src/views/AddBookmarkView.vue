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
    <h1 class="page-title mb-1">Add bookmark</h1>
    <p class="mb-6 text-[var(--ink-muted)]">Paste a URL and autofill fetches the title and description.</p>
    <BookmarkForm @submit="handleSubmit">
      Add bookmark
    </BookmarkForm>
  </div>
</template>
