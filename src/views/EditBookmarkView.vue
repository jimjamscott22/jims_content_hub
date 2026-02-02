<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarks'
import BookmarkForm from '@/components/BookmarkForm.vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const bookmarkStore = useBookmarkStore()

onMounted(() => {
  bookmarkStore.fetchBookmark(props.id)
})

async function handleSubmit(data) {
  await bookmarkStore.updateBookmark(Number(props.id), data)
  router.push('/')
}
</script>

<template>
  <div>
    <h1 class="mb-2 text-3xl font-bold">Edit Bookmark</h1>
    <p class="mb-6 text-sm text-[var(--ink-muted)]">Update link details, category, and read status.</p>
    <p v-if="bookmarkStore.isLoading" class="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink-muted)]">Loading...</p>
    <p v-else-if="bookmarkStore.error" class="text-red-500">{{ bookmarkStore.error }}</p>
    <BookmarkForm v-else-if="bookmarkStore.currentBookmark"
                  :initial-data="bookmarkStore.currentBookmark"
                  @submit="handleSubmit">
      Save Changes
    </BookmarkForm>
  </div>
</template>
