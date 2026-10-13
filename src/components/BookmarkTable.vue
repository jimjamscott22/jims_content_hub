<script setup>
import CategoryBadge from './CategoryBadge.vue'
import TagBadge from './TagBadge.vue'
import BookmarkActions from './BookmarkActions.vue'
import { safeUrl } from '@/utils/safeUrl'
defineProps({ bookmarks: { type: Array, required: true }, pendingId: { type: Number, default: null } })
const emit = defineEmits(['toggle-read', 'toggle-favorite', 'delete'])
function host(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'link' }
}
function saved(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="table-scroll" role="region" aria-label="Bookmark table, scroll horizontally for all columns" tabindex="0">
    <table>
      <caption class="sr-only">Saved bookmarks</caption>
      <thead><tr><th scope="col">Bookmark</th><th scope="col">Category</th><th scope="col">Tags</th><th scope="col">Status</th><th scope="col">Saved</th><th scope="col">Actions</th></tr></thead>
      <tbody>
        <tr v-for="bookmark in bookmarks" :key="bookmark.id">
          <td class="title-cell"><a :href="safeUrl(bookmark.url)" target="_blank" rel="noopener" :title="bookmark.title" :class="{ 'is-read': bookmark.is_read }">{{ bookmark.title }}</a><span class="domain">{{ host(bookmark.url) }}</span></td>
          <td><CategoryBadge v-if="bookmark.category_name" :name="bookmark.category_name" :category-id="bookmark.category_id" /><span v-else class="muted">Uncategorized</span></td>
          <td><div class="tags"><TagBadge v-for="tag in bookmark.tags" :key="tag.id" :name="tag.name" /><span v-if="!bookmark.tags?.length" class="muted">—</span></div></td>
          <td><button type="button" class="read-status text-action" :class="{ unread: !bookmark.is_read }" :disabled="pendingId === bookmark.id" :aria-label="bookmark.is_read ? 'Mark unread' : 'Mark read'" @click="emit('toggle-read', bookmark.id)"><span aria-hidden="true"></span>{{ bookmark.is_read ? 'Read' : 'Unread' }}</button></td>
          <td class="date"><time :datetime="bookmark.created_at">{{ saved(bookmark.created_at) }}</time></td>
          <td><BookmarkActions :bookmark="bookmark" :show-read="false" :disabled="pendingId === bookmark.id" @toggle-favorite="emit('toggle-favorite', $event)" @delete="emit('delete', $event)" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: 6px; }
table { width: 100%; min-width: 850px; border-collapse: collapse; font-size: .875rem; text-align: left; }
th { background: var(--bg-soft); font-weight: 600; white-space: nowrap; }
th, td { padding: .65rem .75rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: color-mix(in srgb, var(--bg-soft) 35%, transparent); }
.title-cell { width: 35%; min-width: 220px; max-width: 340px; overflow-wrap: anywhere; }
.title-cell a { font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
td:last-child { min-width: 130px; }
.title-cell a:hover { color: var(--primary-strong); text-decoration: underline; }
.title-cell a.is-read { font-weight: 400; color: var(--ink-muted); }
.domain, .muted { color: var(--ink-muted); }
.domain { display: block; margin-top: .15rem; }
.tags { display: flex; flex-wrap: wrap; gap: .25rem .5rem; overflow-wrap: anywhere; min-width: 90px; }
.date { white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--ink-muted); }
.read-status { display: inline-flex; align-items: center; gap: .4rem; background: var(--bg-soft); }
.read-status span { width: .45rem; height: .45rem; border-radius: 50%; background: var(--primary-strong); }
.read-status.unread { color: var(--ribbon); background: color-mix(in srgb, var(--ribbon) 9%, var(--bg-surface)); }
.read-status.unread span { background: var(--ribbon); }
</style>
