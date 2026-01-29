<script setup>
import CategoryBadge from './CategoryBadge.vue'

defineProps({
  bookmark: { type: Object, required: true },
})

const emit = defineEmits(['toggle-read', 'delete'])
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
       :class="{ 'opacity-60': bookmark.is_read }">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <a :href="bookmark.url" target="_blank" rel="noopener"
           class="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
          {{ bookmark.title }}
        </a>
        <p class="text-sm text-gray-500 truncate">{{ bookmark.url }}</p>
        <p v-if="bookmark.description" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ bookmark.description }}
        </p>
        <div class="mt-2 flex items-center gap-2">
          <CategoryBadge v-if="bookmark.category_name" :name="bookmark.category_name" />
          <span class="text-xs text-gray-400">{{ new Date(bookmark.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button @click="emit('toggle-read', bookmark.id)"
                class="text-sm px-2 py-1 rounded-md border cursor-pointer"
                :class="bookmark.is_read
                  ? 'border-green-500 text-green-600'
                  : 'border-gray-300 text-gray-500'">
          {{ bookmark.is_read ? 'Read' : 'Unread' }}
        </button>
        <router-link :to="{ name: 'edit-bookmark', params: { id: bookmark.id } }"
                     class="text-sm px-2 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">
          Edit
        </router-link>
        <button @click="emit('delete', bookmark.id)"
                class="text-sm px-2 py-1 rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
