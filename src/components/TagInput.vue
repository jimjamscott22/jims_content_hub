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
        class="inline-flex items-center gap-1 rounded bg-[var(--bg-soft)] py-0.5 pl-2 pr-1 text-sm"
      >
        #{{ tag.name }}
        <button
          type="button"
          @click="removeTag(tag.id)"
          :aria-label="`Remove tag ${tag.name}`"
          class="cursor-pointer rounded px-1 text-[var(--ink-muted)] hover:text-[var(--danger)]"
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
        aria-label="Tags"
        placeholder="Type to find a tag or create one"
        class="field"
      />
      <div
        v-if="showSuggestions"
        class="sheet absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-auto"
      >
        <button
          v-for="tag in suggestions"
          :key="tag.id"
          type="button"
          @mousedown.prevent="addTag(tag.id)"
          class="w-full cursor-pointer px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-soft)]"
        >
          #{{ tag.name }}
          <span class="ml-1 text-xs text-[var(--ink-muted)]">{{ tag.bookmark_count ?? 0 }}</span>
        </button>
        <button
          v-if="inputValue.trim() && !exactMatch"
          type="button"
          @mousedown.prevent="createAndAdd"
          class="w-full cursor-pointer border-t border-[var(--line)] px-3 py-1.5 text-left text-sm font-semibold text-[var(--primary-strong)] hover:bg-[var(--bg-soft)]"
          :disabled="isCreating"
        >
          Create tag "{{ inputValue.trim() }}"
        </button>
      </div>
    </div>
  </div>
</template>
