<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categories'
import TagInput from './TagInput.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const categoryStore = useCategoryStore()

const form = ref({
  url: props.initialData?.url || '',
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  icon_url: props.initialData?.icon_url || '',
  category_id: props.initialData?.category_id || '',
  is_read: props.initialData?.is_read ? true : false,
  is_favorite: props.initialData?.is_favorite ? true : false,
  tag_ids: props.initialData?.tags?.map(t => t.id) || [],
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
    form.value.icon_url = data.icon_url || ''

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
    icon_url: form.value.icon_url || null,
    category_id: form.value.category_id || null,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="max-w-2xl space-y-4">
    <div>
      <label for="bookmark-url" class="field-label">URL</label>
      <div class="flex gap-2">
        <input id="bookmark-url" v-model="form.url" type="url" required
               @blur="!form.title && fetchMetadata()"
               class="field" />
        <button type="button" @click="fetchMetadata" :disabled="isFetching" class="btn">
          {{ isFetching ? 'Fetching…' : 'Autofill' }}
        </button>
      </div>
    </div>
    <div>
      <label for="bookmark-title" class="field-label">Title</label>
      <input id="bookmark-title" v-model="form.title" type="text" required class="field" />
    </div>
    <div>
      <label for="bookmark-description" class="field-label">Description</label>
      <textarea id="bookmark-description" v-model="form.description" rows="3" class="field"></textarea>
    </div>
    <div>
      <label for="bookmark-category" class="field-label">Category</label>
      <select id="bookmark-category" v-model="form.category_id" class="field">
        <option value="">Uncategorized</option>
        <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
    <div>
      <span class="field-label">Tags</span>
      <TagInput v-model="form.tag_ids" />
    </div>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
      <label class="flex items-center gap-2">
        <input v-model="form.is_read" type="checkbox" class="h-4 w-4 accent-[var(--primary-strong)]" />
        Mark as read
      </label>
      <label class="flex items-center gap-2">
        <input v-model="form.is_favorite" type="checkbox" class="h-4 w-4 accent-[var(--primary-strong)]" />
        Favorite
      </label>
    </div>
    <button type="submit" class="btn btn-primary">
      <slot>Save</slot>
    </button>
  </form>
</template>
