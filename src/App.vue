<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()
const shellMaxClass = computed(() =>
  route.meta.layoutWide ? 'max-w-[min(1760px,100%)]' : 'max-w-7xl',
)
</script>

<template>
  <div class="min-h-screen text-[var(--ink-strong)]">
    <AppHeader />
    <div class="mx-auto px-4 pb-10" :class="shellMaxClass">
      <div class="flex flex-col gap-6 pt-5 md:flex-row md:items-start">
        <AppSidebar class="w-full shrink-0 md:sticky md:top-20 md:w-60" />
        <main class="sheet min-w-0 flex-1 p-4 md:p-6">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
