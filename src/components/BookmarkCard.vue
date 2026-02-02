<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CategoryBadge from './CategoryBadge.vue'

const props = defineProps({
  bookmark: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle-read', 'delete'])
const cardRef = ref(null)
const isVisible = ref(false)
let observer

const host = computed(() => {
  try {
    return new URL(props.bookmark.url).hostname.replace('www.', '')
  } catch {
    return 'link'
  }
})

const previewLabel = computed(() => host.value.slice(0, 2).toUpperCase())
const createdAt = computed(() => new Date(props.bookmark.created_at).toLocaleDateString())

function cardGradient(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const hueA = Math.abs(hash) % 360
  const hueB = (hueA + 42) % 360
  return `linear-gradient(135deg, hsl(${hueA} 78% 90%), hsl(${hueB} 84% 84%))`
}

const previewStyle = computed(() => ({ background: cardGradient(props.bookmark.url || props.bookmark.title || 'bookmark') }))

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      })
    },
    { threshold: 0.2 },
  )

  if (cardRef.value) observer.observe(cardRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <article
    ref="cardRef"
    class="bookmark-card rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-22px_rgba(14,36,51,0.65)]"
    :style="{ animationDelay: `${index * 55}ms` }"
    :class="{ 'opacity-70': bookmark.is_read, 'is-visible': isVisible }"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex min-w-0 flex-1 gap-3">
        <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/80 shadow-sm">
          <div class="absolute inset-0" :style="previewStyle"></div>
          <span class="absolute inset-0 grid place-items-center text-sm font-bold tracking-wide text-slate-700">{{ previewLabel }}</span>
        </div>
        <div class="min-w-0">
        <a :href="bookmark.url" target="_blank" rel="noopener"
             class="block truncate text-lg font-semibold text-cyan-700 hover:text-cyan-800 hover:underline">
          {{ bookmark.title }}
        </a>
          <p class="truncate text-sm text-[var(--ink-muted)]">{{ host }}</p>
        <p v-if="bookmark.description" class="mt-1 line-clamp-2 text-sm text-slate-700">
          {{ bookmark.description }}
        </p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
          <CategoryBadge v-if="bookmark.category_name" :name="bookmark.category_name" />
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{{ createdAt }}</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{{ host }}</span>
          </div>
        </div>
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2 pl-0 sm:pl-3">
        <button @click="emit('toggle-read', bookmark.id)"
                class="cursor-pointer rounded-lg border px-2 py-1 text-sm font-semibold transition-colors"
                :class="bookmark.is_read
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'">
          {{ bookmark.is_read ? 'Read' : 'Unread' }}
        </button>
        <router-link :to="{ name: 'edit-bookmark', params: { id: bookmark.id } }"
                    class="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100">
          Edit
        </router-link>
        <button @click="emit('delete', bookmark.id)"
                class="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
          Delete
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.bookmark-card {
  opacity: 0;
  transform: translateY(8px) scale(0.99);
}

.bookmark-card.is-visible {
  animation: cardIn 320ms ease both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
