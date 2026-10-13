<script setup>
defineProps({ bookmark: { type: Object, required: true }, showRead: { type: Boolean, default: true }, disabled: Boolean })
const emit = defineEmits(['toggle-read', 'toggle-favorite', 'delete'])
</script>

<template>
  <div class="bookmark-actions">
    <button type="button" class="text-action favorite" :class="{ 'is-on': bookmark.is_favorite }"
      :disabled="disabled" :aria-pressed="!!bookmark.is_favorite"
      :aria-label="bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
      :title="bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
      @click="emit('toggle-favorite', bookmark.id)">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" :fill="bookmark.is_favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.6l6.2-.9Z" /></svg>
    </button>
    <button v-if="showRead" type="button" class="text-action" :disabled="disabled" @click="emit('toggle-read', bookmark.id)">{{ bookmark.is_read ? 'Mark unread' : 'Mark read' }}</button>
    <router-link :to="{ name: 'edit-bookmark', params: { id: bookmark.id } }" class="text-action">Edit</router-link>
    <button type="button" class="text-action text-action--danger" :disabled="disabled" @click="emit('delete', bookmark.id)">Delete</button>
  </div>
</template>

<style scoped>
.bookmark-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .125rem; }
.favorite { display: inline-flex; align-items: center; }
.favorite.is-on { color: var(--accent); }
button:disabled { opacity: .5; cursor: wait; }
</style>
