<script setup>
defineProps({
  modelValue: { type: String, default: 'newest' },
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
]
</script>

<template>
  <select
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target).value)"
    class="ui-focus-ring cursor-pointer rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink-muted)] transition-colors hover:bg-[var(--bg-soft)]"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

