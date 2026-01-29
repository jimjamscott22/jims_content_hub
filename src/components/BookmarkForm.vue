<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categories'

const props = defineProps({
  initialData: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const categoryStore = useCategoryStore()

const form = ref({
  url: props.initialData?.url || '',
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  category_id: props.initialData?.category_id || '',
  is_read: props.initialData?.is_read ? true : false,
})

onMounted(() => {
  if (!categoryStore.categories.length) {
    categoryStore.fetchCategories()
  }
})

function handleSubmit() {
  emit('submit', {
    ...form.value,
    category_id: form.value.category_id || null,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-xl">
    <div>
      <label class="block text-sm font-medium mb-1">URL *</label>
      <input v-model="form.url" type="url" required
             class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Title *</label>
      <input v-model="form.title" type="text" required
             class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Description</label>
      <textarea v-model="form.description" rows="3"
                class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Category</label>
      <select v-model="form.category_id"
              class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">Uncategorized</option>
        <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div class="flex items-center gap-2">
      <input v-model="form.is_read" type="checkbox" id="is_read" class="rounded" />
      <label for="is_read" class="text-sm">Mark as read</label>
    </div>
    <button type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
      <slot>Save</slot>
    </button>
  </form>
</template>
