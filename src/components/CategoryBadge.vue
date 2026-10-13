<script setup>
import { categoryColor } from '@/utils/categoryColor'

defineProps({
  name: { type: String, required: true },
  categoryId: { type: Number, default: null },
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span class="cat-dot" :style="{ '--cat': categoryColor(categoryId) }" aria-hidden="true"></span>
    {{ name }}
  </span>
</template>
