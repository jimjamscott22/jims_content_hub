<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

function handleSearch() {
  router.push({ name: 'home', query: searchQuery.value ? { search: searchQuery.value } : {} })
}
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <router-link to="/" class="text-xl font-bold whitespace-nowrap text-indigo-600 dark:text-indigo-400">
        Jim's Content Hub
      </router-link>
      <form @submit.prevent="handleSearch" class="flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search bookmarks..."
          class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </form>
      <router-link to="/add" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap">
        + Add Bookmark
      </router-link>
    </div>
  </header>
</template>
