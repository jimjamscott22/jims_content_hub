<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTagStore } from '@/stores/tags'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const tagStore = useTagStore()
const inputValue = ref('')
const isFocused = ref(false)
const isCreating = ref(false)

onMounted(() => {
  if (!tagStore.tags.length) {
    tagStore.fetchTags()
  }
})

const selectedTags = computed(() =>
  tagStore.tags.filter(t => props.modelValue.includes(t.id))
)

const suggestions = computed(() => {
  if (!inputValue.value.trim()) return tagStore.tags.filter(t => !props.modelValue.includes(t.id))
  const term = inputValue.value.toLowerCase()
  return tagStore.tags.filter(
    t => !props.modelValue.includes(t.id) && t.name.toLowerCase().includes(term)
  )
})

const showSuggestions = computed(() => isFocused.value && (suggestions.value.length > 0 || inputValue.value.trim()))

const exactMatch = computed(() => {
  const term = inputValue.value.trim().toLowerCase()
  return term ? tagStore.tags.find(t => t.name.toLowerCase() === term) : null
})

function addTag(tagId) {
  if (!props.modelValue.includes(tagId)) {
    emit('update:modelValue', [...props.modelValue, tagId])
  }
  inputValue.value = ''
}

function removeTag(tagId) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
}

async function createAndAdd() {
  const name = inputValue.value.trim()
  if (!name) return
  if (exactMatch.value) {
    addTag(exactMatch.value.id)
    return
  }
  isCreating.value = true
  try {
    const tag = await tagStore.createTag(name)
    addTag(tag.id)
  } catch (e) {
    console.error(e)
  } finally {
    isCreating.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    createAndAdd()
  }
}

function handleBlur() {
  // Delay to allow click on suggestion
  setTimeout(() => { isFocused.value = false }, 200)
}
</script>

<template>
  <div>
    <div v-if="selectedTags.length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="tag in selectedTags"
        :key="tag.id"
        class="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700"
      >
        #{{ tag.name }}
        <button
          type="button"
          @click="removeTag(tag.id)"
          class="ml-0.5 cursor-pointer text-violet-400 transition-colors hover:text-violet-700"
        >&times;</button>
      </span>
    </div>
    <div class="relative">
      <input
        v-model="inputValue"
        @focus="isFocused = true"
        @blur="handleBlur"
        @keydown="handleKeydown"
        type="text"
        placeholder="Type to search or create tags..."
        class="ui-focus-ring w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
      />
      <div
        v-if="showSuggestions"
        class="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-auto rounded-lg border border-[var(--line)] bg-white shadow-lg"
      >
        <button
          v-for="tag in suggestions"
          :key="tag.id"
          type="button"
          @mousedown.prevent="addTag(tag.id)"
          class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-[var(--ink-strong)] transition-colors hover:bg-violet-50"
        >
          #{{ tag.name }}
          <span class="ml-1 text-xs text-[var(--ink-muted)]">({{ tag.bookmark_count ?? 0 }})</span>
        </button>
        <button
          v-if="inputValue.trim() && !exactMatch"
          type="button"
          @mousedown.prevent="createAndAdd"
          class="flex w-full cursor-pointer items-center gap-1 border-t border-[var(--line)] px-3 py-1.5 text-left text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50"
          :disabled="isCreating"
        >
          <span>+ Create "{{ inputValue.trim() }}"</span>
        </button>
      </div>
    </div>
  </div>
</template>

