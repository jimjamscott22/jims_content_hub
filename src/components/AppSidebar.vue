<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categories'

const categoryStore = useCategoryStore()
const newCategoryName = ref('')

onMounted(() => {
  categoryStore.fetchCategories()
})

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  await categoryStore.createCategory(newCategoryName.value.trim())
  newCategoryName.value = ''
}
</script>

<template>
  <aside class="p-4 border-r border-gray-200 dark:border-gray-700">
    <nav>
      <h2 class="text-sm font-semibold uppercase text-gray-500 mb-2">Categories</h2>
      <ul class="space-y-1">
        <li>
          <router-link to="/" class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            All Bookmarks
          </router-link>
        </li>
        <li v-for="cat in categoryStore.categories" :key="cat.id">
          <router-link
            :to="{ name: 'category', params: { id: cat.id } }"
            class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {{ cat.name }}
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="mt-6">
      <form @submit.prevent="addCategory" class="flex gap-2">
        <input
          v-model="newCategoryName"
          placeholder="New category"
          class="flex-1 px-2 py-1 text-sm border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" class="text-sm px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
          Add
        </button>
      </form>
    </div>
  </aside>
</template>
