<script setup>
import { onMounted, watch, computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useCategoryStore } from '@/stores/categories'
import BookmarkList from '@/components/BookmarkList.vue'
import SortDropdown from '@/components/SortDropdown.vue'
import BookmarkViewSwitcher from '@/components/BookmarkViewSwitcher.vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookmarkView } from '@/composables/useBookmarkView'
import { categoryColor } from '@/utils/categoryColor'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const bookmarkStore = useBookmarkStore()
const bookmarkView = useBookmarkView()
const categoryStore = useCategoryStore()
const route = useRoute()
const router = useRouter()
const sortOrder = computed({
  get: () => route.query.sort || 'newest',
  set: (sort) => router.replace({ query: { ...route.query, sort } }),
})

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
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h1 class="page-title flex items-center gap-3">
        <span class="cat-dot" :style="{ '--cat': categoryColor(id) }" aria-hidden="true"></span>
        {{ categoryName }}
      </h1>
      <div class="flex flex-wrap items-center gap-2"><BookmarkViewSwitcher v-model="bookmarkView" /><SortDropdown v-model="sortOrder" /></div>
    </div>
    <p v-if="bookmarkStore.isLoading" class="notice">Loading bookmarks…</p>
    <p v-else-if="bookmarkStore.error" class="notice" role="alert">{{ bookmarkStore.error }}</p>
    <BookmarkList v-else :bookmarks="bookmarkStore.bookmarks" :layout="bookmarkView" @changed="loadBookmarks" />
  </div>
</template>
