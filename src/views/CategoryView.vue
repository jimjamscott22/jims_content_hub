<script setup>
import { onMounted, watch, computed, ref } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useCategoryStore } from '@/stores/categories'
import BookmarkList from '@/components/BookmarkList.vue'
import SortDropdown from '@/components/SortDropdown.vue'
import { categoryColor } from '@/utils/categoryColor'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const bookmarkStore = useBookmarkStore()
const categoryStore = useCategoryStore()
const sortOrder = ref('newest')

const categoryName = computed(() => {
  const cat = categoryStore.categories.find(c => c.id === Number(props.id))
  return cat ? cat.name : 'Category'
})

function loadBookmarks() {
  bookmarkStore.fetchBookmarks({ category_id: props.id, sort: sortOrder.value })
}

onMounted(loadBookmarks)
watch(() => props.id, loadBookmarks)
watch(sortOrder, loadBookmarks)
</script>

<template>
  <div>
    <div class="mb-4 flex items-end justify-between gap-3">
      <h1 class="page-title flex items-center gap-3">
        <span class="cat-dot" :style="{ '--cat': categoryColor(id) }" aria-hidden="true"></span>
        {{ categoryName }}
      </h1>
      <SortDropdown v-model="sortOrder" />
    </div>
    <p v-if="bookmarkStore.isLoading" class="notice">Loading bookmarks…</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" />
  </div>
</template>
