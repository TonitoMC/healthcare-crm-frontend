<template>
  <div class="flex flex-column h-screen surface-ground">
    <!-- 🧭 Top bar -->
    <AppNavbar class="flex-none" />

    <!-- 🧱 Main area fills remaining space -->
    <main class="flex-1 flex flex-column overflow-hidden min-h-0">
      <router-view class="flex-1 flex flex-column min-h-0 overflow-hidden" />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "@components/AppNavbar.vue";
</script>
