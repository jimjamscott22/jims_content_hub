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

const isFetching = ref(false)

onMounted(() => {
  if (!categoryStore.categories.length) {
    categoryStore.fetchCategories()
  }
})

async function fetchMetadata() {
  if (!form.value.url) return
  isFetching.value = true
  try {
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(form.value.url)}`)
    if (!res.ok) throw new Error('Failed to fetch metadata')
    const data = await res.json()
    
    if (data.title) form.value.title = data.title
    if (data.description) form.value.description = data.description

    // Auto-organize attempt
    if (!form.value.category_id) {
      const text = (data.title + ' ' + data.description).toLowerCase()
      const match = categoryStore.categories.find(c => text.includes(c.name.toLowerCase()))
      if (match) {
        form.value.category_id = match.id
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    isFetching.value = false
  }
}

function handleSubmit() {
  emit('submit', {
    ...form.value,
    category_id: form.value.category_id || null,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="panel max-w-2xl space-y-4 p-4 md:p-5">
    <div>
      <label class="mb-1 block text-sm font-semibold">URL *</label>
      <div class="flex gap-2">
        <input v-model="form.url" type="url" required
               @blur="!form.title && fetchMetadata()"
               class="ui-focus-ring w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2" />
        <button type="button" @click="fetchMetadata" :disabled="isFetching"
                class="cursor-pointer whitespace-nowrap rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50">
          {{ isFetching ? '...' : 'Auto-fill' }}
        </button>
      </div>
    </div>
    <div>
      <label class="mb-1 block text-sm font-semibold">Title *</label>
      <input v-model="form.title" type="text" required
             class="ui-focus-ring w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2" />
    </div>
    <div>
      <label class="mb-1 block text-sm font-semibold">Description</label>
      <textarea v-model="form.description" rows="3"
                class="ui-focus-ring w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2"></textarea>
    </div>
    <div>
      <label class="mb-1 block text-sm font-semibold">Category</label>
      <select v-model="form.category_id"
              class="ui-focus-ring w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2">
        <option value="">Uncategorized</option>
        <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div class="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2">
      <input v-model="form.is_read" type="checkbox" id="is_read" class="h-4 w-4 rounded accent-cyan-600" />
      <label for="is_read" class="text-sm font-medium">Mark as read</label>
    </div>
    <button type="submit"
            class="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 px-4 py-2 font-semibold text-white shadow-md shadow-cyan-700/35 transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-teal-600">
      <slot>Save</slot>
    </button>
  </form>
</template>
