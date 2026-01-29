import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref([])
  const currentBookmark = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchBookmarks(filters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.is_read !== undefined) params.set('is_read', filters.is_read)

      const queryString = params.toString()
      const url = '/api/bookmarks' + (queryString ? `?${queryString}` : '')
      const res = await fetch(url)
      bookmarks.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBookmark(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`/api/bookmarks/${id}`)
      if (!res.ok) throw new Error('Bookmark not found')
      currentBookmark.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function createBookmark(data) {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    const bookmark = await res.json()
    bookmarks.value.unshift(bookmark)
    return bookmark
  }

  async function updateBookmark(id, data) {
    const res = await fetch(`/api/bookmarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    const updated = await res.json()
    const idx = bookmarks.value.findIndex(b => b.id === id)
    if (idx !== -1) bookmarks.value[idx] = updated
    return updated
  }

  async function toggleRead(id) {
    const res = await fetch(`/api/bookmarks/${id}/toggle-read`, { method: 'PATCH' })
    const updated = await res.json()
    const idx = bookmarks.value.findIndex(b => b.id === id)
    if (idx !== -1) bookmarks.value[idx] = updated
    return updated
  }

  async function deleteBookmark(id) {
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
  }

  return {
    bookmarks, currentBookmark, isLoading, error,
    fetchBookmarks, fetchBookmark, createBookmark,
    updateBookmark, toggleRead, deleteBookmark,
  }
})
