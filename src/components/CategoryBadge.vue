<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <span class="inline-block rounded-full border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">
    {{ name }}
  </span>
</template>
