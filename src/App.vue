<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen text-[var(--ink-strong)]">
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"></div>
      <div class="absolute top-20 right-0 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"></div>
    </div>
    <AppHeader />
    <div class="max-w-7xl mx-auto px-4 pb-8">
      <div class="flex flex-col gap-4 pt-4 md:flex-row md:items-start">
        <AppSidebar class="w-full shrink-0 md:sticky md:top-24 md:w-72" />
        <main class="min-w-0 flex-1 panel p-4 md:p-6">
        <router-view />
      </main>
      </div>
    </div>
  </div>
</template>
