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
    <h1 class="page-title mb-6">Edit bookmark</h1>
    <p v-if="bookmarkStore.isLoading" class="notice">Loading bookmark…</p>
    <p v-else-if="bookmarkStore.error" class="notice text-[var(--danger)]">{{ bookmarkStore.error }}</p>
    <BookmarkForm v-else-if="bookmarkStore.currentBookmark"
                  :initial-data="bookmarkStore.currentBookmark"
                  @submit="handleSubmit">
      Save changes
    </BookmarkForm>
  </div>
</template>
