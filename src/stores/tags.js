import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagStore = defineStore('tags', () => {
  const tags = ref([])
  const isLoading = ref(false)

  async function fetchTags() {
    isLoading.value = true
    try {
      const res = await fetch('/api/tags')
      tags.value = await res.json()
    } finally {
      isLoading.value = false
    }
  }

  async function createTag(name) {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    const tag = await res.json()
    tags.value.push(tag)
    tags.value.sort((a, b) => a.name.localeCompare(b.name))
    return tag
  }

  async function updateTag(id, name) {
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const updated = await res.json()
    const idx = tags.value.findIndex(t => t.id === id)
    if (idx !== -1) tags.value[idx] = updated
    return updated
  }

  async function deleteTag(id) {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    tags.value = tags.value.filter(t => t.id !== id)
  }

  return {
    tags, isLoading,
    fetchTags, createTag, updateTag, deleteTag,
  }
})
