<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <span class="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
    {{ name }}
  </span>
</template>
