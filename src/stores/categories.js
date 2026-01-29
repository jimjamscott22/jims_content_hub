import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const isLoading = ref(false)

  async function fetchCategories() {
    isLoading.value = true
    try {
      const res = await fetch('/api/categories')
      categories.value = await res.json()
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(name) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    const category = await res.json()
    categories.value.push(category)
    categories.value.sort((a, b) => a.name.localeCompare(b.name))
    return category
  }

  async function updateCategory(id, name) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const updated = await res.json()
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = updated
    return updated
  }

  async function deleteCategory(id) {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return {
    categories, isLoading,
    fetchCategories, createCategory, updateCategory, deleteCategory,
  }
})
