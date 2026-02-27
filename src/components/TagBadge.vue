<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <span class="inline-block rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
    #{{ name }}
  </span>
</template>

