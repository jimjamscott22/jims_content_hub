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
    <h1 class="text-2xl font-bold mb-6">Add Bookmark</h1>
    <BookmarkForm @submit="handleSubmit">
      Add Bookmark
    </BookmarkForm>
  </div>
</template>
