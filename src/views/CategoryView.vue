<script setup>
import { onMounted, watch, computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useCategoryStore } from '@/stores/categories'
import BookmarkList from '@/components/BookmarkList.vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const bookmarkStore = useBookmarkStore()
const categoryStore = useCategoryStore()

const categoryName = computed(() => {
  const cat = categoryStore.categories.find(c => c.id === Number(props.id))
  return cat ? cat.name : 'Category'
})

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({ category_id: props.id })
}

onMounted(loadBookmarks)
watch(() => props.id, loadBookmarks)
</script>

<template>
  <div>
    <h1 class="mb-4 text-3xl font-bold">{{ categoryName }}</h1>
    <p v-if="bookmarkStore.isLoading" class="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink-muted)]">Loading...</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>
</template>
