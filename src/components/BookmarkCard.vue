<script setup>
import { computed, ref, watch } from 'vue'
import CategoryBadge from './CategoryBadge.vue'
import TagBadge from './TagBadge.vue'
import BookmarkActions from './BookmarkActions.vue'
import { categoryColor } from '@/utils/categoryColor'
import { safeUrl } from '@/utils/safeUrl'

const props = defineProps({
  bookmark: { type: Object, required: true },
  layout: { type: String, default: 'list' },
  disabled: Boolean,
})

const emit = defineEmits(['toggle-read', 'toggle-favorite', 'delete'])
const hasIconError = ref(false)

const host = computed(() => {
  try {
    return new URL(props.bookmark.url).hostname.replace('www.', '')
  } catch {
    return 'link'
  }
})

const previewLabel = computed(() => host.value.slice(0, 2).toUpperCase())
const createdAt = computed(() =>
  new Date(props.bookmark.created_at).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
)
const iconUrl = computed(() => (hasIconError.value ? '' : props.bookmark.icon_url || ''))

watch(
  () => props.bookmark.icon_url,
  () => {
    hasIconError.value = false
  },
)
</script>

<template>
  <article
    class="bookmark-row"
    :class="{ 'is-read': bookmark.is_read, 'bookmark-grid-card': layout === 'grid' }"
    :style="{ '--cat': categoryColor(bookmark.category_id) }"
  >
    <div class="bookmark-row__icon">
      <img
        v-if="iconUrl"
        :src="iconUrl"
        alt=""
        class="h-full w-full object-contain"
        loading="lazy"
        @error="hasIconError = true"
      />
      <span v-else aria-hidden="true">{{ previewLabel }}</span>
    </div>

    <div class="min-w-0">
      <a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener" class="bookmark-row__title" :title="bookmark.title">
        <span v-if="!bookmark.is_read" class="bookmark-row__unread" title="Unread"></span>{{ bookmark.title }}
      </a>
      <p class="bookmark-row__detail">
        <span class="font-medium">{{ host }}</span>
        <TagBadge v-for="tag in bookmark.tags" :key="tag.id" :name="tag.name" />
        <span v-if="bookmark.description" class="bookmark-row__description">{{ bookmark.description }}</span>
      </p>
    </div>

    <div class="bookmark-row__meta">
      <CategoryBadge v-if="bookmark.category_name" :name="bookmark.category_name" :category-id="bookmark.category_id" />
      <time class="tabular-nums">{{ createdAt }}</time>
    </div>

    <BookmarkActions class="bookmark-row__actions" :bookmark="bookmark" :disabled="disabled"
      @toggle-read="emit('toggle-read', $event)" @toggle-favorite="emit('toggle-favorite', $event)" @delete="emit('delete', $event)" />
  </article>
</template>

<style scoped>
.bookmark-row {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.25rem 0.875rem;
  border-bottom: 1px solid var(--line);
  border-left: 3px solid color-mix(in srgb, var(--cat) var(--cat-keep), white);
  padding: 0.55rem 0.25rem 0.55rem 0.75rem;
}

.bookmark-row:hover {
  background: color-mix(in srgb, var(--bg-soft) 55%, transparent);
}

.bookmark-row__icon {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  overflow: hidden;
  border-radius: 4px;
  background: var(--bg-soft);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--ink-muted);
}

.bookmark-row__title {
  display: block;
  overflow: hidden;
  font-weight: 700;
  color: var(--ink-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-row__title:hover {
  color: var(--primary-strong);
  text-decoration: underline;
}

.bookmark-row.is-read .bookmark-row__title {
  font-weight: 400;
  color: var(--ink-muted);
}

.bookmark-row__unread {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  margin-right: 0.45rem;
  border-radius: 50%;
  background: var(--ribbon);
  vertical-align: 0.12em;
}

.bookmark-row__detail {
  display: flex;
  gap: 0.75rem;
  overflow: hidden;
  font-size: 0.875rem;
  color: var(--ink-muted);
  white-space: nowrap;
}

.bookmark-row__detail > * {
  flex-shrink: 0;
}

.bookmark-row__detail > .bookmark-row__description {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-row__meta {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-size: 0.875rem;
  color: var(--ink-muted);
  white-space: nowrap;
}

.bookmark-row__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.bookmark-row__star {
  font-size: 1rem;
  line-height: 1;
}

.bookmark-row__star.is-on {
  color: var(--accent);
}

@media (max-width: 900px) {
  .bookmark-row {
    grid-template-columns: 1.75rem minmax(0, 1fr);
  }

  .bookmark-row__meta,
  .bookmark-row__actions {
    grid-column: 2;
  }

  .bookmark-row__actions {
    margin-left: -0.4rem;
  }

  .bookmark-row__title {
    white-space: normal;
  }
}
.bookmark-grid-card { grid-template-columns: 2rem minmax(0, 1fr); align-items: start; gap: .75rem; padding: 1rem; border: 1px solid var(--line); border-top: 3px solid color-mix(in srgb, var(--cat) var(--cat-keep), white); border-radius: 6px; background: var(--bg-surface); }
.bookmark-grid-card .bookmark-row__title { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; white-space: normal; overflow-wrap: anywhere; line-height: 1.35; }
.bookmark-grid-card .bookmark-row__detail { display: flex; flex-wrap: wrap; white-space: normal; gap: .4rem .6rem; margin-top: .3rem; }
.bookmark-grid-card .bookmark-row__detail > * { flex-shrink: 1; overflow-wrap: anywhere; }
.bookmark-grid-card .bookmark-row__description { flex-basis: 100%; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; white-space: normal; }
.bookmark-grid-card .bookmark-row__meta { grid-column: 1 / -1; flex-wrap: wrap; gap: .5rem; margin-top: .25rem; }
.bookmark-grid-card .bookmark-row__actions { grid-column: 1 / -1; align-self: end; border-top: 1px solid var(--line); padding-top: .5rem; margin-left: -.4rem; }
</style>
