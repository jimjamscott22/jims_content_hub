<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <AppHeader />
    <div class="flex max-w-7xl mx-auto">
      <AppSidebar class="hidden md:block w-64 shrink-0" />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
