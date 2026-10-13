<script setup>
import { computed } from 'vue'
import { categoryColor } from '@/utils/categoryColor'

const props = defineProps({
  bookmarks: { type: Array, required: true },
})

const segments = computed(() => {
  const byCategory = new Map()
  for (const bookmark of props.bookmarks) {
    const id = bookmark.category_id || null
    const segment = byCategory.get(id) || {
      id,
      name: bookmark.category_name || 'Uncategorized',
      count: 0,
    }
    segment.count += 1
    byCategory.set(id, segment)
  }

  return [...byCategory.values()]
    .sort((a, b) => (a.id === null) - (b.id === null) || b.count - a.count)
    .map((segment) => ({
      ...segment,
      color: categoryColor(segment.id),
      label: `${segment.name}, ${segment.count} ${segment.count === 1 ? 'bookmark' : 'bookmarks'}`,
    }))
})
</script>

<template>
  <nav v-if="segments.length > 1" class="category-strip" aria-label="Bookmarks by category">
    <component
      :is="segment.id ? 'router-link' : 'span'"
      v-for="segment in segments"
      :key="segment.id ?? 'none'"
      :to="segment.id ? { name: 'category', params: { id: segment.id } } : undefined"
      class="category-strip__segment"
      :style="{ flexGrow: segment.count, background: segment.color }"
      :title="segment.label"
      :aria-label="segment.label"
    >
      <span class="category-strip__name">{{ segment.name }}</span>
      <span class="category-strip__count">{{ segment.count }}</span>
    </component>
  </nav>
</template>

<style scoped>
.category-strip {
  display: flex;
  gap: 2px;
  height: 3rem;
  overflow: hidden;
  border-radius: 4px;
}

.category-strip__segment {
  container-type: inline-size;
  display: flex;
  flex: 1 0 10px;
  flex-direction: column;
  justify-content: center;
  min-width: 10px;
  padding: 0 0.5rem;
  overflow: hidden;
  color: #fff;
  line-height: 1.15;
}

a.category-strip__segment:hover,
a.category-strip__segment:focus-visible {
  filter: brightness(1.15);
}

a.category-strip__segment:focus-visible {
  outline-offset: -3px;
  outline-color: #fff;
}

.category-strip__name {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-strip__count {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}

/* A spine too narrow to read keeps its colour and tooltip only. */
@container (max-width: 3.5rem) {
  .category-strip__name,
  .category-strip__count {
    display: none;
  }
}
</style>
