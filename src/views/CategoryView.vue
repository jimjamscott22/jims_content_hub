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
    <h1 class="text-2xl font-bold mb-6">{{ categoryName }}</h1>
    <p v-if="bookmarkStore.isLoading" class="text-gray-500">Loading...</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>
</template>
