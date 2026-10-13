<script setup>
defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <span>#{{ name }}</span>
</template>
