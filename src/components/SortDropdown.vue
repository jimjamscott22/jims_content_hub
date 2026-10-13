<script setup>
defineProps({
  modelValue: { type: String, default: 'newest' },
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'Title A to Z' },
  { value: 'za', label: 'Title Z to A' },
]
</script>

<template>
  <select
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target).value)"
    aria-label="Sort order"
    class="btn"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

