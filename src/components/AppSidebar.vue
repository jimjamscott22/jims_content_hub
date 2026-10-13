<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categories'
import { useBookmarkStore } from '@/stores/bookmarks'
import { useTagStore } from '@/stores/tags'
import { useRoute } from 'vue-router'
import { categoryColor } from '@/utils/categoryColor'

const categoryStore = useCategoryStore()
const bookmarkStore = useBookmarkStore()
const tagStore = useTagStore()
const newCategoryName = ref('')
const route = useRoute()

onMounted(() => {
  categoryStore.fetchCategories()
  bookmarkStore.fetchReadingStats()
  tagStore.fetchTags()
})

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  await categoryStore.createCategory(newCategoryName.value.trim())
  newCategoryName.value = ''
}

function readingQuery(state) {
  const query = { ...route.query }
  if (state) {
    query.read = state
  } else {
    delete query.read
  }
  return query
}

function isReadingActive(state) {
  return route.name === 'home' && (route.query.read || '') === state
}
</script>

<template>
  <aside class="space-y-6 text-[15px]">
    <nav aria-label="Library">
      <ul>
        <li>
          <router-link
            to="/"
            class="side-link"
            :class="{ 'is-active': route.name === 'home' && !route.query.favorites && !route.query.tag }"
          >
            All bookmarks
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'home', query: { favorites: '1' } }"
            class="side-link"
            :class="{ 'is-active': route.query.favorites === '1' }"
          >
            Favorites
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'board' }" class="side-link" :class="{ 'is-active': route.name === 'board' }">
            Board
          </router-link>
        </li>
      </ul>
    </nav>

    <section>
      <h2 class="side-heading">Reading</h2>
      <ul>
        <li>
          <router-link
            :to="{ name: 'home', query: readingQuery('unread') }"
            class="side-link"
            :class="{ 'is-active': isReadingActive('unread') }"
          >
            <span>Unread</span>
            <span v-if="!bookmarkStore.isReadingStatsLoading" class="side-count">{{ bookmarkStore.readingStats.unread }}</span>
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'home', query: readingQuery('read') }"
            class="side-link"
            :class="{ 'is-active': isReadingActive('read') }"
          >
            <span>Read</span>
            <span v-if="!bookmarkStore.isReadingStatsLoading" class="side-count">{{ bookmarkStore.readingStats.read }}</span>
          </router-link>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="side-heading">Categories</h2>
      <ul>
        <li v-for="cat in categoryStore.categories" :key="cat.id">
          <router-link
            :to="{ name: 'category', params: { id: cat.id } }"
            class="side-link"
            :class="{ 'is-active': route.name === 'category' && Number(route.params.id) === cat.id }"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span class="cat-dot" :style="{ '--cat': categoryColor(cat.id) }" aria-hidden="true"></span>
              <span class="truncate">{{ cat.name }}</span>
            </span>
          </router-link>
        </li>
      </ul>
      <form @submit.prevent="addCategory" class="mt-2 flex gap-2">
        <input
          v-model="newCategoryName"
          placeholder="New category"
          aria-label="New category name"
          class="field min-w-0 flex-1 text-sm"
        />
        <button type="submit" class="btn text-sm">Add</button>
      </form>
    </section>

    <section v-if="tagStore.tags.length">
      <h2 class="side-heading">Tags</h2>
      <div class="flex flex-wrap gap-x-3 gap-y-1 px-2">
        <router-link
          v-for="tag in tagStore.tags"
          :key="tag.id"
          :to="{ name: 'home', query: { tag: tag.id, tag_name: tag.name } }"
          class="side-tag"
          :class="{ 'is-active': route.query.tag == tag.id }"
        >
          #{{ tag.name }}
          <span class="side-count">{{ tag.bookmark_count ?? 0 }}</span>
        </router-link>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.side-heading {
  margin-bottom: 0.25rem;
  padding: 0 0.5rem;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--ink-muted);
}

.side-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  color: var(--ink-strong);
}

.side-link:hover {
  background: var(--bg-soft);
}

.side-link.is-active {
  background: var(--bg-soft);
  font-weight: 700;
}

.side-count {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
  color: var(--ink-muted);
}

.side-tag {
  font-size: 0.875rem;
  color: var(--ink-muted);
}

.side-tag:hover,
.side-tag.is-active {
  color: var(--ink-strong);
  text-decoration: underline;
}

.side-tag.is-active {
  font-weight: 700;
}
</style>
