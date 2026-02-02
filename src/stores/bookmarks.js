import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref([])
  const currentBookmark = ref(null)
  const readingStats = ref({ total: 0, unread: 0, read: 0 })
  const isReadingStatsLoading = ref(false)
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

  async function fetchReadingStats() {
    isReadingStatsLoading.value = true
    try {
      const res = await fetch('/api/bookmarks/stats')
      if (!res.ok) throw new Error('Failed to load reading list stats')
      readingStats.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      isReadingStatsLoading.value = false
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
    await fetchReadingStats()
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
    await fetchReadingStats()
    return updated
  }

  async function toggleRead(id) {
    const res = await fetch(`/api/bookmarks/${id}/toggle-read`, { method: 'PATCH' })
    const updated = await res.json()
    const idx = bookmarks.value.findIndex(b => b.id === id)
    if (idx !== -1) bookmarks.value[idx] = updated
    await fetchReadingStats()
    return updated
  }

  async function deleteBookmark(id) {
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
    await fetchReadingStats()
  }

  async function importBookmarks(file) {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Import failed')
    }

    // Refresh list to show new bookmarks
    await fetchBookmarks()
    await fetchReadingStats()
    return await res.json()
  }

  return {
    bookmarks, currentBookmark, readingStats, isReadingStatsLoading, isLoading, error,
    fetchBookmarks, fetchBookmark, createBookmark,
    updateBookmark, toggleRead, deleteBookmark,
    importBookmarks, fetchReadingStats,
  }
})
