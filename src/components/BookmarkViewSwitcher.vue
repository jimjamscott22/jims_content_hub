<script setup>
defineProps({ modelValue: { type: String, default: 'list' } })
const emit = defineEmits(['update:modelValue'])
const views = ['List', 'Table', 'Grid']
</script>

<template>
  <div class="view-switcher" role="group" aria-label="Bookmark view">
    <button v-for="view in views" :key="view" type="button"
      :aria-pressed="modelValue === view.toLowerCase()"
      @click="emit('update:modelValue', view.toLowerCase())">{{ view }}</button>
  </div>
</template>

<style scoped>
.view-switcher { display: inline-flex; border: 1px solid var(--line-strong); border-radius: 6px; padding: 2px; }
button { padding: .35rem .75rem; border-radius: 4px; font-size: .9375rem; font-weight: 600; line-height: 1.3; cursor: pointer; }
button:hover { background: var(--bg-soft); }
button[aria-pressed='true'] { background: var(--primary-strong); color: var(--on-primary); }
</style>
